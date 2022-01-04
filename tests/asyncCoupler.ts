import { expect } from 'chai'
import { asyncCoupler } from '../src/index'

// eslint-disable-next-line @typescript-eslint/no-empty-function
const noop = () => {}

describe('asyncCoupler', () => {
  it('asyncCoupler', (done) => {
    let i = 1
    const coupler = asyncCoupler()
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
      done()
    })
  })
  it('asyncCouple other way around', (done) => {
    let i = 1
    const coupler = asyncCoupler()
    coupler.addOutgoingCallback((incomingCb) => {
      console.log(`i: ${i}`)
      i += 1
      incomingCb(i)
    })
    coupler.addIncomingCallback((result) => {
      console.log(`result: ${result}`)
      expect(result).to.equal(2)
      done()
    })
  })
  it('throws an error for outgoingCallback', () => {
    const coupler = asyncCoupler()
    coupler.addOutgoingCallback(noop)
    expect(() => coupler.addOutgoingCallback(noop)).to.throw('outgoingCallback already added')
  })
  it('throws an error for incomingCallback', () => {
    const coupler = asyncCoupler()
    coupler.addIncomingCallback((res) => res())
    expect(() => coupler.addIncomingCallback((res) => res())).to.throw('incomingCallback already added')
  })
})
