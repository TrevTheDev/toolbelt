/* eslint-disable @typescript-eslint/no-explicit-any */
import { enhancedMap } from './smallUtils'
import type { AnyAsyncMap, ErrorCb, ResultCb } from './asyncMap'
import type { EnhancedMap } from './smallUtils'

type ChainEmptyCb<ResultCbArgs extends any[] = any[], ErrorCbArgs extends any[] = any[]> = (
  lastResult: unknown,
  finalResultFn: ResultCb<ResultCbArgs>,
  finalErrorFn: ErrorCb<ErrorCbArgs>,
) => void

interface AsyncMapChain {
  add: (asyncMap: AnyAsyncMap, index?: number) => void
  addAsyncMaps: (...asyncMaps: AnyAsyncMap[]) => void
  await: <InputType, ResultCbArgs extends any[], ErrorCbArgs extends any[]>(
    input: InputType,
    resultCb: ResultCb<ResultCbArgs>,
    errorCb?: ErrorCb<ErrorCbArgs>,
    chainEmptyCb?: ChainEmptyCb<ResultCbArgs, ErrorCbArgs>,
  ) => void
  readonly queue: EnhancedMap<AnyAsyncMap>
  readonly totalAsyncMapsDone: number
  readonly state: 'init' | 'awaited' | 'awaiting' | 'empty' | 'done' | 'error'
}

/**
 * chains `AsyncMap`s together.  Output from one, being the input of its successor.
 * the chain may also infinite. `await` provides an `chainEmptyCb` that occurs every time
 * the chain is empty, and which can optionally, end the chain.
 *
 * @param asyncMapArray optional array of `AsyncMap`'s to chain together
 * @param autoDoneOnEmptyChain whether to end the chain once the initial chain is empty.  Default is true
 * @returns `AsyncMapChain`
 */
const asyncMapChain = (asyncMapArray?: AnyAsyncMap[], autoDoneOnEmptyChain = true): AsyncMapChain => {
  let currentItemIndex = 0
  let autoItemIndex = 0
  let chainResultCb
  let chainErrorCb
  let onChainEmpty
  let lastResult: any
  let state: 'init' | 'awaited' | 'awaiting' | 'empty' | 'done' | 'error' = 'init'

  const q = enhancedMap<AnyAsyncMap>()

  const processNextItem = (): void => {
    setImmediate(() => {
      // debugger
      if (state !== 'awaited' && state !== 'empty') return
      const asyncMap = q.get(currentItemIndex)
      if (asyncMap) {
        state = 'awaiting'
        asyncMap(
          lastResult,
          (...resultArgs) => {
            lastResult = resultArgs
            state = 'awaited'
            q.delete(currentItemIndex)
            currentItemIndex += 1
            processNextItem()
          },
          chainErrorCb,
        )
      } else onChainEmpty()
    })
  }

  const addAsyncMap = (asyncMap, index?) => {
    const key: number = index === undefined ? autoItemIndex : index
    autoItemIndex += 1
    if (!['init', 'awaited', 'awaiting', 'empty'].includes(state)) throw new Error(`asyncChain must be in a state of 'init', 'awaited' or 'awaiting' to add AsyncMaps`)
    if (q[key]) throw new Error(`element with index : ${index} already added`)
    q.add(asyncMap, key)
  }

  const chain: AsyncMapChain = {
    await: <InputType, ResultCbArgs extends any[], ErrorCbArgs extends any[]>(
      input: InputType,
      resultCb: ResultCb<ResultCbArgs>,
      errorCb?: ErrorCb<ErrorCbArgs>,
      chainEmptyCb?: ChainEmptyCb<ResultCbArgs, ErrorCbArgs>,
    ) => {
      if (state !== 'init') throw new Error('chain cannot be awaited more than once!')
      state = 'awaited'
      lastResult = input
      chainResultCb = (...resultArgs: ResultCbArgs) => {
        state = 'done'
        if (q.size !== 0) throw new Error('done called, but queue is not empty')
        setImmediate(() => resultCb(...resultArgs))
      }
      chainErrorCb = (...errorArgs: ErrorCbArgs) => {
        state = 'error'
        if (!errorCb) throw new Error('An AsyncMap made an errorCb, but no finalErrorCb was supplied to handle it!')
        setImmediate(() => errorCb(...errorArgs))
      }
      onChainEmpty = () => {
        state = 'empty'
        if (chainEmptyCb) chainEmptyCb(lastResult, chainResultCb, chainErrorCb)
        if (autoDoneOnEmptyChain) chainResultCb(...lastResult)
      }
      processNextItem()
    },
    add: (asyncMap, index?) => {
      addAsyncMap(asyncMap, index)
      processNextItem()
    },
    addAsyncMaps: (...asyncMaps) => {
      asyncMaps.forEach((asyncMap) => addAsyncMap(asyncMap))
      processNextItem()
    },
    get queue() {
      return q
    },
    get totalAsyncMapsDone() {
      return currentItemIndex
    },
    get state() {
      return state
    },
  }

  if (asyncMapArray) chain.addAsyncMaps(...asyncMapArray)
  return chain
}

export const awaitAsyncMapChain = Symbol('awaitAsyncMapChain')

declare global {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface Array<T> {
    [awaitAsyncMapChain]: (this: AnyAsyncMap[], input: any, resultCb: ResultCb, errorCb?: ErrorCb) => void
  }
}

if (typeof Array.prototype[awaitAsyncMapChain] !== 'function') {
  // eslint-disable-next-line no-extend-native, func-names
  Array.prototype[awaitAsyncMapChain] = function (this, input, resultCb, errorCb) {
    asyncMapChain(this).await(input, resultCb, errorCb)
  }
}

export default asyncMapChain
