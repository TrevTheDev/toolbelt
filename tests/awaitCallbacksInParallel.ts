// import { expect } from 'chai'

import { awaitCallbacksInParallel } from '../src/index'

describe('awaitCallbacksInParallel', () => {
  it('awaitCallbacksInParallel', (done) => {
    const itemFn = (string: string, doneCb: () => void) => () => {
      console.log(string)
      doneCb()
    }
    const y = awaitCallbacksInParallel([
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
