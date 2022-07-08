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
// const makeErrorCb = (input, _resultCb, errorCb) => errorCb(...input)
// const throwError = (input) => {
//   throw new Error(...input)
// }

// const doNotCall = () => expect(true).toBe(false)
const finalResultCb = (expectedResult: string, doneCb?: (arg) => void) => (result) => {
  console.log(`Result: ${result}`)
  expect(result).toEqual(expectedResult)
  if (doneCb) doneCb(undefined)
}

describe('staticAsyncMapChain', () => {
  it('staticAsyncMapChain on input array', () =>
    new Promise((done) => {
      const y = staticAsyncMapChain(asyncAdd('A'), add('B'), asyncAdd('C'), add('D'), asyncAdd('E'))
      // const goTo = y.if(startsWithEven,(result)=>{console.log(`Even:${result}`)})
      // y.if(startsWithOdd,(result)=>{console.log(`Odd:${result}`)})
      // y.if(true,(result)=>{goTo(result)})
      // goTo.if(len10,()=>)

      y.await('0', finalResultCb('0ABCDE'))
      y.await('1', finalResultCb('1ABCDE'))
      y.await('2', finalResultCb('2ABCDE'))

      y.await('3', finalResultCb('3ABCDE'))
      debugger
      y.add(add('F'))
      y.await('4', finalResultCb('4ABCDEF', done))
    }))
})

// const chain = asyncMapChain(getFile, splitFile, searchOnline, consolidateResults, formatResults)

// stream -> new stream -y-> new Conversation      -> process stream
//                      -n-> existing Conversation -> process stream
