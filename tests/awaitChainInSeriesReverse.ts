// import { expect } from 'chai'

import { awaitChainInSeriesReverse } from '../src/index'

describe('awaitChainInSeriesReverse', () => {
  it('awaitChainInSeriesReverse', (done) => {
    const itemFn = (string: string, doneCb: () => void) => () => {
      console.log(string)
      doneCb()
    }
    const y = awaitChainInSeriesReverse([
      (doneCb: () => void) => itemFn('x a', doneCb)(),
      (doneCb: () => void) => setTimeout(itemFn('x b', doneCb), 100),
      (doneCb: () => void) => setTimeout(itemFn('x c', doneCb), 200),
      (doneCb: () => void) => setTimeout(itemFn('x d', doneCb), 100),
      (doneCb: () => void) => itemFn('x e', doneCb)(),
    ])
    y(() => {
      console.log('x done!')
      done()
    })
  })
})
