/* eslint-disable @typescript-eslint/no-explicit-any */

import { Input, ResultCb, ErrorCb, AsyncMap, asyncMapToPromise } from './asyncMap'
import { enhancedMap } from './smallUtils'

type ChainEmptyCb<ResultCbArgs extends any[] = any[], ErrorCbArgs extends any[] = any[]> = (
  lastResult: unknown[],
  continueAwaiting: () => void,
  finalResultFn: ResultCb<ResultCbArgs>,
  finalErrorFn: ErrorCb<ErrorCbArgs>,
) => void

export interface AsyncMapChainCallbacks {
  onEmptyChain?: ChainEmptyCb
  onAsyncMapResult?: (callback: (result, processNext: (...inputs) => void) => void) => void
  onFinalResult?: (...results) => void
  onError?: (...errorArgs) => void
  speakers?: ((...args) => any)[]
}
/**
 * `init`: start state
 * `awaited`: state immediately after `await` fn called and before an `AsyncMap` is being processed
 * `asyncMapInProgress`: await a result from an `AsyncMap`
 * `awaitingAsyncMap` queue is empty and chain is waiting for another `AsyncMap`
 * `awaitingContinue` awaiting `continueAwaiting` cb in `onEmptyChain`
 * `done` `onFinalResult` callback made
 * `error` made or tried to make `onError` callback
 */

type State = 'init' | 'awaited' | 'asyncMapInProgress' | 'awaitingAsyncMap' | 'awaitingContinue' | 'done' | 'error'

export interface AsyncMapChainIFace {
  add(...asyncMaps: AsyncMap[]): void
  await<InputType extends Input>(input: InputType, callbacks: AsyncMapChainCallbacks): void
  await<InputType extends Input, ResultCbArgs extends any[], ErrorCbArgs extends any[]>(input: InputType, resultCb: ResultCb<ResultCbArgs>, errorCb?: ErrorCb<ErrorCbArgs>): void
  await<InputType extends Input, ResultCbArgs extends any[], ErrorCbArgs extends any[]>(
    input: InputType,
    callbacks: AsyncMapChainCallbacks | ResultCb<ResultCbArgs>,
    errorCb?: ErrorCb<ErrorCbArgs>,
  ): void
  thenable<T>(input): Promise<T>
  readonly state: State
  asyncMapController?: unknown
}

const allowedTransitions = {
  init: ['awaited', 'asyncMapInProgress', 'error'],
  awaited: ['asyncMapInProgress', 'error'],
  asyncMapInProgress: ['asyncMapInProgress', 'awaitingAsyncMap', 'awaitingContinue', 'error'],
  awaitingAsyncMap: ['awaitingContinue', 'asyncMapInProgress', 'done', 'error'],
  awaitingContinue: ['awaitingAsyncMap', 'error'],
  done: ['error'],
  error: ['error'],
}

/**
 * a simpler version of `asyncMapChain` without any bells or whistles, including no error handling
 * @param asyncMapArray
 * @returns `AsyncMapChainIFace`
 */
const asyncMapChain = (...asyncMapArray: AsyncMap[]): AsyncMapChainIFace => {
  let state: State = 'init'
  let resolveAsyncMap: (() => void) | undefined
  let emptyCb: ChainEmptyCb
  let finalResultCb: ResultCb
  let finalErrorCb: ErrorCb
  let iFace: AsyncMapChainIFace
  let speakers: ((...args) => any)[] = []
  let itemsAdded = 0

  const q = enhancedMap<AsyncMap>()

  const throwError = (msg: string) => {
    state = 'error'
    throw new Error(msg)
  }

  const transitionTo = (newState: State) => {
    if (state === 'error') return false
    if (!(allowedTransitions[state] as string[]).includes(newState)) throwError(`transition from '${state}' to '${newState}' not allowed`)
    state = newState
    return true
  }

  const canResolveOnlyOnce = () => {
    let resolvedFnName: string
    return (resolutionFnName: string, resolutionFn: (...args: unknown[]) => void) =>
      (...args: unknown[]) => {
        if (resolvedFnName) {
          if (resolvedFnName !== resolutionFnName) throwError(`cannot call '${resolutionFnName}' after '${resolvedFnName}'`)
          throwError(`cannot call '${resolutionFnName}' more than once`)
        }
        resolvedFnName = resolutionFnName
        delete iFace.asyncMapController
        resolutionFn(...args)
      }
  }

  const processNext = (currentInput: unknown[], currentAsyncMap: AsyncMap) => {
    const awaitNextInputThenAwaitNextAsyncMap = (...resultArgs) => {
      const resolveAsyncMap_ = () => {
        const asyncMap = q.shift()
        if (asyncMap === undefined) throwError('should not happen!')
        resolveAsyncMap = undefined
        processNext(resultArgs, asyncMap as AsyncMap)
      }
      resolveAsyncMap = resolveAsyncMap_
      if (q.size !== 0) resolveAsyncMap()
      else if (transitionTo('awaitingContinue')) {
        const awaitingIndex = itemsAdded
        resolveAsyncMap = undefined

        const continueAwaiting = () => {
          if (transitionTo('awaitingAsyncMap')) {
            resolveAsyncMap = resolveAsyncMap_
            if (q.size !== 0) resolveAsyncMap()
          }
        }

        const completeChain = (...results) => {
          if (awaitingIndex !== itemsAdded) throwError(`subsequent 'AsyncMap'(s) where added. 'finalResultFn' cannot be called from this 'onEmptyChain'`)
          if (transitionTo('awaitingAsyncMap')) finalResultCb(...results)
        }

        const resolveEmptyCbOnlyOnce = canResolveOnlyOnce()

        emptyCb(
          resultArgs,
          resolveEmptyCbOnlyOnce('continueAwaiting', continueAwaiting),
          resolveEmptyCbOnlyOnce('finalResultFn', completeChain),
          resolveEmptyCbOnlyOnce('finalErrorFn', finalErrorCb),
        )
      }
    }
    const resolveAsyncMapOnlyOnce = canResolveOnlyOnce()
    let hasResolved = false
    const resolver =
      (fn) =>
      (...args) => {
        hasResolved = true
        fn(...args)
      }
    if (transitionTo('asyncMapInProgress')) {
      try {
        const asyncMapController = currentAsyncMap(
          currentInput,
          resolver(resolveAsyncMapOnlyOnce('resultCb', awaitNextInputThenAwaitNextAsyncMap)),
          resolver(resolveAsyncMapOnlyOnce('errorCb', finalErrorCb)),
          ...speakers,
        )
        /** if currentAsyncMap is not sync, then set asyncMapController */
        if (!hasResolved) iFace.asyncMapController = asyncMapController
      } catch (e) {
        // debugger
        resolver(resolveAsyncMapOnlyOnce('errorCb', finalErrorCb))(e)
      }
    }
  }

  const basicAdd = (...asyncMaps: AsyncMap[]) => {
    asyncMaps.forEach((asyncMap) => {
      q.set(itemsAdded, asyncMap)
      itemsAdded += 1
    })
    if (q.size !== 0 && resolveAsyncMap !== undefined) resolveAsyncMap()
  }

  iFace = {
    add: basicAdd,
    await: (input, callbacks, errorCb?) => {
      if (state !== 'init') throwError('await cannot be called more than once')

      const cbs: AsyncMapChainCallbacks = typeof callbacks === 'function' ? { onFinalResult: callbacks as (...results) => void } : callbacks
      if (cbs.speakers !== undefined) speakers = cbs.speakers
      if (errorCb) cbs.onError = errorCb

      finalResultCb = (...results) => {
        if (transitionTo('done')) {
          if (cbs.onFinalResult !== undefined) cbs.onFinalResult(...results)
          else throwError(`final result returned, but no 'onFinalResult' callback provided to handle it`)
        }
      }

      finalErrorCb = (...results) => {
        transitionTo('error')
        if (cbs.onError) cbs.onError(...results)
        else throw new Error(`uncaught exception thrown or an 'errorCb' was made, but no 'onError' callback was provided to handle it.  Results returned: ${results.toString()}`)
      }

      if (cbs.onEmptyChain === undefined) {
        if (cbs.onFinalResult === undefined) emptyCb = (_result, continueAwaiting) => continueAwaiting()
        else if (q.size === 0) {
          iFace.add = (...asyncMaps: AsyncMap[]) => {
            emptyCb = (result, _continueAwaiting, fResultCb) => fResultCb(...result)
            iFace.add = basicAdd
            iFace.add(...asyncMaps)
          }
          emptyCb = (_result, continueAwaiting) => continueAwaiting()
        } else emptyCb = (result, _continueAwaiting, fResultCb) => fResultCb(...result)
      } else emptyCb = cbs.onEmptyChain

      processNext(input, (i, resultsCb) => resultsCb(i))
    },
    thenable: (input) => asyncMapToPromise(iFace.await, input),
    get state() {
      return state
    },
  }
  iFace.add(...asyncMapArray)
  return iFace
}

// const simpleAsyncMapChain = (chainLinks: ChainLinks, input: Input) => {
//   let finalDone: ResultCb
//   let priorChain: any = (result) => finalDone(result)
//   const addLink = (linkToAdd: ChainLink) => {
//     const fn = priorChain
//     priorChain = (result) => linkToAdd(result, fn)
//   }
//   return (finalResultCb: ResultCb) => {
//     finalDone = finalResultCb
//     chainLinks[reverseForEach]((link) => addLink(link))
//     priorChain(input)
//   }
// }
export default asyncMapChain
