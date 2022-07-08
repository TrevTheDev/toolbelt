/* eslint-disable @typescript-eslint/no-explicit-any */
import type { ResultCb, ErrorCb, CancelFn, AsyncEffect } from './asyncMap'
import groupObjectsOrFunctions from './groupObjectsOrFunctions'

// type CancelFn<CancelFnArgs extends unknown[]> = (...args: CancelFnArgs)=>void

const x = new Map<string, number>()

type FinalResultCb<ResultArgs extends any[], ErrorArgs extends any[]> = (results: Queue<ResultArgs>, errors: Queue<ErrorArgs>) => void

type ErrorCbHandlerFn<ResultArgs extends any[], ErrorArgs extends any[], CancelArgs extends any[]> = (
  error: ErrorArgs,
  resultQueue: Map<number, ResultArgs>,
  errorQueue: Map<number, ErrorArgs>,
  cancelQueue: Map<number, (...args: CancelArgs) => void>,
) => void

type Callback<ResultArgs extends any[], ErrorArgs extends any[], CancelArgs extends any[]> = (
  resultCb: ResultCb<ResultArgs>,
  errorCb: ErrorCb<ErrorArgs>,
) => CancelFn<CancelArgs> | void

type State = 'init' | 'awaited' | 'asyncMapInProgress' | 'done' | 'error'

type AsyncEffectState = 'executing' | 'cancelled' | 'resolved'

interface AsyncEffectsInParallelController<ResultCbArgs extends any[] = any[], ErrorCbArgs extends any[] = any[], AsyncControl = void> {
  readonly state: State
  readonly controller?: AsyncControl
  readonly resultQueue: Map<number, ResultCbArgs>
  readonly errorQueue: Map<number, ErrorCbArgs>
  readonly controllerQueue: Map<number, AsyncControl>
}

export interface AsyncEffectsInParallel<
  ResultCbArgs extends any[] = any[],
  ErrorCbArgs extends any[] = any[],
  Speakers extends [resultCb: ResultCb<ResultCbArgs>, errorCb?: ErrorCb<ErrorCbArgs>, ...speakers: ((...args) => any)[]] = [
    resultCb: ResultCb<ResultCbArgs>,
    errorCb: ErrorCb<ErrorCbArgs>,
    ...speakers: ((...args) => any)[],
  ],
  AsyncControl = void,
> {
  await(resolve: (value) => void, reject: (reason?) => void): void
  await(
    resultCb: (...results: ResultCbArgs) => void,
    errorCb: (...errorArgs: ErrorCbArgs) => void,
    ...speakers: Speakers
  ): AsyncEffectsInParallelController<ResultCbArgs, ErrorCbArgs, AsyncControl>
  then<T>(): Promise<T>['then']
  catch<T>(): Promise<T>['catch']
}

function callbacksInParallel<
  ResultCbArgs extends any[] = any[],
  ErrorCbArgs extends any[] = any[],
  Speakers extends [resultCb: ResultCb<ResultCbArgs>, errorCb?: ErrorCb<ErrorCbArgs>, ...speakers: ((...args) => any)[]] = [
    resultCb: ResultCb<ResultCbArgs>,
    errorCb: ErrorCb<ErrorCbArgs>,
    ...speakers: ((...args) => any)[],
  ],
  AsyncControl = void,
>(...asyncEffects: AsyncEffect<ResultCbArgs, ErrorCbArgs, Speakers, AsyncControl>[]): AsyncEffectsInParallel<ResultCbArgs, ErrorCbArgs, Speakers, AsyncControl> {
  let asyncEffectsInParallel: AsyncEffectsInParallel<ResultCbArgs, ErrorCbArgs, Speakers, AsyncControl>

  let state: State = 'init'

  asyncEffectsInParallel = {
    await: (resultCb, errorCb?, ...speakers) => {
      state = 'awaited'

      const resultQueue = new Map<number, ResultCbArgs>()
      const errorQueue = new Map<number, ErrorCbArgs>()
      const controllerQueue = new Map<number, AsyncControl>()

      const arrayLength: number = asyncEffects.length
      let fnsAddedCount = 0
      let resultCount = 0

      const finalDoneCb = (...args) => {
        state = 'done'
        resultCb(...args)
      }

      const finalErrorCb = (...args) => {
        state = 'error'
        if (!errorCb) throw new Error(args.toString())
        errorCb(...args)
      }

      const asyncEffectsInParallelController: AsyncEffectsInParallelController<ResultCbArgs, ErrorCbArgs, AsyncControl> = {
        get state() {
          return state
        },
        get controller() {
          return groupObjectsOrFunctions(...controllerQueue.queue)
        },
        get resultQueue() {
          return resultQueue
        },
        get errorQueue() {
          return errorQueue
        },
        get controllerQueue() {
          return controllerQueue
        },
      }

      const runAsyncEffect = (asyncEffect: AsyncEffect<ResultCbArgs, ErrorCbArgs, Speakers, AsyncControl>) => {
        let asyncEffectState: AsyncEffectState = 'executing'
        const idx = fnsAddedCount
        fnsAddedCount += 1
        function cleanUpAndCheckDone(finalQueue: Map<number, ResultCbArgs>, result: ResultCbArgs, inject?: () => void): void
        function cleanUpAndCheckDone(finalQueue: Map<number, ErrorCbArgs>, error: ErrorCbArgs, inject?: () => void): void
        function cleanUpAndCheckDone(finalQueue: Map<number, any>, result: unknown[], inject?: () => void): void {
          if (asyncEffectState === 'executing' && state === 'awaited') {
            asyncEffectState = 'resolved'
            controllerQueue.delete(idx)
            finalQueue.set(idx, result)
            resultCount += 1
            if (inject) inject()
            if (resultCount === arrayLength) finalDoneCb(resultQueue, errorQueue)
          }
        }

        const cancelFn = asyncEffect(
          (...results) => cleanUpAndCheckDone(resultQueue, results),
          (...errorResults) => cleanUpAndCheckDone(errorQueue, errorResults, () => finalErrorCb(errorResults, resultQueue, errorQueue, controllerQueue)),
        )

        if (cancelFn && asyncEffectState === 'executing' && state === 'awaited') {
          controllerQueue.set(idx, (...args: CancelArgs) => {
            controllerQueue.delete(idx)
            cancelFn(...args)
          })
        }
      }

      asyncEffects.forEach((asyncEffect) => runAsyncEffect(asyncEffect))
      // return (...args) => {
      //   if (state !== 'init') throw new Error('awaitCallbacksInParallel has either already been resolved, or cancelled')
      //   state = 'cancelled'
      //   debugger
      //   cancelQueue.queueInInsertionOrder.forEach(([, cancelCb]) => cancelCb(...args))
      // }

      return asyncEffectsInParallelController
    },
    then: (onfulfilled?, onrejected?) => {},
  }

  return asyncEffectsInParallel
}
export default callbacksInParallel
