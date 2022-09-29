/* eslint-disable no-bitwise */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { enhancedMap } from '.'
import type { EnhancedMap } from '.'
import { Union } from './typescript utils'

type AnyCallback = (...args: never[]) => void
type IncomingCallback<T extends AnyCallback> = T
type OutgoingCallback<T extends AnyCallback> = (incomingCallback: IncomingCallback<T>) => void

type AddOutgoingCallback<T extends AnyCallback> = (
  outgoingCallback: OutgoingCallback<T>,
  index?: number,
) => void
type AddIncomingCallback<T extends AnyCallback> = (
  incomingCallback: IncomingCallback<T>,
  index?: number,
) => void

export type AsyncCoupler<
  OutgoingCallbackName extends string,
  IncomingCallbackName extends string,
  T extends AnyCallback,
  U = {
    [key in OutgoingCallbackName]: AddOutgoingCallback<T>
  } & { [key in IncomingCallbackName]: AddIncomingCallback<T> } & {
    readonly incomingCallbacks: EnhancedMap<IncomingCallback<T>>
    readonly outgoingCallbacks: EnhancedMap<OutgoingCallback<T>>
  },
> = U extends infer O ? { [K in keyof O]: O[K] } : never

type Z = AsyncCoupler<'A', 'B', (a: any) => any>

const modifyAnyThrownErrors = (fn: () => void, modifiedErrorMsg: string) => {
  try {
    fn()
  } catch (e) {
    throw new Error(modifiedErrorMsg)
  }
}

/**
 * Enables the coupling of two async callbacks: `incomingCallback` and `outgoingCallback` - which can be renamed
 * as require. The callbacks may be added in any sequence and are enqueued.
 * Once both callbacks have been added: `outgoingCallback(incomingCallback)` is called
 * optionally, instead of FIFO, a manual index my be specified causing callbacks to be made in index order
 *
 * Example:
 * ```
 * const coupler = customAsyncCoupler<'addA', 'addB', (result: number) => void>('addA', 'addB')
 * coupler.addA((incomingCb) => incomingCb(1))
 * coupler.addB((result) => {
 *   console.log(`result: ${result}`) // result: 1
 * })
 * ```
 *
 * If callbacks always arrive in the same order then there are better solutions than this one.
 * @param {string} outgoingCallbackName
 * @param {string} incomingCallbackName
 * @param {boolean} indexed
 * @returns
 */
export function asyncCoupler<
  OutgoingCallbackName extends string,
  IncomingCallbackName extends string,
  T extends AnyCallback,
>(
  outgoingCallbackName: OutgoingCallbackName,
  incomingCallbackName: IncomingCallbackName,
  indexed?: boolean,
) {
  const incomingCallbacks = enhancedMap<IncomingCallback<T>>()
  const outgoingCallbacks = enhancedMap<OutgoingCallback<T>>()
  let currentIdx = 1
  const makeNextCallback = () => {
    const outgoingCallback = outgoingCallbacks.get(currentIdx)
    const incomingCallback = incomingCallbacks.get(currentIdx)
    if (outgoingCallback && incomingCallback) {
      incomingCallbacks.delete(currentIdx)
      outgoingCallbacks.delete(currentIdx)
      currentIdx += 1
      outgoingCallback(incomingCallback)
      makeNextCallback()
    }
  }
  const addOutgoingCallback: AddOutgoingCallback<T> = (
    outgoingCallback: OutgoingCallback<T>,
    index = 1,
  ) => {
    const incomingCallback = incomingCallbacks.get(currentIdx)
    if (incomingCallback) {
      incomingCallbacks.delete(currentIdx)
      if (indexed && index <= currentIdx) throw new Error(`index: ${index} already processed`)
      if (indexed) currentIdx += 1
      outgoingCallback(incomingCallback)
      if (indexed) makeNextCallback()
    } else {
      modifyAnyThrownErrors(
        () => outgoingCallbacks.add(outgoingCallback, index),
        'outgoingCallback already added',
      )
    }
  }

  const addIncomingCallback: AddIncomingCallback<T> = (
    incomingCallback: IncomingCallback<T>,
    index = 1,
  ) => {
    const outgoingCallback = outgoingCallbacks.get(currentIdx)
    if (outgoingCallback) {
      outgoingCallbacks.delete(currentIdx)
      if (indexed && index <= currentIdx) throw new Error(`index: ${index} already processed`)
      if (indexed) currentIdx += 1
      outgoingCallback(incomingCallback)
      if (indexed) makeNextCallback()
    } else {
      modifyAnyThrownErrors(
        () => incomingCallbacks.add(incomingCallback, index),
        'incomingCallback already added',
      )
    }
  }
  return {
    [outgoingCallbackName]: addOutgoingCallback,
    [incomingCallbackName]: addIncomingCallback,
    incomingCallbacks,
    outgoingCallbacks,
  } as unknown as AsyncCoupler<OutgoingCallbackName, IncomingCallbackName, T>
}

const defaultAsyncCoupler = <T extends AnyCallback>(indexed?: boolean) =>
  asyncCoupler<'addOutgoingCallback', 'addIncomingCallback', T>(
    'addOutgoingCallback',
    'addIncomingCallback',
    indexed,
  )

export default defaultAsyncCoupler
