/* eslint-disable mocha/no-exclusive-tests */
import { describe, it, expect, vi } from 'vitest'

import asyncMapChain from '../src/asyncMapChain'

const asyncMapFn = (transformFn, timeOut?) => (input, resultCb) => {
  if (timeOut) setTimeout(() => resultCb(transformFn(input)), timeOut)
  else resultCb(transformFn(input))
}
const asyncAddA = asyncMapFn((input: string) => `${input}A`, 100)
const addB = asyncMapFn((input: string) => `${input}B`)
const asyncAddC = asyncMapFn((input: string) => `${input}C`, 100)
const addD = asyncMapFn((input: string) => `${input}D`)
const asyncAddE = asyncMapFn((input: string) => `${input}E`, 100)
const asyncAdd1 = asyncMapFn((input: number) => input + 1, 100)
const asyncDelay = asyncMapFn((input: number) => input, 100)
const makeErrorCb = (input, _resultCb, errorCb) => errorCb(...input)
const throwError = (input) => {
  throw new Error(...input)
}

const doNotCall = () => expect(true).toBe(false)
const finalResultCb = (expectedResult, doneCb?) => (result) => {
  console.log(`Final Result: ${result}`)
  expect(result).toEqual(expectedResult)
  if (doneCb) doneCb(undefined)
}

describe('asyncMapChain', () => {
  it('asyncMapChain on input array', () =>
    new Promise((done) => {
      const y = asyncMapChain(asyncAddA, addB, asyncAddC, addD, asyncAddE)
      y.await('0', finalResultCb('0ABCDE', done))
    }))

  it('asyncMapChain basic', () =>
    new Promise((done) => {
      const y = asyncMapChain()
      y.add(asyncAddA)
      y.add(addB)
      y.add(asyncAddC)
      y.add(addD)
      y.add(asyncAddE)
      y.await('1', finalResultCb('1ABCDE', done))
    }))
  it('chain empty, manual done', () =>
    new Promise((done) => {
      const y = asyncMapChain(asyncAddA, addB, asyncAddC)
      y.await('2', {
        onFinalResult: finalResultCb('2ABCDE', done),
        onEmptyChain: (partialChainResult, doneFn, resultCb) => {
          // debugger
          const r: string = (<[string]>partialChainResult)[0]
          if (r === '2ABC') y.add(addD)
          if (r === '2ABCD') y.add(asyncAddE)
          if (r === '2ABCDE') resultCb(r)
          else doneFn()
        },
      })
    }))
  it('await before adding', () =>
    new Promise((done) => {
      const y = asyncMapChain()
      y.await('2', {
        onFinalResult: finalResultCb('2AB', done),
        onEmptyChain: (partialChainResult, doneFn, resultCb) => {
          // debugger
          const r: string = (<[string]>partialChainResult)[0]
          if (r === '2AB') resultCb(r)
          else doneFn()
        },
      })
      y.add(asyncAddA)
      y.add(addB)
    }))
  it('if multiple items added in first add, then onFinalResult should be called once processed', () =>
    new Promise((done) => {
      const y = asyncMapChain()
      y.await('4', finalResultCb('4ABCDE', done))
      y.add(asyncAddA, addB, asyncAddC, addD, asyncAddE)
    }))

  it('cannot await twice', () => {
    const resultCb = vi.fn()
    const y = asyncMapChain()
    y.await('5', resultCb)
    y.add(asyncAddA, addB, asyncAddC, addD, asyncAddE)
    expect(() => y.await('5', (result) => console.log(result))).toThrowError('await cannot be called more than once')
    expect(resultCb).not.toBeCalled()
  })

  it('can handle sync fns that return immediately', () =>
    new Promise((done) => {
      const y = asyncMapChain()
      y.await('Z', finalResultCb('ZBDBD', done))
      y.add(addB, addD, addB, addD)
    }))
  it('throws if finalResultCb call after item added', () =>
    new Promise((done) => {
      const resultCb = vi.fn()
      const y = asyncMapChain()
      y.await(1, {
        onFinalResult: resultCb as (...result) => void,
        onEmptyChain: ([partialChainResult], _doneFn, fResultCb) => {
          const r = partialChainResult as number
          asyncDelay(r, (result) => {
            expect(result).toEqual(1)
            expect(() => fResultCb(result)).toThrowError(`subsequent 'AsyncMap'(s) where added. 'finalResultFn' cannot be called from this 'onEmptyChain'`)
            expect(resultCb).not.toBeCalled()
            done(undefined)
          })
        },
      })
      y.add(asyncAdd1)
    }))
  it('handles errors', () =>
    new Promise((done) => {
      const y = asyncMapChain()
      y.await('Z', {
        onFinalResult: doNotCall,
        onError: finalResultCb('ZABCDE', done),
      })
      y.add(asyncAddA, addB, asyncAddC, addD, asyncAddE, makeErrorCb, doNotCall)
    }))
  it('handles thrown errors', () =>
    new Promise((done) => {
      const y = asyncMapChain()
      y.await('V', {
        onFinalResult: doNotCall,
        onError: (result) => finalResultCb('VABCDE', done)(result.message),
      })
      y.add(asyncAddA, addB, asyncAddC, addD, asyncAddE, throwError, doNotCall)
    }))

  it('cannot call AsyncMapChainCallbacks more than once', () =>
    new Promise((done) => {
      const y = asyncMapChain(asyncAddA, addB, asyncAddC, addD, asyncAddE)
      y.await('T', {
        onFinalResult: (arg) => finalResultCb('TABCDE')(arg),
        onEmptyChain: ([r], doneFn, resultCb, errorCb) => {
          resultCb(r)
          expect(y.state).toBe('done')
          expect(() => resultCb(r)).toThrowError(`cannot call 'finalResultFn' more than once`)
          expect(y.state).toBe('error')
          expect(() => doneFn()).toThrowError(`cannot call 'continueAwaiting' after 'finalResultFn'`)
          expect(() => errorCb(r)).toThrowError(`cannot call 'finalErrorFn' after 'finalResultFn'`)
          if (r === 'TABCDE') done(undefined)
        },
      })
    }))

  it('cannot call resultCb more than once', () =>
    new Promise((done) => {
      const y = asyncMapChain(([input], resultCb, errorCb) => {
        expect(input).toEqual('X')
        expect(y.state).toBe('asyncMapInProgress')
        resultCb('A')
        expect(y.state).toBe('awaitingAsyncMap')
        y.add(addB)
        expect(y.state).toBe('awaitingAsyncMap')
        y.add(asyncAddC)
        expect(y.state).toBe('asyncMapInProgress')
        expect(() => resultCb('Y')).toThrowError(`cannot call 'resultCb' more than once`)
        expect(y.state).toBe('error')
        expect(() => errorCb('Z')).toThrowError(`cannot call 'errorCb' after 'resultCb'`)
        done(undefined)
      })
      y.await('X', {
        onFinalResult: doNotCall,
        onError: (...results) => console.log(results),
        onEmptyChain: ([result], continues) => {
          console.log(result)
          continues()
        },
      })
    }))

  it('can communicate via an AsyncMapController', () =>
    new Promise((done) => {
      const y = asyncMapChain(
        addB,
        asyncAddA,
        (_input, resultCb, _errorCb, sendCancel) => {
          // debugger
          sendCancel()
          const asyncMapController = (cancelReason) => {
            console.log(cancelReason)
            resultCb(cancelReason)
          }
          return asyncMapController
        },
        addB,
        ([input], _resultCb, errorCb, sendCancel) => {
          sendCancel()
          expect(input).toEqual('cancelledB')
          const asyncMapController2 = (cancelReason) => {
            console.log(cancelReason)
            errorCb('cancelled2')
          }
          return asyncMapController2
        },
      )
      y.await('X', {
        onFinalResult: doNotCall,
        onError: (result) => {
          console.log(result)
          expect(result).toEqual('cancelled2')
          done(undefined)
        },
        speakers: [
          () =>
            setTimeout(() => {
              ;(y.asyncMapController as (string) => void)('cancelled')
            }, 100),
        ],
      })
    }))

  it('is thenable', async () => {
    const y = asyncMapChain(asyncAddA, addB, asyncAddC, addD, asyncAddE)
    const result = await y.thenable('ZAG')
    expect(result).toEqual('ZAGABCDE')
  })

  // it.only('throws if errors not handled', async () => {
  //   try {
  //     const pms = new Promise(() => {
  //       const y = simpleAsyncMapChain()
  //       y.await('S', doNotCall)
  //       try {
  //         y.add(asyncAddA, throwError)
  //       } catch (e) {
  //         debugger
  //       }
  //     })
  //     try {
  //       await pms
  //     } catch (e) {
  //       debugger
  //     }
  //   } catch (e) {
  //     debugger
  //   }
  // })
})

// const chain = asyncMapChain(getFile, splitFile, searchOnline, consolidateResults, formatResults)

// stream -> new stream -y-> new Conversation      -> process stream
//                      -n-> existing Conversation -> process stream
