/* eslint-disable no-bitwise */
/* eslint-disable @typescript-eslint/no-explicit-any */

type IncomingCallback = (...args: any[])=>any
type OutgoingCallback = (incomingCallback: IncomingCallback)=>void

interface OutgoingCallbacks {
  [index:number]: OutgoingCallback
}

interface IncomingCallbacks {
  [index:number]: IncomingCallback
}

export type AsyncCoupler<outgoingCallbackName extends string, incomingCallbackName extends string> = {
   [P in outgoingCallbackName | incomingCallbackName]: P extends incomingCallbackName
   ? (outgoingCallback: OutgoingCallback, index?: number) => void
   : (incomingCallback: IncomingCallback, index?: number) => void
}

/**
 * Enables the coupling of two async callbacks: `incomingCallback` and `outgoingCallback`.
 * These callbacks may be added in any sequence.
 * Once both callbacks have been added: `outgoingCallback(incomingCallback)` is called
 * An optional index is available if callbacks must be indexed and run sequentially
 *
 * If callbacks always arrive in the same order then this is likely not the right tool to use.
 */
export function asyncCoupler <OutgoingCallbackName extends string, IncomingCallbackName extends string>(
  outgoingCallbackName: OutgoingCallbackName = 'addOutgoingCallback' as OutgoingCallbackName,
  incomingCallbackName: IncomingCallbackName = 'addIncomingCallback' as IncomingCallbackName,
  indexed = false,
): AsyncCoupler<OutgoingCallbackName, IncomingCallbackName> {
  const incomingCallbacks: IncomingCallbacks = {}
  const outgoingCallbacks: OutgoingCallbacks = {}
  let currentIdx = 0
  const makeNextCallback = () => {
    const outgoingCallback = outgoingCallbacks[currentIdx]
    const incomingCallback = incomingCallbacks[currentIdx]
    if (outgoingCallback && incomingCallback) {
      delete incomingCallbacks[currentIdx]
      delete outgoingCallbacks[currentIdx]
      currentIdx += 1
      outgoingCallback(incomingCallback)
      makeNextCallback()
    }
  }
  const addOutgoingCallback = (outgoingCallback: OutgoingCallback, index = 0) => {
    const incomingCallback = incomingCallbacks[currentIdx]
    if (incomingCallback) {
      delete incomingCallbacks[currentIdx]
      if (indexed) currentIdx += 1
      outgoingCallback(incomingCallback)
      if (indexed) makeNextCallback()
    } else {
      if (outgoingCallbacks[index]) throw new Error('outgoingCallback already added, another one can not be added.')
      outgoingCallbacks[index] = outgoingCallback
    }
  }

  const addIncomingCallback = (incomingCallback: IncomingCallback, index = 0) => {
    const outgoingCallback = outgoingCallbacks[currentIdx]
    if (outgoingCallback) {
      delete outgoingCallbacks[currentIdx]
      if (indexed) currentIdx += 1
      outgoingCallback(incomingCallback)
      if (indexed) makeNextCallback()
    } else {
      if (incomingCallbacks[index]) throw new Error('incomingCallback already added, another one can not be added.')
      incomingCallbacks[index] = incomingCallback
    }
  }
  return {
    [outgoingCallbackName]: addOutgoingCallback,
    [incomingCallbackName]: addIncomingCallback,
  } as AsyncCoupler<OutgoingCallbackName, IncomingCallbackName>
}

const defaultAsyncCoupler : (indexed?: boolean) => AsyncCoupler<'addOutgoingCallback', 'addIncomingCallback'> = (
  indexed,
) => asyncCoupler(undefined, undefined, indexed)

export default defaultAsyncCoupler
