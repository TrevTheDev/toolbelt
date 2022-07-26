/* eslint-disable mocha/no-exclusive-tests */
import { describe, it, expect } from 'vitest'

import staticAsyncMapChain from '../src/staticAsyncMapChain'

const asyncMapFn = (transformFn: (result: string) => string, timeOut?: number) => (input: string, resultCb: (result: string) => void) => {
  if (timeOut) setTimeout(() => resultCb(transformFn(input)), timeOut)
  else resultCb(transformFn(input))
}
const asyncAdd = (text: string) => asyncMapFn((input: string) => `${input}${text}`, 100)
const add = (text: string) => asyncMapFn((input: string) => `${input}${text}`)
// const asyncAdd1 = asyncMapFn((input: number) => input + 1, 100)
// const asyncDelay = asyncMapFn((input: number) => input, 100)
const makeErrorCb = (input, _resultCb, errorCb) => errorCb(...input)
const throwError = (input) => {
  throw new Error(input)
}

const doNotCall = () => expect(true).toBe(false)
const finalResultCb = (expectedResult: string, doneCb?: (arg) => void) => (result) => {
  console.log(`Result: ${result}`)
  expect(result).toEqual(expectedResult)
  if (doneCb) doneCb(undefined)
}

describe('staticAsyncMapChain', () => {
  it('staticAsyncMapChain on input array', () =>
    new Promise((done) => {
      const y = staticAsyncMapChain(asyncAdd('A'), add('B'), asyncAdd('C'), add('D'), asyncAdd('E'))
      y.await('0', finalResultCb('0ABCDE'))
      y.await('1', finalResultCb('1ABCDE'))
      y.await('2', finalResultCb('2ABCDE'))
      y.await('3', finalResultCb('3ABCDE'))
      y.add(add('F'))
      y.await('4', finalResultCb('4ABCDEF', done))
    }))
  it('staticAsyncMapChain handles errorCb', () =>
    new Promise((done) => {
      const y = staticAsyncMapChain(asyncAdd('A'), add('B'), asyncAdd('C'), add('D'), asyncAdd('E'), makeErrorCb)
      y.await('0', doNotCall, finalResultCb('0ABCDE'))
      y.await('1', doNotCall, finalResultCb('1ABCDE', done))
    }))
  it.only('staticAsyncMapChain handles thrown errors', () =>
    new Promise((done) => {
      const y = staticAsyncMapChain(asyncAdd('A'), add('B'), asyncAdd('C'), add('D'), asyncAdd('E'), throwError)
      y.await('0', doNotCall, (result) => finalResultCb('0ABCDE', done)(result.message))
      y.await('1', doNotCall, (result) => finalResultCb('1ABCDE', done)(result.message))
    }))
})

// const chain = asyncMapChain(getFile, splitFile, searchOnline, consolidateResults, formatResults)

// stream -> new stream -y-> new Conversation      -> process stream
//                      -n-> existing Conversation -> process stream
