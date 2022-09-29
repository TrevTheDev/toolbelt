import { describe, it, expect } from 'vitest'
import { asyncCoupler, customAsyncCoupler } from '../src/index'

// import type { AsyncCoupler } from '../src/index'

// eslint-disable-next-line @typescript-eslint/no-empty-function
const noop = () => {}

describe('asyncCoupler', () => {
  it('asyncCoupler', () =>
    new Promise((done) => {
      let i = 1
      const coupler = asyncCoupler<(result: number) => number>()
      coupler.addIncomingCallback((result) => {
        console.log(`result: ${result}`)
        expect(result).to.equal(2)
        return 3
      })
      coupler.addOutgoingCallback((incomingCb) => {
        console.log(`i: ${i}`)
        i += 1
        const x = incomingCb(i)
        expect(x).to.equal(3)
        done(undefined)
      })
    }))
  it('asyncCouple other way around', () =>
    new Promise((done) => {
      let i = 1
      const coupler = asyncCoupler<(result: number) => void>()
      coupler.addOutgoingCallback((incomingCb) => {
        console.log(`i: ${i}`)
        i += 1
        incomingCb(i)
      })
      coupler.addIncomingCallback((result) => {
        console.log(`result: ${result}`)
        expect(result).to.equal(2)
        done(undefined)
      })
    }))
  it('throws an error for outgoingCallback', () => {
    const coupler = asyncCoupler<(result: number) => void>()
    coupler.addOutgoingCallback(noop)
    expect(() => coupler.addOutgoingCallback(noop)).to.throw('outgoingCallback already added')
  })
  it('throws an error for incomingCallback', () => {
    const coupler = asyncCoupler<(result: () => void) => void>()
    coupler.addIncomingCallback((res) => res())
    expect(() => coupler.addIncomingCallback((res) => res())).to.throw(
      'incomingCallback already added',
    )
  })
  it('customised methods', () =>
    new Promise((done) => {
      let i = 1
      // eslint-disable-next-line max-len
      const coupler = customAsyncCoupler<'addA', 'addB', (result: number) => void>('addA', 'addB')
      coupler.addA((incomingCb) => {
        console.log(`i: ${i}`)
        i += 1
        incomingCb(i)
      })
      coupler.addB((result) => {
        console.log(`result: ${result}`)
        expect(result).to.equal(2)
        done(undefined)
      })
    }))
})
