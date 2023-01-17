/* eslint-disable @typescript-eslint/no-explicit-any */
import enhancedMap from './enhancedMap'

export const createUid = (length = 20): string =>
  Array.from({ length }, () => Math.random().toString(36)[2]).join('')

/**
 * Executes a callback `nTimes` - if a startValue is provided, the callbackfn is `(previousResult: U, index: number) => U`
 * else it is `(index: number) => void`
 * @param nTimes - number of times to execute the callback
 * @param callbackfn - callback to execute
 * @param startValue - optional startValue
 * @returns U[] | void
 */
//  function times<U>(
//   nTimes: number,
//   callbackfn: (previousResult: U, index: number) => U
// )
export function times(nTimes: number, callbackfn: (index: number) => void): void
export function times<U>(
  nTimes: number,
  callbackfn: (previousResult: U, index: number) => U,
  startValue: U,
): U
export function times<U>(
  nTimes: number,
  callbackfn: (previousResult: U, index: number) => U,
  startValue?: U,
): U | void {
  if (arguments.length === 3) {
    let rV: U = startValue as U
    for (let step = 0; step < nTimes; step += 1) rV = callbackfn(rV, step)
    return rV
  }
  for (let step = 0; step < nTimes; step += 1)
    (callbackfn as unknown as (index: number) => void)(step)
  return undefined
}

// returns a function that is only executed on the first call,
// irrespective of how many times it is called.
export function runFunctionOnlyOnce() {
  let called = false
  return <P extends any[], R>(fn: (...args: P) => R) =>
    (...args: P) => {
      if (called) return false
      called = true
      return fn(...args)
    }
}

// /**
//  *
//  * @param errorMsgToThrow - optional error message to throw if called more than once.  Otherwise undefined is returned
//  * @returns a function that accepts other functions which can then only be called once
//  */
// export function curriedRunFunctionOnlyOnce(errorMsgToThrow?: string) {
//   let called = false
//   return <T extends (...args) => any>(fn: T) =>
//     (...args: T extends (...argX: infer R) => any ? R : never) => {
//       if (called) {
//         if (errorMsgToThrow) throw new Error(errorMsgToThrow)
//         return undefined
//       }
//       called = true
//       return fn(...args)
//     }
// }

type OneFnErrorCb<Args> = (calledFn: string, args: Args) => never
type GroupFnErrorCb<Args> = (firstCalledFn_: string, thisCalledFn_: string, args: Args) => never
/**
 *
 * @param errorMsgCb - optional error message callback to throw -
 *                     set to `null` if duplicate calls must simply be ignored.
 *                     set to `undefined` if a default error must be throw (this is the default behavior)
 * @param onlyOneFunction - whether this groups multiple functions, or only one function - default is false.
 *                      if false: `errorMsgCb` type GroupFnErrorCb<Args>
 *                      if true: `errorMsgCb` type OneFnErrorCb<Args>
 * @returns <T extends (...args)=>unknown>(functionName: string)=>T - returned T can only be called once
 *          either throws or returns `undefined` if called more than once
 */
export const curriedRunFunctionsOnlyOnce = <Arguments extends unknown[]>(
  errorMsgCb:
    | ((firstCalledFn: string, thisCalledFn: string, args: Arguments) => never)
    | ((calledFn: string, args: Arguments) => never)
    | null
    | undefined,
  onlyOneFunction = false,
) => {
  let calledFn: string
  return (fnName: string) =>
    <Y>(fn: (...args: Arguments) => Y) =>
    (...args: Arguments) => {
      if (calledFn) {
        if (errorMsgCb !== null) {
          if (errorMsgCb !== undefined) {
            if (onlyOneFunction) (errorMsgCb as unknown as OneFnErrorCb<Arguments>)(calledFn, args)
            else {
              ;(errorMsgCb as unknown as GroupFnErrorCb<Arguments>)(calledFn, fnName, args)
            }
          } else if (onlyOneFunction) throw new Error(`cannot call '${calledFn}' more than once`)
          throw new Error(
            fnName === calledFn
              ? `cannot call '${calledFn}' more than once`
              : `cannot call '${calledFn}' and then call '${fnName}'`,
          )
        }
        return undefined
      }
      calledFn = fnName
      return fn(...args)
    }
}

/**
 * creates a new method on 'obj', 'fn' than errors if called more than once.
 * @param obj - any object
 * @param method - the method on the object that can only be called once
 * @param fn - the method's code
 */
export const methodOnlyOnce = <O, T extends (...args) => unknown>(
  obj: O,
  method: string,
  fn: T,
) => {
  let once = false
  Object.defineProperty(obj, method, {
    value: (...args) => {
      if (once) throw new Error(`'${method}' can only be called once`)
      once = true
      return fn(...args)
    },
  })
}

/**
 * Function wrapper that executes `testFn` with functions args and if it returns true, throws an error via errorCb
 * @param errorCb: (meta?: M, args?: P) => never - function that throws a custom error
 * @param testFn: (args: P, meta?: M) => boolean - function that performs some test and if it returns `true` then `errorCb` is called
 * @returns (fn: T, meta?: M)=> T - a function that accepts a function `fn` and optional meta data `meta` that may be passed to `errorCb`
 */
export const validateFn =
  <
    T extends (...args: any[]) => unknown,
    M,
    P extends unknown[] = T extends (...args: infer A) => unknown ? A : never,
  >(
    errorCb: (meta?: M, args?: P) => never,
    testFn: (args: P, meta?: M) => boolean,
  ) =>
  (fn: T, meta?: M) =>
    ((...args: P) => {
      if (testFn(args, meta)) errorCb(meta, args)
      return fn(...args)
    }) as T
//

/**
 * Function wrapper that throws an error `errorMsg` if arg is undefined, '', null or []
 * @param fn: (arg: any) => unknown - any function that requires `arg` be returned
 * @param errorMsg
 * @returns return value of `fn`
 */
export const requireValue = <
  T extends (arg: any) => unknown,
  P = T extends (arg: infer A) => unknown ? A : never,
>(
  fn: T,
  errorMsg = `this function requires a value`,
) =>
  validateFn<T, undefined, [P]>(
    () => {
      throw new Error(errorMsg)
    },
    (arg: [P]) =>
      arg[0] === undefined ||
      arg[0] === null ||
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      arg[0] === '' ||
      (Array.isArray(arg[0]) && arg[0].length === 0),
  )(fn)

type ObjectWithExecutableProperty<P extends string> = { [K in P]: (...args) => unknown }

const validObjects = ['object', 'function']
export const isObjectAndHasExecutableProperty = <P extends string>(
  object: unknown,
  property: P,
): object is ObjectWithExecutableProperty<P> => {
  if (object === null || !validObjects.includes(typeof object)) return false
  const descriptor = Object.getOwnPropertyDescriptor(object, property)
  if (descriptor === undefined) return false
  return typeof descriptor.get === 'function' || typeof descriptor.value === 'function'
}

/**
 * Can add many callbacks that are all triggered when `triggerCallbacks` is executed.
 * const x = enqueueableCallbacksWithDelete<[result: string]>();
 *
 * @returns
 */
const callbackTee_ = <Arguments extends unknown[], ReturnVal>(
  options: {
    callInReverseOrder?: boolean
    canCallOnlyOnce?: boolean
    calledMoreThanOnceErrorCb?: (calledFn: string, args: Arguments) => never
  } = {},
) => {
  const opts = {
    callInReverseOrder: false,
    canCallOnlyOnce: false,
    calledMoreThanOnceErrorCb: undefined,
    ...options,
  }

  const callbackQueue = enhancedMap<(...args: Arguments) => ReturnVal>()
  let callFn: (...args: Arguments) => ReturnVal | ReturnVal[] | undefined = () => undefined
  let callFnExecutor = (...args: Arguments) => callFn(...args)

  if (opts.canCallOnlyOnce) {
    const once = curriedRunFunctionsOnlyOnce(opts.calledMoreThanOnceErrorCb, true)('callCallbacks')
    callFnExecutor = once(callFnExecutor)
  }

  let callbackAdder = (callback1: (...args: Arguments) => ReturnVal) => {
    let singleCallback: ((...args: Arguments) => ReturnVal) | undefined = callback1
    let removeSingleCallback = () => {
      singleCallback = undefined
      removeSingleCallback = () => false
      return true
    }
    callFn = singleCallback
    callbackAdder = (callback2: (...args: Arguments) => ReturnVal) => {
      if (singleCallback) {
        removeSingleCallback = callbackQueue.add(singleCallback)
        singleCallback = undefined
      }
      callFn = (...args: Arguments) =>
        callbackQueue.map((cb) => cb(...args), opts.callInReverseOrder)

      callbackAdder = (callback3: (...args: Arguments) => ReturnVal) => callbackQueue.add(callback3)
      return callbackAdder(callback2)
    }
    return () => removeSingleCallback()
  }

  return {
    /**
     * enqueues a callback
     * @param callback
     * @returns a function to remove enqueued callback
     */
    addCallback(callback: (...args: Arguments) => ReturnVal) {
      return callbackAdder(callback)
    },
    /**
     * calls all call with args in the predefined order
     * @param args
     * @returns
     */
    callCallbacks(...args: Arguments) {
      return callFnExecutor(...args)
    },
  }
}

/**
 * Can add many callbacks via `addCallback` that are called when `callCallbacks` is called.
 * const x = callbackResolverQueue<[result: string]>();
 * @param options {
    @param callInReverseOrder?: boolean - callbacks are called with last being called first. default `false`
    @param canCallOnlyOnce?: boolean - `callCallbacks` can only be executed once. default `false`
    @param calledMoreThanOnceErrorCb?: (
      @param firstCalledFn: string,
      @param thisCalledFn: string,
      @param args: T extends (...argX: infer A) => any ? A : never,
    ) => never
    @param resolvePerpetually?: boolean - callbacks can be added, even after resolution - they are resolved immediately
 * }
 * @returns {
 *  callCallbacks: 
 * }
 */

export const callbackTee = <Arguments extends unknown[], ReturnVal = void>(
  options: {
    callInReverseOrder?: boolean
    canCallOnlyOnce?: boolean
    calledMoreThanOnceErrorCb?: (calledFn: string, args: Arguments) => never
    resolvePerpetually?: boolean
  } = { resolvePerpetually: false },
) => {
  const rQueue = callbackTee_<Arguments, ReturnVal>(options)
  if (!options.resolvePerpetually) return rQueue
  if (options.callInReverseOrder)
    throw new Error(`'callInReverseOrder' and 'resolvePerpetually' are mutually exclusive`)
  if (options.canCallOnlyOnce !== true)
    throw new Error(`'canCallOnlyOnce' must be true to use 'resolvePerpetually'`)

  let argCache
  return {
    callCallbacks(...args: Arguments) {
      argCache = args
      rQueue.callCallbacks(...args)
    },
    addCallback(callback: (...args: Arguments) => ReturnVal) {
      if (argCache) callback(...argCache)
      else rQueue.addCallback(callback)
    },
  }
}

export const capitaliseWords = Symbol('CapitalizeWords')
export const capitalise = Symbol('Capitalise')

declare global {
  interface String {
    [capitaliseWords](separators?: string[]): string
    [capitalise](): string
  }
}
// eslint-disable-next-line no-extend-native
String.prototype[capitaliseWords] = function CapitaliseWords(separators = [' ', '-']) {
  return separators.reduce(
    (str, sep) =>
      str
        .split(sep)
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(sep),
    this.toString(),
  )
}

// eslint-disable-next-line no-extend-native
String.prototype[capitalise] = function Capitalise() {
  return this.charAt(0).toUpperCase() + this.slice(1)
}

export function functionClass<
  ClassType extends Record<string, unknown>,
  InstantiationArgs extends unknown[],
  PrivateVariables extends unknown[],
>(
  this: ClassType,
  ctor: (
    instantiatorArg: (...privateVariables: PrivateVariables) => ClassType,
    ...args0: InstantiationArgs
  ) => ClassType,
  callAction: string,
  instantiator: (...privateVariables: PrivateVariables) => ClassType,
) {
  const fn = function Ctor(...args: InstantiationArgs) {
    console.log(1)
    const self = function CallSelf(...callArgs: any) {
      return (self[callAction] as any)(...callArgs)
    } as unknown as ClassType

    const instantiatorFn = (...args1: PrivateVariables) => {
      const obj = instantiator.apply(self, args1)
      Object.assign(self, obj)
      return self
    }

    const that = ctor.call(self, instantiatorFn, ...args)
    return that
  }

  return fn
}

/**
 * whether a property of `obj` is a getter.  prop is assumed to exist.
 *
 * @param obj
 * @param prop
 * @returns boolean
 */
export function isGetter<P extends PropertyKey, O extends { [Property in P]: any }>(
  obj: O,
  prop: P,
): boolean {
  return !!(Object.getOwnPropertyDescriptor(obj, prop) as PropertyDescriptor).get
}
/**
 * whether a property of `obj` is a setter.  prop is assumed to exist.
 *
 * @param obj
 * @param prop
 * @returns boolean
 */
export function isSetter<P extends PropertyKey, O extends { [Property in P]: any }>(
  obj: O,
  prop: P,
): boolean {
  return !!(Object.getOwnPropertyDescriptor(obj, prop) as PropertyDescriptor).set
}
/**
 * whether a property of `obj` is a value - i.e. a non-callable property.  prop is assumed to exist.
 *
 * @param obj
 * @param prop
 * @returns boolean
 */
export function isValue<P extends PropertyKey, O extends { [Property in P]: any }>(
  obj: O,
  prop: P,
): boolean {
  const x = (Object.getOwnPropertyDescriptor(obj, prop) as PropertyDescriptor).value
  return x !== undefined && typeof x !== 'function'
}
/**
 * whether a property of `obj` is a callable function.  prop is assumed to exist.
 *
 * @param obj
 * @param prop
 * @returns boolean
 *
 * @example
 * type Foo = { foo: unknown }
 * const foo1:Foo = { foo: () => 1 }
 * foo1.foo() // errors
 * if(isFunction(foo1, 'foo')) foo1.foo() // doesn't error
 */
export function isFunction<P extends PropertyKey>(
  obj: { [Property in P]: unknown } | { [Property in P]: (...args: any[]) => any },
  prop: P,
): obj is { [Property in P]: (...args) => any } {
  const x = (Object.getOwnPropertyDescriptor(obj, prop) as PropertyDescriptor).value
  return x !== undefined && typeof x === 'function'
}
