import { describe, it, expect } from 'vitest'

import { compose, compose2, compose3 } from '../../src/archive/compose'

const asyncMapFn =
  (transformFn: (result: string) => string, timeOut?: number) =>
  (input: string, resultCb: (result: string) => void) => {
    if (timeOut) setTimeout(() => resultCb(transformFn(input)), timeOut)
    else resultCb(transformFn(input))
  }
const asyncAdd = (text: string) => asyncMapFn((input: string) => `${input}${text}`, 100)
const add = (text: string) => asyncMapFn((input: string) => `${input}${text}`)
const addN = (num: number) => (input: number, resultCb: (res: number) => void) =>
  resultCb(num + input)
// const asyncAdd1 = asyncMapFn((input: number) => input + 1, 100)
// const asyncDelay = asyncMapFn((input: number) => input, 100)
const makeErrorCb = (input, _resultCb, errorCb) => errorCb(...input)
const throwError = (input) => {
  throw new Error(input)
}

const doNotCall = () => expect(true).toBe(false)
const canCall = () => expect(true).toBe(true)
const finalizedCb =
  (expectedResult: string, doneCb?: (arg) => void, isErr = false) =>
  (result) => {
    console.log(`Result: ${result}`)
    if (isErr) expect(result.message).toEqual(expectedResult)
    else expect(result).toEqual(expectedResult)
    if (doneCb) doneCb(undefined)
  }

describe('staticAsyncMapChain', () => {
  it('compose basic', () =>
    new Promise((done) => {
      const y = compose3(
        asyncAdd('A'),
        (_input: string, resultCb: (num: number) => void) => resultCb(5),
        addN(1),
      )
      const z = compose3(y, asyncAdd('C'))
      z('0', finalizedCb('0ABC'))
      z('1', finalizedCb('1ABC', done))
    }))
  it.only('compose2 basic', () =>
    new Promise((done) => {
      const y = compose2([asyncAdd('A'), asyncAdd('B')])
      y('0', finalizedCb('0AB', done))
      // const z = compose2(y, asyncAdd('C'))

      // z('1', finalizedCb('1ABC', done))
    }))
  it('compose2 catches errors', () =>
    new Promise((done) => {
      const y = compose2([asyncAdd('A'), throwError])
      y('0', doNotCall, finalizedCb('0A', done, true))
    }))
  it('compose2 only resolves once', () =>
    new Promise((done) => {
      const y = compose2((input, resultCb, errorCb) => {
        resultCb(`${input}A`)
        setImmediate(() => {
          debugger
          expect(() => resultCb(`${input}ERR`)).toThrowError(
            `'resultCb' may not be called more than once`,
          )
          expect(() => errorCb(`${input}ERR`)).toThrowError(
            `cannot call 'errorCb' after 'resultCb'`,
          )
        })
      }, asyncAdd('B'))
      y('0', finalizedCb('0AB', done), doNotCall)
    }))
  it('throws if no ErrorCb provided', () =>
    new Promise((done) => {
      const y = compose2((_input, _resultCb, errorCb) => {
        debugger
        expect(() => errorCb(`ERR`)).toThrowError(
          `'errorCb' made, but no 'errorCb' provided to handle it. Error received: ERR`,
        )
        done(undefined)
      }, asyncAdd('B'))
      y('0', doNotCall)
    }))
  it('tracks lifecycle - result', () =>
    new Promise((done) => {
      const callbacks: string[] = []
      const y = compose2(asyncAdd('A'), asyncAdd('B'), undefined, {
        beforeAsyncMapCalledCb: () => callbacks.push('beforeAsyncMapCalledCb'),
        beforeResultCb: () => callbacks.push('beforeResultCb'),
        afterResultCb: () => callbacks.push('afterResultCb'),
        beforeErrorCb: () => callbacks.push('beforeErrorCb'),
        afterErrorCb: () => callbacks.push('afterErrorCb'),
        resolvedCb: () => {
          callbacks.push('resolvedCb')
          expect(callbacks).toEqual([
            'beforeAsyncMapCalledCb',
            'beforeResultCb',
            'afterResultCb',
            'resolvedCb',
          ])
          debugger
          done(undefined)
        },
      })
      y('0', canCall, doNotCall)
    }))
  it('tracks lifecycle - error', () =>
    new Promise((done) => {
      const callbacks: string[] = []
      const y = compose2(asyncAdd('A'), makeErrorCb, undefined, {
        beforeAsyncMapCalledCb: () => callbacks.push('beforeAsyncMapCalledCb'),
        beforeResultCb: () => callbacks.push('beforeResultCb'),
        afterResultCb: () => callbacks.push('afterResultCb'),
        beforeErrorCb: () => callbacks.push('beforeErrorCb'),
        afterErrorCb: () => callbacks.push('afterErrorCb'),
        resolvedCb: () => {
          callbacks.push('resolvedCb')
          expect(callbacks).toEqual([
            'beforeAsyncMapCalledCb',
            'beforeErrorCb',
            'afterErrorCb',
            'resolvedCb',
          ])
          done(undefined)
        },
      })
      y('0', doNotCall, canCall)
    }))
  it('compose2 setImmediate', () =>
    new Promise((done) => {
      const y = compose2(add('A'), add('B'), { wrapInSetImmediate: true })
      y('0', finalizedCb('0AB'))
      y('1', finalizedCb('1AB', done))
    }))
  it('compose2 resolves returned promises', () =>
    new Promise((done) => {
      const y = compose2(asyncAdd('A'), (input, resultCb) => {
        resultCb(
          new Promise((resolve) => {
            setImmediate(() => resolve(`${input}BC`))
          }),
        )
      })
      y('0', finalizedCb('0ABC'))
      y('1', finalizedCb('1ABC', done))
    }))
})

// const chain = asyncMapChain(getFile, splitFile, searchOnline, consolidateResults, formatResults)

// stream -> new stream -y-> new Conversation      -> process stream
//                      -n-> existing Conversation -> process stream
