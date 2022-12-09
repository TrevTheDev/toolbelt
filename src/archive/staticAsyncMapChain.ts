/* eslint-disable @typescript-eslint/no-explicit-any */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
// import './reverseForEach'
// import { globalReverseForEach as reverseForEach } from '.'
import {
  AnyAsyncMap,
  asyncMapToPromise,
  ErrorCbAny,
  GetErrorCbArg,
  GetResultCbArg,
  ListenersAny,
  ResultCbAny,
} from './asyncMap'
import { enhancedMap } from './smallUtils'

// type AsyncMap = (input: any, resultCb: (...results: any) => any, errorCb: (...results: any) => any, ...speakers: ((...args) => any)[]) => any

export interface AsyncMapChainCallbacks {
  onAsyncMapResult?: (callback: (result, processNext: (...inputs) => void) => void) => void
  onFinalResult?: (...results) => void
  onError?: (...errorArgs) => void
  speakers?: ((...args) => any)[]
}
/**
 * `init`: start state
 * `awaited`: state immediately after `await` fn called and before an `AsyncMap` is being processed
 * `asyncMapInProgress`: await a result from an `AsyncMap`
 * `done` `onFinalResult` callback made
 * `error` made or tried to make `onError` callback
 */

type State = 'awaited' | 'asyncMapInProgress' | 'done' | 'error' | 'cancelled'

interface StaticAsyncMapChainController<T extends AnyAsyncMap[]> {
  readonly state: State
  cancel: () => void
  controller?: T
}

export interface StaticAsyncMapChainIFace<T extends AnyAsyncMap[]> {
  add(...asyncMaps: T): void
  await<Input, ResultCb extends (value) => void, ErrorCb extends (reason?) => void | never>(
    input: Input,
    resolve: ResultCb,
    reject?: ErrorCb,
  ): void
  await<
    Input,
    ResultCb extends (value) => void,
    ErrorCb extends (reason?) => void | never,
    Listeners extends ((...args: never[]) => void)[] = [],
  >(
    input: Input,
    resultCb: ResultCb,
    errorCb: ErrorCb,
    ...listeners: Listeners
  ): StaticAsyncMapChainController<T>
  thenable(input): Promise<T>
}

const stateMachine = (
  startState: State,
  resultCb?: (...args) => void,
  errorCb?: (...args) => void,
) => {
  const allowedTransitions = {
    awaited: ['asyncMapInProgress', 'error'],
    asyncMapInProgress: ['awaited', 'done', 'error', 'cancelled'],
    done: [],
    error: [],
    cancelled: [],
  }
  let state = startState
  let throwOnMultipleResolves = true

  const iFace = {
    to: (newState: State): boolean | never => {
      // if in an end state do nothing but return false
      if (allowedTransitions[state].length === 0) return false
      if (!(allowedTransitions[state] as string[]).includes(newState)) {
        iFace.toError(new Error(`transition from '${state}' to '${newState}' not allowed`))
        return false
      }
      state = newState
      return true
    },
    toError: (...results): never | void => {
      if (allowedTransitions[state].length === 0) {
        if (throwOnMultipleResolves) {
          throw new Error(
            `errorCb called multiple times, or an uncaught exception was thrown post resolution. Results returned: ${results.toString()}`,
          )
        }
        return
      }
      state = 'error'
      if (!errorCb) {
        throw new Error(
          `uncaught exception thrown or 'errorCb' made, but no 'onError' callback was provided to handle it. Results returned: ${results.toString()}`,
        )
      }
      errorCb(...results)
    },
    toDone: (...results) => {
      if (allowedTransitions[state].length === 0) {
        if (throwOnMultipleResolves) {
          throw new Error(
            `errorCb called multiple times, or an uncaught exception was thrown post resolution. Results returned: ${results.toString()}`,
          )
        }
        return
      }
      if (iFace.to('done')) {
        if (!resultCb) {
          throw new Error(
            `a result was returned but no 'onResult' callback was provided to handle it. Results returned: ${results.toString()}`,
          )
        }
        resultCb(...results)
      }
    },
    toCancelled: () => {
      if (allowedTransitions[state].length === 0)
        throw new Error(`chain is already in a 'done', 'error', or 'cancelled' state`)
      if (iFace.to('cancelled')) throwOnMultipleResolves = false
    },
    get state() {
      return state
    },
  }
  return iFace
}

const enhancedAsyncMap = <T extends AnyAsyncMap>(
  asyncMap: T,
  throwChainError: (error: unknown) => never | void,
  beforeBeingResolvedCb: () => void,
): T => {
  let resolvedFnName: string

  const resolveOnlyOnce = <R extends GetResultCbArg<T> | GetErrorCbArg<T>>(
    resolutionFnName: string,
    resolutionFn: R,
  ) =>
    ((result) => {
      if (resolvedFnName) {
        return throwChainError(
          resolvedFnName !== resolutionFnName
            ? `cannot call '${resolutionFnName}' after '${resolvedFnName}'`
            : `cannot call '${resolutionFnName}' more than once`,
        )
      }
      resolvedFnName = resolutionFnName
      beforeBeingResolvedCb()
      return resolutionFn(result)
    }) as R

  return ((input, resultCb, errorCb, ...listeners) =>
    asyncMap(
      input,
      resolveOnlyOnce('resultCb', resultCb),
      resolveOnlyOnce('errorCb', errorCb),
      ...listeners,
    )) as T
}

/**
 * a simpler version of `asyncMapChain` without any bells or whistles, including no error handling
 * @param asyncMapArray
 * @returns `AsyncMapChainIFace`
 */
const staticAsyncMapChain = <T extends AnyAsyncMap[]>(...asyncMapArray: T) => {
  const q = enhancedMap<AnyAsyncMap>()

  const iFace: StaticAsyncMapChainIFace<T> = {
    add: (...asyncMaps) => {
      asyncMaps.forEach((asyncMap) => q.add(asyncMap))
    },

    await: (input, resultCb, errorCb?, ...speakers) => {
      const state = stateMachine('awaited', resultCb, errorCb)

      let index = 0
      const queue = [...q.values]

      // debugger

      const aController: StaticAsyncMapChainController<T> = {
        get state() {
          return state.state
        },
        cancel: () => state.to('cancelled'),
      }

      const processNext = (currentInput, currentAsyncMap) => {
        const processNextAsyncMapOrEnd = (...resultArgs) => {
          if (index === queue.length) return state.toDone(...resultArgs)

          const map = queue[index]
          index += 1
          return state.to('awaited') ? processNext(resultArgs, map) : undefined
        }

        let hasResolved = false
        if (state.to('asyncMapInProgress')) {
          try {
            const eaMap = enhancedAsyncMap(currentAsyncMap, state.toError, () => {
              delete aController.controller
              hasResolved = true
            })
            const asyncMapController = eaMap(
              currentInput,
              processNextAsyncMapOrEnd,
              state.toError,
              ...speakers,
            )
            /** if currentAsyncMap is not sync, then set asyncMapController */
            if (!hasResolved) aController.controller = asyncMapController
          } catch (e) {
            delete aController.controller
            hasResolved = true
            state.toError(e)
          }
        }
      }

      processNext(input, (i, resultsCb) => resultsCb(i))

      return aController
    },
    thenable: (input) => asyncMapToPromise(iFace.await, input),
  }
  iFace.add(...asyncMapArray)
  return iFace
}

export default staticAsyncMapChain
