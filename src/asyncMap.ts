/* eslint-disable @typescript-eslint/no-explicit-any */
export type Listener<T extends any[] = [...args: any[]]> = (...args: T) => void
export type Speaker<T extends any[] = [...args: any[]]> = (...args: T) => void
export type Input<T = any | any[]> = T

// FYI: typescript sucks!
export type ResultCb<ResultCbArgs extends any[] = [...resultArgs: any[]]> = Listener<ResultCbArgs>
export type ErrorCb<ErrorCbArgs extends any[] = [...errorArgs: any[]]> = Listener<ErrorCbArgs>
export type CancelFn<CancelArgs extends any[] = [...cancelArgs: any[]]> = Speaker<CancelArgs>

/**
 * An optional returned interface that enables interactions [typically cancelling], or information gathering [typically status or progress reporting] from
 * the code initiating the async operation - i.e. not the code performing the async operation.
 * `AsyncControl` should be `void` if no control is available
 * `AsyncControl` could be a `CancelFn` if a simple cancel is required
 * or `AsyncControl` could be a more complex interface enabling interactions
 */

export type AsyncMap<
  InputTypes extends any[] | any = unknown[],
  ResultCbArgs extends any[] = [...resultArgs: unknown[]],
  ErrorCbArgs extends any[] = [...errorArgs: unknown[]],
  Speakers extends [resultCb: ResultCb<ResultCbArgs>, errorCb?: ErrorCb<ErrorCbArgs>, ...speakers: ((...args) => any)[]] = [
    resultCb: ResultCb<ResultCbArgs>,
    errorCb: ErrorCb<ErrorCbArgs>,
    ...speakers: ((...args: unknown[]) => unknown)[],
  ],
  AsyncControl = any,
> = (input: Input<InputTypes>, ...speakers: Speakers) => AsyncControl

export type AsyncEffect<
  ResultCbArgs extends any[] = [...resultArgs: any[]],
  ErrorCbArgs extends any[] = [...errorArgs: any[]],
  Speakers extends [resultCb: ResultCb<ResultCbArgs>, errorCb?: ErrorCb<ErrorCbArgs>, ...speakers: ((...args) => any)[]] = [
    resultCb: ResultCb<ResultCbArgs>,
    errorCb: ErrorCb<ErrorCbArgs>,
    ...speakers: ((...args) => any)[],
  ],
  AsyncControl = any,
> = (...speakers: Speakers) => AsyncControl

// prettier-ignore
export type AsyncSideEffect<
    ResultArgs extends any[] = [...resultArgs: any[]],
    ErrorArgs extends any[] = [...errorArgs: any[]],
    AsyncControl = any,
> = (
  resultCb: ResultCb<ResultArgs>,
  errorCb?: ErrorCb<ErrorArgs>
) => AsyncControl

export const mapSyncFunctionToAsyncMap =
  <I extends any[], R>(syncFunction: (...inputs: I) => R): AsyncMap<I, [result: R], [error: unknown]> =>
  (input, resultCb, errorCb?) => {
    try {
      resultCb(syncFunction(...input))
    } catch (e) {
      if (!errorCb) throw e
      errorCb(e)
    }
  }

export const asyncMapToPromise = <T>(asyncMap: (input: any, resolve: (result: T) => void, reject: (reason?: any) => void) => void, input: any) =>
  new Promise<T>((resolve, reject) => {
    asyncMap(input, resolve, reject)
  })

export const asyncMapToAsyncEffect =
  <
    ResultCbArgs extends any[] = any,
    ErrorCbArgs extends any[] = any,
    Speakers extends [resultCb: ResultCb<ResultCbArgs>, errorCb?: ErrorCb<ErrorCbArgs>, ...speakers: ((...args) => any)[]] = [
      resultCb: (...results: ResultCbArgs) => void,
      errorCb: (...errorArgs: ErrorCbArgs) => void,
      ...speakers: ((...args) => any)[],
    ],
    AsyncControl = any,
  >(
    asyncMap: AsyncMap<any, ResultCbArgs, ErrorCbArgs, Speakers, AsyncControl>,
    input: any,
  ): AsyncEffect<ResultCbArgs, ErrorCbArgs, Speakers, AsyncControl> =>
  (...args: Speakers) =>
    asyncMap(input, ...args)

// const t = mapSyncFunctionToAsyncMap((x: number) => [x * x, `${x}`])
// t([1], (result) => console.log(result))
