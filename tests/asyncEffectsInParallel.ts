// import { expect } from 'chai'

import { expect } from 'chai'
import { callbacksInParallel } from '../src/index'

type DoneCb = (result: string)=>void
type ErrorCb = (error: Error)=>void

describe('awaitCallbacksInParallel', () => {
  it('awaitCallbacksInParallel', (done) => {
    const itemFn = (string: string, doneCb: DoneCb) => () => {
      console.log(string)
      doneCb(string)
    }
    callbacksInParallel(
      [
        (doneCb: DoneCb) => itemFn('x a', doneCb)(),
        (doneCb: DoneCb) => setTimeout(itemFn('x b', doneCb), 100),
        (doneCb: DoneCb) => setTimeout(itemFn('x c', doneCb), 200),
        (doneCb: DoneCb) => setTimeout(itemFn('x d', doneCb), 100),
        (doneCb: DoneCb) => itemFn('x e', doneCb)(),
      ],
      (results) => {
        console.log(results)
        done()
      },
    )
  })
  it('errors', (done) => {
    const possiblyAsyncFn = (
      string: string,
      doneCb: DoneCb,
      timeOut,
      error:ErrorCb,
      throws = false,
    ) => {
      const fn = () => {
        console.log(string)
        if (throws && error) error(new Error(string))
        else doneCb(string)
      }
      if (timeOut) setTimeout(fn, timeOut)
      else fn()
      return undefined
    }

    callbacksInParallel<[result: string], [error: Error]>(
      [
        (fnDone: DoneCb, errorCb: ErrorCb) => possiblyAsyncFn('xa', fnDone, undefined, errorCb),
        (fnDone: DoneCb, errorCb: ErrorCb) => possiblyAsyncFn('xb', fnDone, 100, errorCb),
        (fnDone: DoneCb, errorCb: ErrorCb) => possiblyAsyncFn('xc', fnDone, 200, errorCb, true),
        (fnDone: DoneCb, errorCb: ErrorCb) => possiblyAsyncFn('xd', fnDone, 300, errorCb),
        (fnDone: DoneCb, errorCb: ErrorCb) => possiblyAsyncFn('xe', fnDone, undefined, errorCb),
      ],
      (results, errors) => {
        debugger
        console.log(`${results}`)
        console.log(`${errors}`)
        expect(errors.length).to.equal(1)
        expect(results.length).to.equal(4)
        debugger
        done()
      },
      (error, resultQueue, errorQueue, cancelQueue) => {
        expect(`${error}`).to.equal('Error: xc')
        expect(errorQueue.length).to.equal(1)
        expect(resultQueue.length).to.equal(3)
        expect(cancelQueue.length).to.equal(0)
      },
    )
  })
  it('cancels', (done) => {
    const possiblyAsyncFn = (
      string: string,
      doneCb: DoneCb,
      timeOut,
      error:ErrorCb,
      throws,
      shouldCancel,
      doDone?,
    ) => {
      let cancelled = false
      const fn = () => {
        console.log(string)
        if (!cancelled) {
          if (throws && error) error(new Error(string))
          else doneCb(string)
        }
      }
      if (timeOut) setTimeout(fn, timeOut)
      else fn()
      return (reason) => {
        debugger
        expect(shouldCancel).to.equal(true)
        expect(reason).to.equal('xc')
        cancelled = true
        if (doDone) done()
      }
    }

    const cancel = callbacksInParallel<[result: string], [error: Error]>(
      [
        (fnDone: DoneCb, errorCb: ErrorCb) => possiblyAsyncFn('xa', fnDone, undefined, errorCb, false, false),
        (fnDone: DoneCb, errorCb: ErrorCb) => possiblyAsyncFn('xb', fnDone, 200, errorCb, false, true),
        (fnDone: DoneCb, errorCb: ErrorCb) => possiblyAsyncFn('xc', fnDone, 100, errorCb, true, false),
        (fnDone: DoneCb, errorCb: ErrorCb) => possiblyAsyncFn('xd', fnDone, 300, errorCb, false, true, true),
        (fnDone: DoneCb, errorCb: ErrorCb) => possiblyAsyncFn('xe', fnDone, undefined, errorCb, false, false),
      ],
      () => expect(true).to.equal(false),
      (error, resultQueue, errorQueue, cancelQueue) => {
        debugger
        expect(`${error}`).to.equal('Error: xc')
        expect(errorQueue.length).to.equal(1)
        expect(resultQueue.length).to.equal(2)
        expect(cancelQueue.length).to.equal(2)
        cancel('xc')
      },
    )
  })
})
