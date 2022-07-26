/* eslint-disable @typescript-eslint/no-explicit-any */
// import { IsStrictAny, IsStrictUnknown, IsUnion } from './typescript utils'

import { TupleToUnion } from './typescript utils'

type UnknownCb = (...args: never[]) => unknown

// type AnyFn = (...args: any[]) => any
// type AnyResultCb = ResultCb<any[], any>
// type UnknownResultCb = ResultCb<unknown[], unknown>
// type AnyErrorCb = ErrorCb<any[], any>

// export type Listener<T extends UnknownCb = UnknownCb> = T
// export type Speaker<T extends UnknownCb = UnknownCb> = T

export type Listener = (...args: unknown[]) => never
// export type Speaker<T extends unknown[] = [...args: unknown[]], R = unknown> = (...args: T) => R
export type Input<T extends unknown | unknown[] = unknown[]> = T

// FYI: typescript sucks!
export type ResultCb = (...results: unknown[]) => never
export type ErrorCb = (...errorArgs: unknown[]) => never
export type ResultCbAny = (result: any) => any
export type ErrorCbAny = (error: any) => any
export type ListenersAny = ((...results: any[]) => any)[]
// export type CancelFn<CancelArgs extends any[] = [...cancelArgs: unknown[]]> = Speaker<CancelArgs>

/**
 * An optional returned interface that enables interactions [typically cancelling], or information gathering [typically status or progress reporting] from
 * the code initiating the async operation - i.e. not the code performing the async operation.
 * `AsyncControl` should be `void` if no control is available
 * `AsyncControl` could be a `CancelFn` if a simple cancel is required
 * or `AsyncControl` could be a more complex interface enabling interactions
 */

// export type AsyncMap<
//   InputTypes extends any[] | any = unknown[],
//   ResultCbArgs extends any[] = [...resultArgs: unknown[]],
//   ErrorCbArgs extends any[] = [...errorArgs: unknown[]],
//   AsyncControl = unknown,
//   AdditionalListeners extends (Listener<any, any> | undefined)[] = [...listeners: (Listener<any, any> | undefined)[]],
//   Listeners extends [resultCb: Listener<any, any>, ...listeners: (Listener<any, any> | undefined)[]] = [
//     resultCb: ResultCb<ResultCbArgs>,
//     errorCb?: ErrorCb<ErrorCbArgs>,
//     ...listeners: AdditionalListeners,
//   ],
// > = (input: Input<InputTypes>, ...listeners: Listeners) => AsyncControl

// export type AsyncMap<
//   InputTypes extends unknown[] | unknown = unknown[],
//   ResultCallback extends ResultCb = ResultCb,
//   ErrorCallback extends ErrorCb | undefined = ErrorCb,
//   AsyncControl = void,
//   AdditionalListeners extends (Listener | undefined)[] = [], // [...listeners: (Listener | undefined)[]],
//   // ResultCallbackI1 extends ResultCb = ResultCallback extends IsStrictAny<ResultCallback> ? ResultCb : ResultCallback,
//   // ResultCallbackI2 extends (...args: unknown[]) => unknown = ResultCallbackI1 extends (...arg0: infer R) => infer S ? (...arg1: R) => S : never,
//   // ErrorCallbackI1 extends ErrorCb | undefined = ErrorCallback extends IsStrictAny<ErrorCallback> ? ErrorCb | undefined : ErrorCallback,
//   // ErrorCallbackI2 extends (...args: unknown[]) => unknown = ErrorCallbackI1 extends (...arg0: infer R) => infer S ? (...arg1: R) => S : never,
//   AdditionalListeners_ extends (Listener | undefined)[] = AdditionalListeners extends IsStrictAny<AdditionalListeners> ? (Listener | undefined)[] : AdditionalListeners,
//   EListener extends (Listener | undefined)[] = ErrorCallback extends IsUnion<ErrorCallback>
//     ? [errorCb: ErrorCallback]
//     : ErrorCallback extends undefined
//     ? []
//     : [errorCb: ErrorCallback],
//   Listeners extends [...listeners: (Listener | undefined)[]] = [...eCb: EListener, ...listeners: AdditionalListeners_],
// > = {
//   resultCbOnly: (input: Input<InputTypes>, resultCb: ResultCallback) => AsyncControl
//   resultCbAndErrorCb: (input: Input<InputTypes>, resultCb: ResultCallback, errorCb: ErrorCallback) => AsyncControl
//   resultCbAndOptionalErrorCb: (input: Input<InputTypes>, resultCb: ResultCallback, errorCb?: ErrorCallback) => AsyncControl
//   resultCbAndErrorCbAndListeners: (input: Input<InputTypes>, resultCb: ResultCallback, ...listeners: Listeners) => AsyncControl
// }

// type z = AsyncMap<[val: string], (result: string) => void, (err: any) => string>
// const x: AsyncMap<[number], ResultCb<[val: number]>>['resultCbOnly'] = ([input], resultCb) => resultCb(input)

// type InferResultCb<T extends UnknownCb> = ResultCb<T>
// type InferErrorCb<T extends UnknownCb> = ErrorCb<T>

// (R extends IsStrictUnknown<R> ? ErrorCb<unknown[], unknown> : R) : never,

export type AnyAsyncMap = (input: any, resultCb: (result: any) => any, ...listeners: any) => any

export type AnyAsyncMapWithError = (
  input: any,
  resultCb: (result: any) => any,
  errorCb: (error: any) => any,
  ...listeners: any
) => any

export type AsyncMap<
  I,
  ResultCallback extends (result: never) => void,
  ErrorCallback extends (errorArg: never) => void | never = never,
  Controller = void,
  AdditionalListeners extends ((...args: never[]) => void)[] = [],
> = (
  input: I,
  resultCb: ResultCallback,
  ...listeners: [ErrorCallback] extends [never]
    ? AdditionalListeners
    : [...[errorCb: ErrorCallback], ...[...additionalListeners: AdditionalListeners]] //
) => Controller

export type AsyncMapWithError<
  I,
  ResultCallback extends (result: never) => void,
  ErrorCallback extends (error: never) => void | never,
  Controller = void,
  AdditionalListeners extends ((...args: never[]) => void)[] = [],
> = (
  input: I,
  resultCb: ResultCallback,
  errorCb: ErrorCallback,
  ...listeners: AdditionalListeners //
) => Controller

export type GetInputArg<T extends AnyAsyncMapWithError> = Parameters<T>[0]

export type GetResultArg<T extends AnyAsyncMapWithError> = Parameters<Parameters<T>[1]>[0]

export type GetResultCbArg<T extends AnyAsyncMapWithError> = Parameters<T>[1]

export type GetErrorArg<T extends AnyAsyncMapWithError> = Parameters<Parameters<T>[2]>[0]

export type GetErrorCbArg<T extends AnyAsyncMapWithError> = Parameters<T>[2]

export type GetListenerArgs<T extends AnyAsyncMapWithError> = Parameters<T> extends [
  any,
  any,
  any,
  ...infer R,
]
  ? R extends UnknownCb[]
    ? R
    : unknown[]
  : unknown[]

// export type AsyncMapArray<T extends AnyAsyncMap[]> = T

export type FirstAsyncMap<T extends readonly AnyAsyncMapWithError[]> = T extends [
  first: infer R,
  ...rest: AnyAsyncMapWithError[],
]
  ? R extends AnyAsyncMapWithError
    ? R
    : never
  : T extends (infer S)[]
  ? S extends AnyAsyncMapWithError
    ? S
    : never
  : never

export type LastAsyncMap<T extends readonly AnyAsyncMapWithError[]> = T extends [
  ...rest: AnyAsyncMapWithError[],
  last: infer R,
]
  ? R extends AnyAsyncMapWithError
    ? R
    : never
  : T extends (infer S)[]
  ? S extends AnyAsyncMapWithError
    ? S
    : never
  : never

export type UnionOfAsyncMapArrayReturnTypes<T extends readonly AnyAsyncMapWithError[]> = T extends [
  any,
  ...any,
]
  ? TupleToUnion<{
      [I in keyof T]: ReturnType<T[I]>
    }>
  : T extends (infer S)[]
  ? S extends AnyAsyncMapWithError
    ? ReturnType<S>
    : never
  : never

type z1 = [string, number] extends [any, ...any] ? true : never
type z21 = [() => string, string] extends [() => string, ...any] ? S : never
type z = UnionOfAsyncMapArrayReturnTypes<[() => string, () => number]>
type zx = UnionOfAsyncMapArrayReturnTypes<((() => string) | (() => number))[]>

export type ComposedSerialAsyncMap<T extends AnyAsyncMap[]> = (
  input: GetInputArg<FirstAsyncMap<T>>,
  resultCb: GetResultCbArg<LastAsyncMap<T>>,
  errorCb: GetErrorCbArg<LastAsyncMap<T>>,
  ...listeners: GetListenerArgs<FirstAsyncMap<T>>
) => UnionOfAsyncMapArrayReturnTypes<T>

// export type ParallelAsyncMapArrayResults<T extends AnyAsyncMap[]> = {
//   [Index in keyof T]: ResultArgs<T[Index]>
// }

// type EX2 = ((xs: number) => void) extends (...args: never) => unknown ? true : false

// type InferAsyncMap<T extends UnknownAsyncMap> = AsyncMap<
//   T extends (input: infer I, ...args) => unknown ? I : never,
//   T extends (input, resultCb: infer R, ...args) => unknown ? (R extends UnknownCb ? ResultCb<R> : never) : never,
//   T extends (input, resultCb, errorCb: infer R, ...args) => unknown ? (R extends UnknownCb ? ErrorCb<R> : never) : never,
//   T extends (...args) => infer R ? R : never,
//   T extends (input, resultCb, errorCb?, ...listeners: infer R) => any ? (R extends (Listener | undefined)[] ? R : never) : never
// >

// type xxx = InferAsyncMap<(input: [value: number], resultCb: (xs: number) => void, errorCb: (e: Error) => string, cancelMe: (reason: string) => boolean) => string>

// export type AsyncMapFlat = (input, resultCb, errorCb?: (e) => never, ...speakers) => any

// type CallBackToParts<T extends (...args) => any, Args extends any[] = T extends (...args: infer A) => any ? A : never, RV = T extends (...args) => infer R ? R : never> = {
//   args: Args
//   return: RV
//   callback: T
// }

// type AsyncMapComponentParts<T extends (input, resultCb, errorCb, ...speakers) => any, Params extends any[] = Parameters<T>> = {
//   input: Params[0]
//   resultCb: CallBackToParts<Params[1]>
//   errorCb: Params[2] extends ((...args: infer E) => any) | undefined ? CallBackToParts<ErrorCb<E>> : CallBackToParts<ErrorCb>
//   speakers: T extends [any, any, any, ...infer S] ? S : unknown[]
//   controller: T extends (...args) => infer C ? C : void
// }

// type ComponentPartsToAsyncMap<
//   T extends {
//     input: any[]
//     resultCb: { args: any[]; return: any; callback: (...args) => any }
//     errorCb: { args: any[]; return: any; callback: (...args) => any }
//     speakers: any[]
//     controller: any
//   },
// > = AsyncMap<T['input'], T['resultCb']['args'], T['errorCb']['args'], T['controller'], T['speakers']>

// type z = AsyncMapComponentParts<AsyncMap>

// export type AsyncEffect<
//   ResultCbArgs extends any[] = [...resultArgs: any[]],
//   ErrorCbArgs extends any[] = [...errorArgs: any[]],
//   AsyncControl = void,
//   Speakers extends [resultCb: ResultCb<ResultCbArgs>, errorCb?: ErrorCb<ErrorCbArgs>, ...speakers: ((...args) => any)[]] = [
//     resultCb: ResultCb<ResultCbArgs>,
//     errorCb: ErrorCb<ErrorCbArgs>,
//     ...speakers: ((...args) => any)[],
//   ],
// > = (...speakers: Speakers) => AsyncControl

// // prettier-ignore
// export type AsyncSideEffect<
//     ResultArgs extends any[] = [...resultArgs: any[]],
//     ErrorArgs extends any[] = [...errorArgs: any[]],
//     AsyncControl = any,
// > = (
//   resultCb: ResultCb<ResultArgs>,
//   errorCb?: ErrorCb<ErrorArgs>
// ) => AsyncControl

// export const mapSyncFunctionToAsyncMap =
//   <I extends any[], R>(syncFunction: (...inputs: I) => R): AsyncMap<I, [result: R], [error: unknown]> =>
//   (input, resultCb, errorCb?) => {
//     try {
//       resultCb(syncFunction(...input))
//     } catch (e) {
//       if (!errorCb) throw e
//       errorCb(e)
//     }
//   }

export type PromiseAlignedAsyncMap = (
  input: unknown,
  resultCb: (result: unknown) => void,
  errorCb: (reason?: unknown) => void,
) => void

export const asyncMapToPromise = <T extends PromiseAlignedAsyncMap>(
  asyncMap: T,
  input: Parameters<AnyAsyncMap>[0],
) =>
  new Promise<Parameters<Parameters<T>[1]>[0]>((resolve, reject) => {
    asyncMap(input, resolve, reject)
  })

// export const asyncMapToAsyncEffect =
//   <
//     ResultCbArgs extends any[] = any,
//     ErrorCbArgs extends any[] = any,
//     AsyncControl = any,
//     Speakers extends [resultCb: ResultCb<ResultCbArgs>, errorCb?: ErrorCb<ErrorCbArgs>, ...speakers: ((...args) => any)[]] = [
//       resultCb: (...results: ResultCbArgs) => void,
//       errorCb: (...errorArgs: ErrorCbArgs) => void,
//       ...speakers: ((...args) => any)[],
//     ],
//   >(
//     asyncMap: AsyncMap<any, ResultCbArgs, ErrorCbArgs, AsyncControl, Speakers>,
//     input: any,
//   ): AsyncEffect<ResultCbArgs, ErrorCbArgs, AsyncControl, Speakers> =>
//   (...args: Speakers) =>
//     asyncMap(input, ...args)

// // const t = mapSyncFunctionToAsyncMap((x: number) => [x * x, `${x}`])
// // t([1], (result) => console.log(result))
