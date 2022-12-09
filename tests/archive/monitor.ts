import { vi, describe, it, expect, Mock } from 'vitest'
import subscription, { subscriptionAsyncFn } from '../src/monitor'

describe('outcomeHandlers', () => {
  // it('basic', () =>
  //   new Promise((done) => {
  //     const results: string[] = []
  //     const outcomes = outcomeHandlers({
  //       next: (outcome: string, awaitNext: (producerInput) => void) => {
  //         debugger
  //         results.push(outcome)
  //         awaitNext(outcome)
  //       },
  //       done: (value: string) => {
  //         debugger
  //         expect(results.toString()).toEqual('b,c,d')
  //         expect(value).toEqual('d')
  //         done(undefined)
  //       },
  //     })
  //     const z = outcomes.producer((input, outcome) => {
  //       debugger
  //       if (input === 'd') outcome.done(input)
  //       else outcome.next(String.fromCharCode(input.charCodeAt(input.length - 1) + 1))
  //     })
  //     z.start('a')
  //     console.log(z)
  //   }))
  it.only('subscription', () =>
    new Promise((done) => {
      const results: string[] = []
      const z = subscription(
        {
          next(
            outcome: string,
            response: {
              awaitNext(producerInput: string): void
              cancel(value: 'cancel'): void
            },
          ) {
            results.push(outcome)
            response.awaitNext(outcome)
          },
          done(value: 'done') {
            expect(results.toString()).toEqual('b,c,d')
            expect(value).toEqual('d')
            done(undefined)
          },
          cancel(value: 'cancel') {
            console.log(value)
          },
          // error(value: 'error') {
          //   console.log(value)
          // },
        },
        {
          transformer(input, outcome) {
            if (input === 'd') outcome.done('done')
            else outcome.next(String.fromCharCode(input.charCodeAt(input.length - 1) + 1))
          },
          beforeStart(input, start) {
            console.log('beforeStart')
            start(input)
          },
          beforeDone(output, doneA) {
            console.log('beforeDone')
            doneA(output)
          },
          onCancel(value) {
            console.log(value)
          },
        },
        'a',
        {},
      )
      console.log(z)
    }))
  it('autoAwait', () =>
    new Promise((done) => {
      const results: string[] = []
      const z = subscription(
        {
          next: (outcome: string) => {
            results.push(outcome)
            return outcome
          },
          done: (value: string) => {
            expect(results.toString()).toEqual('b,c,d')
            expect(value).toEqual('d')
            done(undefined)
          },
        },
        (input, outcome) => {
          if (input === 'd') outcome.done(input)
          else outcome.next(String.fromCharCode(input.charCodeAt(input.length - 1) + 1))
        },
        'a',
        { autoAwait: true },
      )
      console.log(z)
    }))
  it('autoNext', () =>
    new Promise((done) => {
      const results: string[] = []
      const z = subscription(
        {
          next: (outcome: string, awaitNext: (producerInput) => void) => {
            results.push(outcome)
            if (outcome === 'd') {
              expect(results.toString()).toEqual('b,c,d')
              done(undefined)
            } else awaitNext(outcome)
          },
          done: (value: string) => {
            expect(results.toString()).toEqual('b,c,d')
            expect(value).toEqual('d')
            done(undefined)
          },
        },
        (input) => String.fromCharCode(input.charCodeAt(input.length - 1) + 1),
        'a',
        { autoNext: true },
      )
      console.log(z)
    }))

  it('cancel', () =>
    new Promise((done) => {
      const results: string[] = []
      const z = subscription(
        {
          next: (outcome: string, awaitNext: (producerInput: string) => void) => {
            results.push(outcome)
            awaitNext(outcome)
          },
          cancel: (value: string) => {
            expect(results.toString()).toEqual('b,c,d')
            expect(value).toEqual('d')
            done(undefined)
          },
        },
        (input, outcome) => {
          if (input === 'd') outcome.cancel(input)
          else outcome.next(String.fromCharCode(input.charCodeAt(input.length - 1) + 1))
        },
        'a',
        {},
      )
      console.log(z)
    }))
  it('typing', () =>
    new Promise((done) => {
      const results: string[] = []
      const z = subscription(
        {
          next(outcome: string, awaitNext: (producerInput: number) => void) {
            console.log(this)
            debugger
            results.push(outcome)
            if (outcome === 'd') this.done(outcome)
            else awaitNext(outcome.charCodeAt(0))
          },
          done(value: string) {
            expect(results.toString()).toEqual('b,c,d')
            expect(value).toEqual('d')
            done(undefined)
          },
        },
        (input, outcome) => outcome.next(String.fromCharCode(input + 1)),
        97,
        {},
      )
      console.log(z)
    }))
  it('subscriptionAsyncFn', () =>
    new Promise((done) => {
      // const results: string[] = []
      const asyncFn = subscriptionAsyncFn((input: string, outcome) => {
        if (input === 'f') outcome.done(input)
        else outcome.next(String.fromCharCode(input.charCodeAt(input.length - 1) + 1))
      })
      asyncFn('a', (result) => {
        expect(result).toEqual('f')
        done(undefined)
      })
    }))
})
