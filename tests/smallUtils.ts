import { describe, it, expect } from 'vitest'
import { capitaliseWords, capitalise, callbackTee, requireValue } from '../src/smallUtils'

describe('smallUtils', () => {
  it('callbackResolverQueue basic', () => {
    let aCounter = 0
    const cbQueue = callbackTee<[string]>()
    cbQueue.addCallback((result) => {
      aCounter += 1
      expect(aCounter).toEqual(1)
      expect(result).toEqual('A')
    })
    cbQueue.addCallback((result) => {
      aCounter += 1
      expect(aCounter).toEqual(2)
      expect(result).toEqual('A')
    })
    cbQueue.callCallbacks('A') // `1:A` and `2:A`
    let bCounter = 0
    const cbQueue2 = callbackTee<[string]>({
      callInReverseOrder: true,
    })
    cbQueue2.addCallback((result) => {
      bCounter += 1
      expect([2, 4].includes(bCounter)).toBeTruthy()
      expect(result).toEqual('B')
    })
    cbQueue2.addCallback((result) => {
      bCounter += 1
      expect([1, 3].includes(bCounter)).toBeTruthy()
      expect(result).toEqual('B')
    })
    cbQueue2.callCallbacks('B')
    expect(aCounter).toEqual(2)
    expect(bCounter).toEqual(2)
    cbQueue2.callCallbacks('B')
    expect(bCounter).toEqual(4)
  })
  it('callbackResolverQueue once only', () => {
    // debugger
    let aCounter = 0
    const cbQueue = callbackTee<[string]>({
      canCallOnlyOnce: true,
    })
    cbQueue.addCallback((result) => {
      aCounter += 1
      expect(aCounter).toEqual(1)
      expect(result).toEqual('A')
    })
    cbQueue.addCallback((result) => {
      aCounter += 1
      expect(aCounter).toEqual(2)
      expect(result).toEqual('A')
    })
    debugger
    cbQueue.callCallbacks('A') // `1:A` and `2:A`
    expect(() => cbQueue.callCallbacks('B')).toThrowError(
      `cannot call 'callCallbacks' more than once`,
    )
  })
  it('callbackResolverQueue can add callbacks after resolved', () => {
    // debugger
    let aCounter = 0
    const cbQueue = callbackTee<[string]>({
      resolvePerpetually: true,
      canCallOnlyOnce: true,
    })
    cbQueue.addCallback((result) => {
      aCounter += 1
      expect(aCounter).toEqual(1)
      expect(result).toEqual('A')
    })
    cbQueue.callCallbacks('A')
    cbQueue.addCallback((result) => {
      // debugger
      aCounter += 1
      expect(aCounter).toEqual(2)
      expect(result).toEqual('A')
    })
  })
  it('requireValue', () => {
    const fn = requireValue((a: any) => a)

    // debugger
    expect(fn('a')).toEqual('a')
    expect(fn(true)).toEqual(true)
    expect(fn(false)).toEqual(false)
    expect(fn(0)).toEqual(0)
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    expect(() => fn()).toThrowError('this function requires a value')
    expect(() => fn(null)).toThrowError('this function requires a value')
    expect(() => fn(undefined)).toThrowError('this function requires a value')
    expect(() => fn([])).toThrowError('this function requires a value')
    const fn2 = requireValue((a: any) => a, 'error')
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    expect(() => fn2()).toThrowError('error')
  })
  it('capitalise', () => {
    const x = 'string'[capitaliseWords]()
    expect(x).to.equal(`String`)
    const y = 'string'[capitalise]()
    expect(y).to.equal(`String`)
  })
})
// const chain = asyncMapChain(getFile, splitFile, searchOnline, consolidateResults, formatResults)

// stream -> new stream -y-> new Conversation      -> process stream
//                      -n-> existing Conversation -> process stream
