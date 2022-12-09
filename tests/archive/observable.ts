import { vi, describe, it, expect, Mock } from 'vitest'
import observable, { SubscriberT } from '../src/observable'

describe('observable', () => {
  it('basic', () =>
    new Promise((done) => {
      const results: string[] = []
      const subscrbr = {
        next: (value: string) => results.push(value),
        complete: (value: string) => expect(value).toEqual('d'),
      }
      const observble = observable<typeof subscrbr>((subscriber) => {
        subscriber.next('a')
        setTimeout(() => {
          subscriber.next('c')
          subscriber.complete('d')
          expect(results.toString()).toEqual('a,b,c')
          done(undefined)
        }, 100)
        subscriber.next('b')
      })
      const z = observble(subscrbr)
    }))
  it('basic2', () =>
    new Promise((done) => {
      const observble = observable<SubscriberT<{ Next: number; Complete: number }>>(
        (subscriber) => {
          subscriber.next(1)
          setTimeout(() => {
            subscriber.next(3)
            subscriber.complete(4)
            done(undefined)
          }, 100)
          subscriber.next(2)
          return 'x'
        },
      )
      const z = observble({
        next: (value) => console.log(value),
        complete: (value) => console.log(`${value}!done`),
      })
    }))
})
