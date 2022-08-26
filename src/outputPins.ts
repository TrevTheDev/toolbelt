import { resolve } from 'path'
import { capitalise, curriedRunFunctionsOnlyOnce, callbackTee, methodOnlyOnce } from './smallUtils'
import { ConcatTupleOfTuples, Head, TupleToUnion, Union } from './typescript utils'

export type PinDef = [pinName: string, pinType: [arg: unknown]]

type OutputPinGetters<Pins extends [defaultPin: PinDef, ...otherPins: PinDef[]]> = {
  [I in keyof Pins as Pins[I] extends PinDef
    ? `get${Capitalize<Pins[I][0]>}`
    : never]: () => Pins[Exclude<I, number>][1][0]
}

type OutputPinSetters<Pins extends [defaultPin: PinDef, ...otherPins: PinDef[]]> = Union<
  Union<
    { pinReturned: undefined },
    {
      [I in keyof Pins as Pins[I] extends PinDef ? Pins[I][0] : never]: (
        ...args: Pins[Exclude<I, number>][1]
      ) => void
    }
  >,
  {
    [I in keyof Pins as Pins[I] extends PinDef ? `on${Capitalize<Pins[I][0]>}` : never]: (
      callback: (
        ...args: Pins[Exclude<I, number>][1] extends any[] ? Pins[Exclude<I, number>][1] : never
      ) => void,
    ) => () => void
  }
>

// type OutputPinCallbacks<Pins extends [defaultPin: PinDef, ...otherPins: PinDef[]]> = {
//   [I in keyof Pins as Pins[I] extends PinDef ? `on${Capitalize<Pins[I][0]>}` : never]: (
//     callback: (
//       ...args: Pins[Exclude<I, number>][1] extends any[] ? Pins[Exclude<I, number>][1] : never
//     ) => void,
//   ) => () => void
// }

type Z = OutputPinSetters<
  [['result', [result: 'RESULT']], ['error', [error: 'ERROR']], ['test', [test: 'TEST']]]
>

type ReadOnlyOutputPinValues<Pins extends [defaultPin: PinDef, ...otherPins: PinDef[]]> = {
  readonly [I in keyof Pins as Pins[I] extends PinDef ? Pins[I][0] : never]: Pins[Exclude<
    I,
    number
  >][1][0]
}

// prettier-ignore
type OutputPins<
  PinDefs extends [defaultPin: PinDef, ...otherPins: PinDef[]],
  DefaultCb extends (cb: (arg) => unknown) => unknown,
  _PinDefs0 = { [I in keyof PinDefs]: PinDefs[I][0] },
  _PinDefs1 extends unknown[] = { [I in keyof PinDefs]: PinDefs[I][1] },
  _PinNames extends [arg0: string, ...args: string[]] = _PinDefs0 extends [
    arg0: string, ...args: string[],
  ] ? _PinDefs0 : never,
  _PinNamesAsUnion extends string = TupleToUnion<_PinNames> extends string
    ? TupleToUnion<_PinNames> : never,
  _PinNamesConstrainedType extends [
    arg0: _PinNamesAsUnion, ...args: _PinNamesAsUnion[],
  ] = _PinNames extends [arg0: _PinNamesAsUnion, ...args: _PinNamesAsUnion[]] ? _PinNames : never,
  _PinTypesAsUnion = TupleToUnion<ConcatTupleOfTuples<_PinDefs1>>,
  _SetObject = Union<{ pinReturned: _PinNamesAsUnion, value: _PinTypesAsUnion}, OutputPinGetters<PinDefs>>,
  _UnsetCallSignature = <
    V extends [unknown] = PinDefs[0][1], 
    D extends ((callback: (arg: V[0]) => unknown) => unknown) = DefaultCb
  >(...args0: V) => OutputPins<PinDefs, D>['setType']
> = {
  unsetType: OutputPinSetters<PinDefs> & _UnsetCallSignature
  setType: _SetObject & DefaultCb
  // work around for https://stackoverflow.com/questions/73183059/changing-an-objects-type-after-calling-a-particular-function
  unionizedType: Union<OutputPinSetters<PinDefs>, _SetObject> & 
    (_UnsetCallSignature & DefaultCb)
  unsetCallSignature: _UnsetCallSignature
  unsetCallParam: PinDefs[0][1]
  typeUnion: _PinNamesAsUnion
  pinNameArray: _PinNamesConstrainedType
  defaultPin: Head<_PinNamesConstrainedType>
  unionizedCallSignature: (_UnsetCallSignature | DefaultCb)
}

type XXX = OutputPinGetters<
  [['result', [result: 'RESULT']], ['error', [error: 'ERROR']], ['test', [test: 'TEST']]]
  // (cb: (result: string) => void) => boolean
> // ['unionizedType']

const outputPins = <
  PinDefs extends [defaultPin: PinDef, ...otherPins: PinDef[]],
  DefaultCb extends (arg) => any,
  _R extends {
    unsetType: any
    setType: any
    unionizedType: any
    unsetCallSignature: (arg) => any
    unsetCallParam: [unknown]
    typeUnion: string
    pinNameArray: [arg0: string, ...args: string[]]
    defaultPin: unknown
  } = OutputPins<PinDefs, DefaultCb>,
>(
  ...outputPinDefs: _R['pinNameArray']
) => {
  let pinReturned: _R['typeUnion']
  // let defaultAction: <ArgType extends unknown[], ReturnType>(...args: ArgType) => ReturnType

  let funcFunction

  const func: _R['unionizedType'] = (...args) => funcFunction(...args)

  funcFunction = (arg) => {
    func[outputPinDefs[0]](arg)
    return func
  }

  const once = curriedRunFunctionsOnlyOnce(() => {
    throw new Error(
      `only one outputPin can be set and the '${pinReturned}' pin already contains '${func.value}'`,
    )
  })

  outputPinDefs.forEach((pin) => {
    let callback_: (arg) => unknown
    let resolvedValue: () => unknown

    methodOnlyOnce(
      func,
      pin,
      once(pin)((arg) => {
        funcFunction = (fn) => func[`on${pin[capitalise]()}`](fn)
        pinReturned = pin
        Object.defineProperties(func, {
          [`get${pin[capitalise]()}`]: {
            value: () => arg,
            configurable: false,
          },
          value: {
            get: () => arg,
            configurable: false,
          },
        })

        if (callback_) callback_(arg)
        else resolvedValue = () => arg

        return func as _R['setType']
      }),
    )

    methodOnlyOnce(
      func,
      `on${pin[capitalise]()}`,
      <O, R, F extends (result: R, outPins: O) => unknown>(callback: F, outPins: O) => {
        if (resolvedValue) return callback(resolvedValue(), outPins)
        callback_ = callback
        return func // not sure about this - should probably return a promise to resolve
      },
    )

    Object.defineProperty(func, `get${pin[capitalise]()}`, {
      value: () => {
        throw new Error(`pin '${pin}' not set`)
      },
      configurable: true,
    })
  })
  Object.defineProperties(func, {
    pinReturned: {
      get() {
        return pinReturned
      },
    },
    value: {
      get: () => {
        throw new Error(`no value has yet been set`)
      },
      configurable: true,
    },
  })
  // debugger
  return func
}

export default outputPins

// export const resultOutputPins = <ResultType, Fn extends (arg: ResultType) => unknown>() =>
//   outputPins<[['result', [result: ResultType]]], (resultCb: Fn) => ReturnType<Fn>>('result')

type Cb = (input, router) => unknown

type PinIFaceBase = {
  then: (callback: (arg: unknown) => unknown) => PinIFaceBase
  input: (arg: unknown) => unknown | PinIFaceBase
}

type NextPinIFaceBase<I> = {
  then: (callback: (arg: unknown) => unknown) => NextPinIFaceBase<I>
  input: (arg: I) => unknown | NextPinIFaceBase<I>
}

type PinIFace<I, C extends Cb, NextPinIFace> = {
  then: (callback: C) => PinIFace<I, C, NextPinIFace> | NextPinIFace
  input: (arg: I) => ReturnType<C> | PinIFace<I, C, NextPinIFace> | NextPinIFace
}

type ResolverIFace<I, C extends Cb> = {
  result: (arg: I) => ReturnType<C>
}

type x = {
  then: (callback: ResultCb) => PFace | NextPinIFace | ResultCbRT
  input: (arg: ResultCbArg) => PFace | NextPinIFace | ResultCbRT
}

export const resultOutputPins = <
  PFace extends PinIFaceBase,
  NextPinIFace extends NextPinIFaceBase<Parameters<Parameters<PFace['then']>[0]>[0]>,
  Predecessor extends {
    input: (input: unknown) => unknown
    then: (callback: (arg: unknown) => unknown) => unknown
  },
  Input = Parameters<Parameters<Predecessor['then']>[0]>[0],
  // ResolverFace extends { result: Parameters<PFace['then']>[0] },
  // ResultCb extends (arg: unknown) => unknown = Parameters<PFace['then']>[0],
  // ResultCbArg = Parameters<ResultCb>[0],
  // ResultCbRT = ReturnType<ResultCb>,
>(
  predecessor?: Predecessor,
) => {
  // let defaultAction: <ArgType extends unknown[], ReturnType>(...args: ArgType) => ReturnType
  let callback_: <IV, RV>(arg: IV) => RV
  let resolvedValue: <T>() => T
  const setResolvedValue = <T>(arg: T) => {
    resolvedValue = () => arg
  }
  let next: NextPinIFace
  let resolver: <T>() => T | PFace | NextPinIFace

  const pins = {
    result: <O>(arg: O) => {
      pins.result = () => {
        throw new Error(`'result' can only be called once`)
      }
      resolvedValue = () => arg
      return resolver() // as ReturnType<Parameters<PFace['then']>[0]>
    },
  }

  const obj: PFace = {
    then: (callback: ResultCb) => {
      debugger
      next = resultOutputPins(obj)
      callback_ = callback
      obj.then = () => {
        throw new Error(`'then' can only be called once`)
      }
      return resolver()
    },
    input: (arg: ResultCbArg) => {
      debugger
      obj.input = () => {
        throw new Error(`'input' can only be called once`)
      }
      if (predecessor) {
        predecessor.input(arg)
        return next || obj
      }
      return pins.result(arg)
    },
  }

  resolver = () => {
    if (callback_ === undefined || resolvedValue === undefined) return next || obj
    return callback_(resolvedValue(), pins) as ReturnType<C>
  }

  // debugger
  return obj
}

export const resultNoneOutputPins = <
  ResultType,
  NoneType,
  Fn extends (arg: ResultType) => unknown = (result: ResultType) => unknown,
>() =>
  outputPins<
    [['result', [result: ResultType]], ['none', [none: NoneType]]],
    (resultCb: Fn) => ReturnType<Fn>
  >('result', 'none')

export const resultErrorOutputPins = <
  ResultType,
  ErrorType,
  Fn extends (arg: ResultType) => unknown = (result: ResultType) => unknown,
>() =>
  outputPins<
    [['result', [result: ResultType]], ['error', [error: ErrorType]]],
    (resultCb: Fn) => ReturnType<Fn>
  >('result', 'error')

const Nothing = Symbol('Nothing')

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
