/* eslint-disable @typescript-eslint/no-explicit-any */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
// import './reverseForEach'
// import { globalReverseForEach as reverseForEach } from '.'
import { Input, ResultCb, ErrorCb, AsyncMap, asyncMapToPromise } from './asyncMap'
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

interface StaticAsyncMapChainController<T = void> {
  readonly state: State
  cancel: () => void
  controller?: T
}

export interface StaticAsyncMapChainIFace<
  InputType extends Input = unknown,
  ResultCbArgs extends any[] = unknown[],
  ErrorCbArgs extends any[] = unknown[],
  Speakers extends [resultCb: ResultCb<ResultCbArgs>, errorCb?: ErrorCb<ErrorCbArgs>, ...speakers: ((...args) => any)[]] = [
    resultCb: ResultCb<ResultCbArgs>,
    errorCb: ErrorCb<ErrorCbArgs>,
    ...speakers: ((...args: unknown[]) => unknown)[],
  ],
  StaticAsyncMapChainControllerType = void,
> {
  add(...asyncMaps: AsyncMap<InputType, ResultCbArgs, ErrorCbArgs, Speakers, StaticAsyncMapChainControllerType>[]): void
  await(input: InputType, resolve: (value) => void, reject?: (reason?) => void): void
  await(input: InputType, resultCb: ResultCb<ResultCbArgs>, errorCb?: ErrorCb<ErrorCbArgs>, ...speakers: Speakers): StaticAsyncMapChainController<StaticAsyncMapChainControllerType>
  thenable(input): Promise<ResultCbArgs>
  // if(condition: ((...results)=>boolean)|boolean, asyncMap: AsyncMap): StaticAsyncMapChainIFace
}
// type x = StaticAsyncMapChainIFace['await']

// interface OutputCoordinator {
//   // eslint-disable-next-line no-use-before-define
//   if(condition: ((...results) => boolean) | boolean, aNode: ANode): StaticAsyncMapChainIFace
// }

// type InputCoordinator = (requestHandler: (...requestArgs, resultsCb: (...inputArgs) => void) => void) => void

// interface ANode {
//   asyncMap: AsyncMap
//   await<InputType extends Input, ResultCbArgs extends any[], ErrorCbArgs extends any[]>(
//     input: InputType,
//     resultCb: ResultCb<ResultCbArgs>,
//     errorCb?: ErrorCb<ErrorCbArgs> | undefined,
//     ...speakers: ((...args) => any)[]
//   ): Controller
//   outputCoordinator?: OutputCoordinator
//   inputCoordinator?: InputCoordinator
// }

const stateMachine = (startState: State, resultCb?: (...args) => void, errorCb?: (...args) => void) => {
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
        if (throwOnMultipleResolves) throw new Error(`errorCb called multiple times, or an uncaught exception was thrown post resolution. Results returned: ${results.toString()}`)
        return
      }
      state = 'error'
      if (!errorCb) throw new Error(`uncaught exception thrown or 'errorCb' made, but no 'onError' callback was provided to handle it. Results returned: ${results.toString()}`)
      errorCb(...results)
    },
    toDone: (...results) => {
      if (allowedTransitions[state].length === 0) {
        if (throwOnMultipleResolves) throw new Error(`errorCb called multiple times, or an uncaught exception was thrown post resolution. Results returned: ${results.toString()}`)
        return
      }
      if (iFace.to('done')) {
        if (!resultCb) throw new Error(`a result was returned but no 'onResult' callback was provided to handle it. Results returned: ${results.toString()}`)
        resultCb(...results)
      }
    },
    toCancelled: () => {
      if (allowedTransitions[state].length === 0) throw new Error(`chain is already in a 'done', 'error', or 'cancelled' state`)
      if (iFace.to('cancelled')) throwOnMultipleResolves = false
    },
    get state() {
      return state
    },
  }
  return iFace
}

const enhancedAsyncMap = (asyncMap, throwChainError: (error) => never | void, beforeBeingResolvedCb: () => void) => {
  let resolvedFnName: string

  const resolveOnlyOnce =
    (resolutionFnName: string, resolutionFn: (...args) => void) =>
    (...args) => {
      if (resolvedFnName)
        throwChainError(resolvedFnName !== resolutionFnName ? `cannot call '${resolutionFnName}' after '${resolvedFnName}'` : `cannot call '${resolutionFnName}' more than once`)
      else {
        resolvedFnName = resolutionFnName
        beforeBeingResolvedCb()
        resolutionFn(...args)
      }
    }

  return (input, resultCb, errorCb, ...speakers) => asyncMap(input, resolveOnlyOnce('resultCb', resultCb), resolveOnlyOnce('errorCb', errorCb), ...speakers)
}

/**
 * a simpler version of `asyncMapChain` without any bells or whistles, including no error handling
 * @param asyncMapArray
 * @returns `AsyncMapChainIFace`
 */
const staticAsyncMapChain = <
  InputType extends Input = unknown,
  ResultCbArgs extends any[] = unknown[],
  ErrorCbArgs extends any[] = unknown[],
  Speakers extends [resultCb: ResultCb<ResultCbArgs>, errorCb?: ErrorCb<ErrorCbArgs>, ...speakers: ((...args) => any)[]] = [
    resultCb: ResultCb<ResultCbArgs>,
    errorCb: ErrorCb<ErrorCbArgs>,
  ],
  StaticAsyncMapChainControllerType = void,
>(
  ...asyncMapArray: AsyncMap<InputType, ResultCbArgs, ErrorCbArgs, Speakers, StaticAsyncMapChainControllerType>[]
) => {
  const q = enhancedMap<AsyncMap<InputType, ResultCbArgs, ErrorCbArgs, Speakers, StaticAsyncMapChainControllerType>>()

  const iFace: StaticAsyncMapChainIFace<InputType, ResultCbArgs, ErrorCbArgs, Speakers, StaticAsyncMapChainControllerType> = {
    add: (...asyncMaps) => {
      asyncMaps.forEach((asyncMap) => q.add(asyncMap))
    },

    await: (input: InputType, resultCb, errorCb?, ...speakers) => {
      const state = stateMachine('awaited', resultCb, errorCb)

      let index = 0
      const queue = [...q.values]

      const aController: StaticAsyncMapChainController<StaticAsyncMapChainControllerType> = {
        get state() {
          return state.state
        },
        cancel: () => state.to('cancelled'),
      }

      // const finalResultCb: ResultCb<ResultCbArgs> = (...results: ResultCbArgs) => {
      //   if (state.to('done')) resultCb(...results)
      //   else throw new Error('resultCb called more than once')
      // }

      // const canResolveOnlyOnce = () => {
      //   let resolvedFnName: string
      //   return (resolutionFnName: string, resolutionFn: ((...args: ResultCbArgs) => void) | ((...args: ErrorCbArgs) => void)) =>
      //     (...args: ResultCbArgs) => {
      //       if (resolvedFnName) {
      //         state.toError(
      //           resolvedFnName !== resolutionFnName ? `cannot call '${resolutionFnName}' after '${resolvedFnName}'` : `cannot call '${resolutionFnName}' more than once`,
      //         )
      //       } else {
      //         resolvedFnName = resolutionFnName
      //         delete aController.controller
      //         resolutionFn(...args)
      //       }
      //     }
      // }

      const processNext = (currentInput: ResultCbArgs, currentAsyncMap: (input_, resultCbs_, errorCb_, ...listeners) => any) => {
        const processNextAsyncMapOrEnd = (...resultArgs: ResultCbArgs) => {
          if (index === queue.length) state.toDone(...resultArgs)
          else {
            const map = queue[index] as unknown as (input_, resultCbs_, errorCb_, ...listeners) => any
            index += 1
            if (state.to('awaited')) processNext(resultArgs, map)
          }
        }

        let hasResolved = false
        if (state.to('asyncMapInProgress')) {
          try {
            const asyncMapController = enhancedAsyncMap(
              currentAsyncMap,
              (...args) => state.toError(...args),
              () => {
                delete aController.controller
                hasResolved = true
              },
            )(currentInput as InputType, processNextAsyncMapOrEnd, state.toError, ...speakers)

            // const asyncMapController = currentAsyncMap(
            //   currentInput as InputType,
            //   resolver(resolveAsyncMapOnlyOnce('resultCb', processNextAsyncMapOrEnd)),
            //   resolver(resolveAsyncMapOnlyOnce('errorCb', finalErrorCb)),
            //   ...speakers,
            // )
            /** if currentAsyncMap is not sync, then set asyncMapController */
            if (!hasResolved) aController.controller = asyncMapController
          } catch (e) {
            delete aController.controller
            hasResolved = true
            state.toError(e)
          }
        }
      }

      processNext(input as ResultCbArgs, (i, resultsCb) => resultsCb(i))

      return aController
    },
    thenable: (input) => asyncMapToPromise(iFace.await, input),
  }
  iFace.add(...asyncMapArray)
  return iFace
}

export default staticAsyncMapChain
