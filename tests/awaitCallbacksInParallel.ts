// import { expect } from 'chai'

import { awaitCallbacksInParallel } from '../src/index'

describe('awaitCallbacksInParallel', () => {
  it('awaitCallbacksInParallel', (done) => {
    const itemFn = (string: string, doneCb: (result: string) => void) => () => {
      console.log(string)
      doneCb(string)
    }
    const y = awaitCallbacksInParallel([
      (doneCb: (result: string) => void) => itemFn('x a', doneCb)(),
      (doneCb: (result: string) => void) => setTimeout(itemFn('x b', doneCb), 100),
      (doneCb: (result: string) => void) => setTimeout(itemFn('x c', doneCb), 200),
      (doneCb: (result: string) => void) => setTimeout(itemFn('x d', doneCb), 100),
      (doneCb: (result: string) => void) => itemFn('x e', doneCb)(),
    ])
    y((results) => {
      console.log(results)
      done()
    })
  })
})
