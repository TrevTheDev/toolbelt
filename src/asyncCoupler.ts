/* eslint-disable no-bitwise */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { queue } from '.'

import type { Queue } from '.'

type IncomingCallback = (...args: any[]) => any
type OutgoingCallback = (incomingCallback: IncomingCallback) => void

type NamedOutgoingCallback<outgoingCallbackName extends string> = {
  [key in outgoingCallbackName]: (outgoingCallback: OutgoingCallback, index?: number) => void
}
type NamedIncomingCallback<incomingCallbackName extends string> = {
  [key in incomingCallbackName]: (outgoingCallback: OutgoingCallback, index?: number) => void
}

type AsyncCouplerShared = {
  readonly incomingCallbacks: Queue<IncomingCallback>
  readonly outgoingCallbacks: Queue<OutgoingCallback>
}

const modifyAnyThrownErrors = (fn, modifiedErrorMsg) => {
  try {
    fn()
  } catch (e) {
    throw new Error(modifiedErrorMsg)
  }
}

// eslint-disable-next-line max-len
export type AsyncCoupler<outgoingCallbackName extends string, incomingCallbackName extends string> = NamedOutgoingCallback<outgoingCallbackName> &
  NamedIncomingCallback<incomingCallbackName> &
  AsyncCouplerShared

// export type AsyncCoupler<outgoingCallbackName extends string, incomingCallbackName extends string> = {
//    [P in outgoingCallbackName | incomingCallbackName]: P extends incomingCallbackName
//    ? (outgoingCallback: OutgoingCallback, index?: number) => void
//    : (incomingCallback: IncomingCallback, index?: number) => void

// }

/**
 * Enables the coupling of two async callbacks: `incomingCallback` and `outgoingCallback`.
 * These callbacks may be added in any sequence.
 * Once both callbacks have been added: `outgoingCallback(incomingCallback)` is called
 * An optional index is available if callbacks must be indexed and run sequentially
 *
 * If callbacks always arrive in the same order then there are simpler solutions than this one.
 */
export function asyncCoupler<OutgoingCallbackName extends string, IncomingCallbackName extends string>(
  outgoingCallbackName: OutgoingCallbackName = 'addOutgoingCallback' as OutgoingCallbackName,
  incomingCallbackName: IncomingCallbackName = 'addIncomingCallback' as IncomingCallbackName,
  indexed = false,
): AsyncCoupler<OutgoingCallbackName, IncomingCallbackName> {
  const incomingCallbacks = queue<IncomingCallback>()
  const outgoingCallbacks = queue<OutgoingCallback>()
  let currentIdx = 1
  const makeNextCallback = () => {
    const outgoingCallback = outgoingCallbacks.queue[currentIdx]
    const incomingCallback = incomingCallbacks.queue[currentIdx]
    if (outgoingCallback && incomingCallback) {
      incomingCallbacks.remove(currentIdx)
      outgoingCallbacks.remove(currentIdx)
      currentIdx += 1
      outgoingCallback(incomingCallback)
      makeNextCallback()
    }
  }
  const addOutgoingCallback = (outgoingCallback: OutgoingCallback, index = 1) => {
    const incomingCallback = incomingCallbacks.queue[currentIdx]
    if (incomingCallback) {
      incomingCallbacks.remove(currentIdx)
      if (indexed && index <= currentIdx) throw new Error(`index: ${index} already processed`)
      if (indexed) currentIdx += 1
      outgoingCallback(incomingCallback)
      if (indexed) makeNextCallback()
    } else {
      modifyAnyThrownErrors(() => outgoingCallbacks.add(outgoingCallback, index), 'outgoingCallback already added')
    }
  }

  const addIncomingCallback = (incomingCallback: IncomingCallback, index = 1) => {
    const outgoingCallback = outgoingCallbacks.queue[currentIdx]
    if (outgoingCallback) {
      outgoingCallbacks.remove(currentIdx)
      if (indexed && index <= currentIdx) throw new Error(`index: ${index} already processed`)
      if (indexed) currentIdx += 1
      outgoingCallback(incomingCallback)
      if (indexed) makeNextCallback()
    } else {
      modifyAnyThrownErrors(() => incomingCallbacks.add(incomingCallback, index), 'incomingCallback already added')
    }
  }
  return {
    [outgoingCallbackName]: addOutgoingCallback,
    [incomingCallbackName]: addIncomingCallback,
    incomingCallbacks,
    outgoingCallbacks,
  } as AsyncCoupler<OutgoingCallbackName, IncomingCallbackName>
}

const defaultAsyncCoupler = (indexed?: boolean) => asyncCoupler('addOutgoingCallback', 'addIncomingCallback', indexed)

export default defaultAsyncCoupler
