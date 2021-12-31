// modified from https://github.com/djfm/promesse
import runFunctionOnlyOnce from './runFunctionOnlyOnce'

/* eslint @typescript-eslint/no-explicit-any: off */

// eslint-disable-next-line no-use-before-define
export type OnFulfilled<T> = ((value: T) => T | PromesseLike<T>)
// eslint-disable-next-line no-use-before-define
export type OnRejected = ((reason: any) => never | PromesseLike<never>)

interface PromesseLike<T> {
    then(
        onFulfilled?: OnFulfilled<T>,
        onRejected?: OnRejected
    ): PromiseLike<T | never>;
}

interface Promesse<T> {
    then(
        onFulfilled?: OnFulfilled<T>,
        onRejected?: OnRejected
    ): Promesse<T | never>;

    catch?(
        onRejected?: OnRejected
    ): Promesse<T | never>;
}

type PromiseResolvePair<T> = { resolved: OnFulfilled<T> | undefined, rejected: OnRejected | undefined }
type KnownPromiseResolvePair<T> = { resolved: OnFulfilled<T>, rejected: OnRejected }

type Deferred<T> = {
    resolve: OnFulfilled<T>,
    reject: OnRejected,
    promise: Promesse<T>
}

type Handler<T> = {
    transformInput: PromiseResolvePair<T>,
    propagateOutput: PromiseResolvePair<T>,
    promise: Promesse<T>
}

type State = 'pending' | 'resolved' | 'rejected'

const maybeThenable = (value) => value && (typeof value === 'object' || typeof value === 'function')

const wrapInNewDeferred = (fn: (deferred: Deferred<any>) => void): Promesse<any> => {
  // eslint-disable-next-line no-use-before-define
  const d = deferred()
  setImmediate(fn, d)
  return d.promise
}

const deferred = (): Deferred<any> => {
  let handlers: Handler<any>[] = []
  let state: State = 'pending'
  let value: any
  const justOneTime = runFunctionOnlyOnce()

  const settle = () => {
    if (state !== 'pending') {
      handlers.forEach((handler) => {
        const hand: KnownPromiseResolvePair<any> = <KnownPromiseResolvePair<any>>handler.propagateOutput
        try {
          if (typeof handler.transformInput[state] === 'function') {
            const transformedValue = handler.transformInput[state](value)
            if (transformedValue === handler.promise)
              hand.rejected(new TypeError('A promise cannot be chained to itself.'))
            else
              hand.resolved(transformedValue)
          } else hand[state](value)
        } catch (e) {
          hand.rejected(e)
        }
      })
      handlers = []
    }
  }

  const setState = (newState: State) => (result: any) => {
    state = newState
    value = result
    setImmediate(settle)
  }

  const setStateEventually = (newState: State) => (result: PromesseLike<any> | any) => {
    const oneTime = runFunctionOnlyOnce()
    try {
      if (maybeThenable(result)) {
        const { then } = result
        if (typeof then === 'function') {
          then.call(
            result,
            oneTime(setStateEventually('resolved')),
            oneTime(setState('rejected')),
          )
        } else setState(newState)(result)
      } else setState(newState)(result)
    } catch (e) {
      oneTime(setState('rejected'))(e)
    }
  }

  return {
    resolve: justOneTime(setStateEventually('resolved')),
    reject: justOneTime(setState('rejected')),
    promise: {
      then: (resolved, rejected) => wrapInNewDeferred((d) => {
        handlers.push({
          transformInput: { resolved, rejected },
          propagateOutput: { resolved: d.resolve, rejected: d.reject },
          promise: d.promise,
        })
        settle()
      }),
    },
  }
}

const Promesse = {
  resolved: (value) => wrapInNewDeferred((d) => d.resolve(value)),
  rejected: (value) => wrapInNewDeferred((d) => d.reject(value)),
  deferred,
}
export default Promesse
