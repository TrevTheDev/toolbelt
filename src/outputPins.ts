/* eslint-disable @typescript-eslint/no-explicit-any */
import { capitalise } from './smallUtils'
import { Identity } from './typescript utils'

export type PinDef = Record<string, [arg: unknown]> // { [pinName: string]: [arg: unknown] }

type OutputPinGetter<
  Pins extends PinDef,
  DefaultPin extends keyof Pins = keyof Pins,
  RT = Identity<
    {
      readonly setPin: DefaultPin
    } & {
      readonly [I in keyof Pins]: I extends DefaultPin ? Pins[I][0] : never
    } & {
      [I in keyof Pins as `is${Capitalize<string & I>}`]: () => I extends DefaultPin ? true : false
    } & {
      value(): Pins[DefaultPin][0]
    }
  > &
    (() => Pins[DefaultPin][0]),
> = RT

type OutputPinSetter<
  Pins extends PinDef,
  DefaultPin extends keyof Pins,
  RT = Identity<
    {
      [I in keyof Pins]: (...args: Pins[I]) => OutputPinGetter<Pins, I>
    } & {
      readonly awaiters: {
        [I in keyof Pins as `on${Capitalize<string & I>}`]: (
          callback: (...args: Pins[I]) => void,
        ) => void
      }
    }
  > &
    ((...args: Pins[DefaultPin]) => OutputPinGetter<Pins, DefaultPin>),
> = RT

type OutputPinCallbacks<Pins extends PinDef> = {
  [I in keyof Pins as `on${Capitalize<string & I>}`]?: (
    callback: (...args: Pins[I]) => void,
  ) => void
}

// type Z2 = OutputPinSetter<
//   {
//     result: [result: 'RESULT']
//     error: [error: 'ERROR']
//     test: [test: 'TEST']
//   },
//   'result'
// >['awaiters']

function outputPins<Pins extends PinDef, DefaultPin extends Extract<keyof Pins, string>>(
  defaultPin: DefaultPin,
  ...outputPinDefs: Extract<keyof Pins, string>[]
) {
  return (callbacks?: OutputPinCallbacks<Pins>) => {
    const cb = { ...callbacks }
    let pinReturned: Extract<keyof Pins, string>
    let value: unknown

    const setter = function SetterFn(arg) {
      return (setter[defaultPin] as any)(arg)
    } as unknown as OutputPinSetter<Pins, DefaultPin>

    const getter = function GetterFn() {
      return value
    } as unknown as OutputPinGetter<Pins, DefaultPin>

    const getPinValue = <T>(pin: string) => {
      if (pinReturned === pin) return value as T
      throw new Error(`pin '${pin}' not set, '${pinReturned}' was set`)
    }

    ;[defaultPin, ...outputPinDefs].forEach((pin) => {
      Object.defineProperties(getter, {
        [pin]: {
          get() {
            return getPinValue(pin)
          },
          configurable: false,
        },
        [`is${capitalise(pin)}`]: {
          value: () => pinReturned === pin,
          configurable: false,
        },
      })
      Object.defineProperties(setter, {
        [pin]: {
          value: (valueToSet) => {
            if (pinReturned) {
              throw new Error(
                `only one outputPin can be set and the '${pinReturned}' pin already contains '${value}'`,
              )
            }
            pinReturned = pin
            value = valueToSet
            const prop = `on${capitalise(pin)}`
            if (cb[prop]) cb[prop](value)

            return getter
          },
        },
      })
    })

    Object.defineProperties(getter, {
      setPin: {
        get() {
          return pinReturned
        },
      },
      value: {
        get: () => {
          if (!pinReturned) throw new Error(`no value has yet been set`)
          return value
        },
        configurable: true,
      },
    })

    Object.defineProperties(setter, {
      awaiters: {
        get() {
          const obj = {}
          ;[defaultPin, ...outputPinDefs].forEach((pin) => {
            Object.defineProperties(obj, {
              [`on${capitalise(pin)}`]: {
                value: (callback) => {
                  if (pin === pinReturned) callback(value)
                  else {
                    if (cb[`on${capitalise(pin)}`])
                      throw new Error(`call back 'on${capitalise(pin)}' already set`)
                    cb[`on${capitalise(pin)}`] = callback
                  }
                },
                configurable: false,
              },
            })
          })
          return obj
        },
      },
    })

    // debugger
    return setter
  }
}

export default outputPins

/**
 * Inspired by the `maybe` monad, this function returns a function object, that can have either a `result` or a `none` set.
 * 
 * @example
 *  const fn = (none: boolean) => {
      const returnResult = resultNoneOutputPins<'RESULT', null>()
      return none ? returnResult.none(null) : returnResult('RESULT')
    }
    const results = fn(false)
    if (!results.isNone()) console.log(results()) // 'RESULT'
 *
 * @param callbacks : {
 *      onResult(callback: (result)=>void): void
 *      onError(callback: (error)=>void): void
 *    } - optional callbacks that can be made when setter is set
 * @returns {
    *    (result):OutputPinGetter
    *    result(result):OutputPinGetter
    *    error(error):OutputPinGetter
    *    awaiter: {
    *      onResult(callback: (result)=>void): void
    *      onError(callback: (error)=>void): void
    *    }
    * }
    *
    * OutputPinGetter: {
    *   readonly result: result|never
    *   readonly error: error|never
    *   value: result|error
    *   setPin: 'result'|'error'
    *   isResult(): boolean
    *   isError(): boolean
    * }
    */
export function resultNoneOutputPins<ResultType, NoneType>(
  callbacks?: OutputPinCallbacks<{ result: [result: ResultType]; none: [none: NoneType] }>,
) {
  return outputPins<{ result: [result: ResultType]; none: [none: NoneType] }, 'result'>(
    'result',
    'none',
  )(callbacks)
}

/**
 * Inspired by the `either` monad, this function returns a function object, that can have either a `result` or an `error` set.
 * 
 * @example
 *  const fn = (error: boolean) => {
      const returnResult = resultErrorOutputPins<'RESULT', Error>()
      return error ? returnResult.error(new Error('error')) : returnResult('RESULT')
    }
    const results = fn(false)
    if (results.isError()) throw results.error
    console.log(results()) // 'RESULT'
 *
 * @param callbacks : {
 *      onResult(callback: (result)=>void): void
 *      onError(callback: (error)=>void): void
 *    } - optional callbacks that can be made when setter is set
 * @returns {
 *    (result):OutputPinGetter
 *    result(result):OutputPinGetter
 *    error(error):OutputPinGetter
 *    awaiter: {
 *      onResult(callback: (result)=>void): void
 *      onError(callback: (error)=>void): void
 *    }
 * }
 *
 * OutputPinGetter: {
 *   readonly result: result|never
 *   readonly error: error|never
 *   value: result|error
 *   setPin: 'result'|'error'
 *   isResult(): boolean
 *   isError(): boolean
 * }
 */
export type ResultErrorOutputPins<ResultType, ErrorType> = OutputPinSetter<
  { result: [result: ResultType]; error: [error: ErrorType] },
  'result'
>
export function resultErrorOutputPins<ResultType, ErrorType>(
  callbacks?: OutputPinCallbacks<{ result: [result: ResultType]; error: [error: ErrorType] }>,
) {
  return outputPins<{ result: [result: ResultType]; error: [error: ErrorType] }, 'result'>(
    'result',
    'error',
  )(callbacks)
}

// const Nothing = Symbol('Nothing')

// export const maybe = <T>() => {
//   const outPins = resultNoneOutputPins<T>()
//   Object.defineProperties(fn, {
//     map: {
//       value: <U>(fn: (value: T) => U) => {
//         if (!outPins.pinReturned) throw new Error('no value yet set for outputPins')
//         if (outPins.pinReturned === 'none') return Nothing
//         return fn(outPins.result)
//       },
//     },
//   })
//   return outPins
// }
