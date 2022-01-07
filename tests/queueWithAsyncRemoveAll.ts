/* eslint-disable dot-notation */
import { expect } from 'chai'
import { queueWithAsyncRemoveAll } from '../src/index'

describe('queueWithAsyncRemoveAll', () => {
  it('queueWithAsyncRemoveAll', (done) => {
    const q = queueWithAsyncRemoveAll<string>()
    const remove = q.add('a')
    expect(q.length).to.equal(1)
    remove()
    expect(q.length).to.equal(0)
    q.addItems('a', 'b', 'c')
    expect(q.length).to.equal(3)
    done()
    const awaitRemoval = q.removeAll((item, done1) => {
      console.log(item)
      setTimeout(done1, 10)
    })
    awaitRemoval(() => {
      debugger
      expect(q.length).to.equal(0)
      done()
    })
  })
  it('using index', () => {
    const q = queueWithAsyncRemoveAll<string>()
    q.add('a', 'a')
    q.add('b', 'b')
    q.add('c', 'c')
    expect(q.queue['a']).to.equal('a')
    expect(q.queue['b']).to.equal('b')
    expect(q.queue['c']).to.equal('c')
    q.remove('a')
    expect(q.queue['a']).to.equal(undefined)
  })
})
