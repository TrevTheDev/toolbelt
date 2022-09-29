/* eslint-disable @typescript-eslint/no-explicit-any */
// import type { ResultCb, ErrorCb, CancelFn, AsyncEffect } from './asyncMap'
import groupObjectsOrFunctions from './groupObjectsOrFunctions'

// type CancelFn<CancelFnArgs extends unknown[]> = (...args: CancelFnArgs)=>void

type ResultCb<ResultCbArgs extends unknown[]> = (...resultArgs: ResultCbArgs) => void
type ErrorCb<ErrorCbArgs extends unknown[]> = (...errorArgs: ErrorCbArgs) => void

export type AsyncEffect<
  ResultCbArgs extends unknown[],
  ErrorCbArgs extends unknown[] | undefined,
  AsyncControl,
  EArgs extends unknown[] = ErrorCbArgs extends undefined ? never : ErrorCbArgs,
> = ErrorCbArgs extends undefined
  ? (resultCb: ResultCb<ResultCbArgs>) => AsyncControl
  : (resultCb: ResultCb<ResultCbArgs>, errorCb: ErrorCb<EArgs>) => AsyncControl

type GetErrorCbArgs<
  T extends AsyncEffect<unknown[], unknown[] | undefined, unknown>,
  P = Parameters<T>,
  S = P extends [resultCb: ResultCb<any>, errorCb: ErrorCb<any>] ? Parameters<P[1]> : undefined,
> = S

type AsyncEffectsParamArray<
  T extends AsyncEffect<unknown[], unknown[] | undefined, unknown>[],
  P extends 0 | 1,
  C = T extends []
    ? []
    : T extends [
        infer First extends AsyncEffect<unknown[], unknown[], unknown>,
        ...infer Tail extends AsyncEffect<unknown[], unknown[], unknown>[],
      ]
    ? [
        P extends 1 ? GetErrorCbArgs<First> : Parameters<Parameters<First>[0]>,
        ...AsyncEffectsParamArray<Tail, P>,
      ]
    : never,
  C2 = C extends infer O ? { [K in keyof O]: O[K] } : never,
> = C2 extends [...results: (unknown[] | undefined)[]] ? C2 : never

// type X = AsyncEffectsParamArray<
//   [
//     (resCb: (result: 'ra', a: 'a') => void, errCb: (error: 'ea') => void) => 'rva',
//     (resCb: (result: 'rb') => void) => 'rvb',
//     (resCb: (result: 'rc') => void, errCb: (error: 'ec') => void) => 'rvc',
//   ],
//   1
// >

function asyncEffectsInParallel<
  AsyncEffects extends [
    asyncEffect: AsyncEffect<unknown[], unknown[] | undefined, unknown>,
    ...asyncEffects: AsyncEffect<unknown[], unknown[] | undefined, unknown>[],
  ],
  ResultsArray extends unknown[] = AsyncEffectsParamArray<AsyncEffects, 0>,
  ErrorsArray extends unknown[] = AsyncEffectsParamArray<AsyncEffects, 1>,
>(...asyncEffects: AsyncEffects) {
  type State = 'init' | 'awaited' | 'halted' | 'done' | 'error'

  let state: State = 'init'

  const aEffectsInParallel = {
    await: (
      resultCb: (resultArray: ResultsArray) => void,
      errorCb?: (errorArray: ErrorsArray, resultArray: ResultsArray) => void,
    ) => {
      state = 'awaited'
      let hasErrors = false
      const arrayLength = asyncEffects.length
      const resultArray = new Array(arrayLength) as Partial<ResultsArray>
      const errorArray = new Array(arrayLength) as Partial<ErrorsArray>
      const controllerArray = new Array<unknown | undefined>(arrayLength)

      let resultCount = 0

      const finalDoneCb = () => {
        state = 'done'
        resultCb(resultArray as ResultsArray)
      }

      const finalErrorCb = () => {
        state = 'error'
        if (!errorCb) throw new Error('no `errorCb` provided, and one is required')
        errorCb(errorArray as ErrorsArray, resultArray as ResultsArray)
      }

      const asyncEffectsInParallelController = {
        get state() {
          return state
        },
        get controllers() {
          return controllerArray.filter((controller) => controller !== undefined) as unknown[]
        },
        get resultQueue() {
          return resultArray
        },
        get errorQueue() {
          return errorArray
        },
        get controllerQueue() {
          return controllerArray
        },
        halt() {
          state = 'halted'
        },
      }

      const runAsyncEffect = (asyncEffect, idx) => {
        type AsyncEffectState = 'executing' | 'cancelled' | 'resolved'

        let asyncEffectState: AsyncEffectState = 'executing'

        function cleanUpAndCheckDone(
          finalQueue: Partial<ResultsArray> | Partial<ErrorsArray>,
          result: any[],
        ) {
          if (asyncEffectState === 'executing' && state === 'awaited') {
            asyncEffectState = 'resolved'
            controllerArray[idx as unknown as number] = undefined
            finalQueue[idx] = result
            resultCount += 1
            if (resultCount === arrayLength) {
              if (hasErrors) finalErrorCb()
              else finalDoneCb()
            }
          }
        }

        controllerArray[idx as unknown as number] = asyncEffect(
          (...results: any[]) => cleanUpAndCheckDone(resultArray, results),
          (...errorResults: any[]) => {
            hasErrors = true
            return cleanUpAndCheckDone(errorArray, errorResults)
          },
        )
      }

      asyncEffects.forEach((asyncEffect, i) => runAsyncEffect(asyncEffect, i))
      return asyncEffectsInParallelController
    },
    promise() {
      return new Promise((resolve, reject) => {
        aEffectsInParallel.await(resolve, reject)
      })
    },
  }

  return aEffectsInParallel
}

export function asyncEffectsInParallelShort<
  AsyncEffects extends [
    asyncEffect: AsyncEffect<unknown[], unknown[] | undefined, unknown>,
    ...asyncEffects: AsyncEffect<unknown[], unknown[] | undefined, unknown>[],
  ],
  ResultsArray extends unknown[] = AsyncEffectsParamArray<AsyncEffects, 0>,
  ErrorsArray extends unknown[] = AsyncEffectsParamArray<AsyncEffects, 1>,
>(
  asyncEffects: AsyncEffects,
  resultCb: (resultsArray: ResultsArray) => void,
  errorCb?: (errorsArray: ErrorsArray, resultsArray: ResultsArray) => void,
) {
  const a = asyncEffectsInParallel<AsyncEffects, ResultsArray, ErrorsArray>(...asyncEffects)
  return a.await(resultCb, errorCb)
}
export default asyncEffectsInParallel
