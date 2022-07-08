/* eslint-disable @typescript-eslint/no-explicit-any */
import { AsyncMap, ResultCb, ErrorCb } from '../asyncMap'
import { curriedRunFunctionOnlyOnce, isObjectAndHasExecutableProperty } from '../smallUtils'

// type ResultCb = (...resultArgs)=>void
// type ErrorCb = (...resultArgs)=>void

interface AsyncMapPromise<T> {
  /**
   * Attaches callbacks for the resolution and/or rejection of the Promise.
   * @param onfulfilled The callback to execute when the Promise is resolved.
   * @param onrejected The callback to execute when the Promise is rejected.
   * @returns A Promise for the completion of which ever callback is executed.
   */
  then<TResult1 = T, TResult2 = never>(
    onfulfilled?: ((value: TResult1) => TResult1 | PromiseLike<TResult1>) | undefined | null,
    onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null,
  ): AsyncMapPromise<TResult1 | TResult2>

  /**
   * Attaches a callback for only the rejection of the Promise.
   * @param onrejected The callback to execute when the Promise is rejected.
   * @returns A Promise for the completion of the callback.
   */
  catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): AsyncMapPromise<T | TResult>
}

export interface AsyncMapPromiseConstructor extends AsyncMapPromise<any> {
  /**
   * Creates a new rejected promise for the provided reason.
   * @param reason The reason the promise was rejected.
   * @returns A new rejected Promise.
   */
  reject<T = never>(reason?: any): AsyncMapPromise<T>

  /**
   * Creates a new resolved promise.
   * @returns A resolved promise.
   */
  resolve(): AsyncMapPromise<void>

  /**
   * Creates a new resolved promise for the provided value.
   * @param value A promise.
   * @returns A promise whose internal state matches the provided promise.
   */
  resolve<T>(value: T | PromiseLike<T>): AsyncMapPromise<T>
}

type PromiseResolvePair = { resolved: ResultCb | undefined | null; rejected: ErrorCb | undefined | null }

type Handler = {
  thenResolver: PromiseResolvePair
  propagateOutput: { resolved: AsyncMapPromiseConstructor['resolve']; rejected: AsyncMapPromiseConstructor['reject'] }
  promise: AsyncMapPromiseConstructor
}

type State = 'pending' | 'resolved' | 'rejected'

const promise = <T>(): AsyncMapPromiseConstructor => {
  const handlers: Handler[] = []
  let state: State = 'pending'
  let value: T
  const justOneTime = curriedRunFunctionOnlyOnce()

  const settle = () => {
    const handler = handlers.shift()
    if (handler === undefined) return
    const childPromise = handler.propagateOutput
    try {
      if (typeof handler.thenResolver[state] === 'function') {
        const thenReturnValue = handler.thenResolver[state](value)
        if (thenReturnValue === handler.promise) childPromise.rejected(new TypeError('A promise cannot be chained to itself.'))
        else childPromise.resolved(thenReturnValue)
      } else childPromise[state](value)
    } catch (e) {
      childPromise.rejected(e)
    }
    settle()
  }

  const setState = (newState: State) => (result: T) => {
    state = newState
    value = result
    queueMicrotask(settle)
  }

  const setStateEventually = (newState: State) => (result) => {
    const oneTime = curriedRunFunctionOnlyOnce()
    try {
      if (isObjectAndHasExecutableProperty(result, 'then')) {
        result.then(oneTime(setStateEventually('resolved')), oneTime(setState('rejected')))
      } else setState(newState)(result as T)
    } catch (e) {
      oneTime(setState('rejected'))(e)
    }
  }

  const apm: AsyncMapPromiseConstructor = {
    resolve: justOneTime(setStateEventually('resolved')),
    reject: justOneTime(setState('rejected')),
    then: (resolved?, rejected?) => {
      const pms = promise()
      handlers.push({
        thenResolver: { resolved, rejected },
        propagateOutput: { resolved: pms.resolve, rejected: pms.reject },
        promise: pms,
      })
      if (state !== 'pending') queueMicrotask(settle) // if resolved
      return pms
    },
    catch: (reason?) => apm.then(undefined, reason),
  }
  return apm
}

export const wrapAsyncMapInPromise =
  <T>(asyncMap?: AsyncMap) =>
  (input: any): AsyncMapPromiseConstructor => {
    const pms = promise<T>()
    if (asyncMap) asyncMap(input, pms.resolve, pms.reject)
    return pms
  }

export const promiseTestObject = {
  resolved: (value?) => wrapAsyncMapInPromise((_input, resolve) => resolve(value))(undefined),
  rejected: (value?) => wrapAsyncMapInPromise((_input, _resolve: ResultCb, reject: ErrorCb) => reject(value))(undefined),
  deferred: () => {
    const pms = wrapAsyncMapInPromise()(undefined)
    return { promise: pms, resolve: pms.resolve, reject: pms.reject }
  },
}
