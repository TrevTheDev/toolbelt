/* eslint-disable mocha/no-exclusive-tests */
import { describe, it, expect } from 'vitest'

import asyncMapChain, { awaitAsyncMapChain } from '../src/asyncMapChain2'

const asyncMapFn = (transformFn, timeOut?) => (input, resultCb) => {
  if (timeOut) setTimeout(() => resultCb(transformFn(input)), timeOut)
  else resultCb(transformFn(input))
}
const asyncAdd = (str: string) => asyncMapFn((input: string) => `${input}${str}`, 100)
const add = (str: string) => asyncMapFn((input: string) => `${input}${str}`)

describe('asyncMapChain', () => {
  it('asyncMapChain on input array', () =>
    new Promise((done) => {
      const y = asyncMapChain([asyncAdd('A'), add('B'), asyncAdd('C'), add('D'), asyncAdd('E')])
      y.await('0', (result) => {
        console.log(`Final Result: ${result}`)
        expect(result).toEqual('0ABCDE')
        done(undefined)
      })
    }))
  it('asyncMapChain on native array', () =>
    new Promise((done) => {
      ;[asyncAdd('A'), add('B'), asyncAdd('C'), add('D'), asyncAdd('E')][awaitAsyncMapChain]('3', (result) => {
        console.log(`Final Result: ${result}`)
        expect(result).toEqual('3ABCDE')
        done(undefined)
      })
    }))
  it('asyncMapChain basic', () =>
    new Promise((done) => {
      const y = asyncMapChain()
      y.add(asyncAdd('A'))
      y.add(add('B'))
      y.add(asyncAdd('C'))
      y.add(add('D'))
      y.add(asyncAdd('E'))
      y.await('1', (result) => {
        console.log(`Final Result: ${result}`)
        expect(result).toEqual('1ABCDE')
        done(undefined)
      })
    }))
  it('chain empty, manual done', () =>
    new Promise((done) => {
      const y = asyncMapChain(undefined, false)
      y.add(asyncAdd('A'))
      y.add(add('B'))
      y.add(asyncAdd('C'))

      y.await(
        '2',
        (result) => {
          console.log(`Final Result: ${result}`)
          expect(result).toEqual('2ABCDE')
          done(undefined)
        },
        undefined,
        (partialChainResult, finalResultCb) => {
          // debugger
          const r: string = (<[string]>partialChainResult)[0]
          if (r === '2ABC') y.add(add('D'))
          if (r === '2ABCD') y.add(asyncAdd('E'))
          if (r === '2ABCDE') finalResultCb(r)
        },
      )
    }))
})

// const chain = asyncMapChain(getFile, splitFile, searchOnline, consolidateResults, formatResults)

// stream -> new stream -y-> new Conversation      -> process stream
//                      -n-> existing Conversation -> process stream
