// import { expect } from 'chai'

import { describe, it, expect } from 'vitest'

import { asyncEffectsInParallel, asyncEffectsInParallelS } from '../src/index'
import { times } from '../src/smallUtils'

type DoneCb = (result: string) => void
type ErrorCb = (error: string) => void

const doNotCall = () => expect(true).toBe(false) as unknown as never

describe('awaitCallbacksInParallel', () => {
  it('awaitCallbacksInParallel', () =>
    new Promise((done) => {
      const itemFn = (string: string, doneCb: DoneCb) => () => {
        console.log(string)
        doneCb(string)
      }
      const x = asyncEffectsInParallel(
        (doneCb: DoneCb) => itemFn('a', doneCb)(),
        (doneCb: DoneCb) => setTimeout(itemFn('b', doneCb), 100),
        (doneCb: DoneCb) => setTimeout(itemFn('c', doneCb), 200),
        (doneCb: DoneCb) => setTimeout(itemFn('d', doneCb), 100),
        (doneCb: DoneCb) => itemFn('e', doneCb)(),
      )
      x.await((results) => {
        debugger
        expect(`${results}`).toEqual('a,b,c,d,e')
        done(undefined)
      }, doNotCall)
    }))
  it('errors', () =>
    new Promise((done) => {
      const possiblyAsyncFn = (
        string: string,
        doneCb: DoneCb,
        timeOut,
        error: ErrorCb,
        errors = false,
      ) => {
        const fn = () => {
          console.log(string)
          if (errors && error) error(string)
          else doneCb(string)
        }
        if (timeOut) setTimeout(fn, timeOut)
        else fn()
        return undefined
      }

      const x = asyncEffectsInParallelS(
        [
          (fnDone: DoneCb, errorCb: ErrorCb) => possiblyAsyncFn('a', fnDone, undefined, errorCb),
          (fnDone: DoneCb, errorCb: ErrorCb) => possiblyAsyncFn('b', fnDone, 100, errorCb),
          (fnDone: DoneCb, errorCb: ErrorCb) => possiblyAsyncFn('c', fnDone, 200, errorCb, true),
          (fnDone: DoneCb, errorCb: ErrorCb) => possiblyAsyncFn('d', fnDone, 300, errorCb),
          (fnDone: DoneCb, errorCb: ErrorCb) => possiblyAsyncFn('e', fnDone, undefined, errorCb),
        ],
        doNotCall,
        (errors, results) => {
          debugger
          console.log(`${results}`)
          expect(`${errors}`).toEqual(',,c,,')
          expect(`${results}`).toEqual('a,b,,d,e')
          debugger
          done(undefined)
        },
      )
      console.log(x.state)
    }))
  it.skip('cancels', () =>
    new Promise((done) => {
      const possiblyAsyncFn = (
        string: string,
        doneCb: DoneCb,
        timeOut,
        error: ErrorCb,
        throws,
        shouldCancel,
        doDone?,
      ) => {
        let cancelled = false
        const fn = () => {
          console.log(string)
          if (!cancelled) {
            if (throws && error) error(string)
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
          if (doDone) done(undefined)
        }
      }

      const cancel = asyncEffectsInParallelS(
        [
          (fnDone: DoneCb, errorCb: ErrorCb) =>
            possiblyAsyncFn('a', fnDone, undefined, errorCb, false, false),
          (fnDone: DoneCb, errorCb: ErrorCb) =>
            possiblyAsyncFn('b', fnDone, 200, errorCb, false, true),
          (fnDone: DoneCb, errorCb: ErrorCb) =>
            possiblyAsyncFn('c', fnDone, 100, errorCb, true, false),
          (fnDone: DoneCb, errorCb: ErrorCb) =>
            possiblyAsyncFn('d', fnDone, 300, errorCb, false, true, true),
          (fnDone: DoneCb, errorCb: ErrorCb) =>
            possiblyAsyncFn('e', fnDone, undefined, errorCb, false, false),
        ],
        doNotCall,
        (errors, results) => {
          debugger
          expect(`${errors}`).to.equal('')
          expect(`${results}`).to.equal('a')
        },
      )
    }))
  it.only('benchmark', () =>
    new Promise((done) => {
      const max = 100000

      const benchAsyncEffectsInParallel = (promiseLapse: number) => {
        const results = new Array(max) as [
          a: (resolve: DoneCb) => void,
          ...asyncEffects: ((resolve: DoneCb) => void)[],
        ]
        const t1 = Date.now()
        times(max, (i) => {
          results[i] = (resolve: DoneCb) => resolve(`${i}`)
        })
        const t2 = Date.now()
        const y = asyncEffectsInParallel(...results)
        y.await((_res) => {
          const t3 = Date.now()
          // debugger
          console.log(`
          asyncEffectsInParallel:
          t1: ${t1}
          t2: ${t2}, lapsed ${t2 - t1}
          t3: ${t3}, lapsed ${t3 - t2}
          total lapsed ${t3 - t1}
          factor: ${promiseLapse / (t3 - t1)} times faster
          `)
          done(undefined)
        })
      }

      const benchPromiseAll = () => {
        const results2 = new Array<Promise<string>>(max)
        const t1 = Date.now()
        times(max, (i) => {
          results2[i] = new Promise<string>((resolve) => {
            resolve(`${i}`)
          })
        })
        const t2 = Date.now()
        const y = Promise.all(results2)
        y.then((_res) => {
          const t3 = Date.now()
          // debugger
          console.log(`Promises:
          t1: ${t1}
          t2: ${t2}, lapsed ${t2 - t1}
          t3: ${t3}, lapsed ${t3 - t2}
          total lapsed ${t3 - t1}
          `)
          benchAsyncEffectsInParallel(t3 - t1)
        })
      }
      benchPromiseAll()
    }))
})
