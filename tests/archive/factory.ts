import { consumers } from 'stream'
import { describe, it, expect } from 'vitest'
// import subscription from '../src/factory'

describe('factory', () => {
  // it('subscription', () =>
  //   new Promise((done) => {
  //     const z = subscription({
  //       sharedInterface: (startInput: string) => [
  //         startInput,
  //         { results: [] as string[], cancelled: false },
  //       ],
  //       producerInterface: (sharedIface) => ({ results: sharedIface.results }),
  //       consumerInterface: (sharedIface) => ({
  //         results: sharedIface.results,
  //         done(value: string) {
  //           expect(this.results.toString()).toEqual('b,c,d')
  //           expect(value).toEqual('d')
  //           done(undefined)
  //         },
  //         cancel(reason: string) {
  //           console.log(reason)
  //           sharedIface.cancelled = true
  //         },
  //         get cancelled() {
  //           return sharedIface.cancelled
  //         },
  //       }),
  //       next: (outcome: string, awaitNext: (producerInput: string) => boolean, producer) => {
  //         // debugger
  //         producer.results.push(outcome)
  //         awaitNext(outcome)
  //       },
  //       transformer: (input, next, consumer) => {
  //         debugger
  //         const out = String.fromCharCode(input.charCodeAt(input.length - 1) + 1)
  //         if (consumer.cancelled) consumer.done(input)
  //         else if (input === 'c') {
  //           consumer.cancel('cancelled')
  //           next(out)
  //         } else next(out)
  //         return true
  //       },
  //     })('a')
  //     debugger
  //     console.log(z)
  //   }))

  it('subscription pattern - producer async active, consumer async active', () =>
    new Promise((done) => {
      const z = (startInput, finalResult: (result) => void) => {
        const sharedInterface = { results: [] as string[], cancelled: false }
        const producerInterface = { results: sharedInterface.results }
        const consumerInterface = {
          results: sharedInterface.results,
          done(value: string) {
            expect(this.results.toString()).toEqual('b,c,d')
            expect(value).toEqual('d')
            finalResult(value)
            done(undefined)
          },
          cancel(reason: string) {
            console.log(reason)
            sharedInterface.cancelled = true
          },
          get cancelled() {
            return sharedInterface.cancelled
          },
        }
        let transformer: (input) => any

        const next = (outcome: string) => {
          // debugger
          producerInterface.results.push(outcome)
          transformer(outcome)
        }
        transformer = (input) => {
          debugger
          const out = String.fromCharCode(input.charCodeAt(input.length - 1) + 1)
          if (consumerInterface.cancelled) consumerInterface.done(input)
          else if (input === 'c') {
            consumerInterface.cancel('cancelled')
            next(out)
          } else next(out)
          return true
        }
        transformer(startInput)
      }
      z('a', (result) => console.log(result))
      debugger
      console.log(z)
    }))

  it('map - producer sync active, consumer sync active', () =>
    new Promise((done) => {
      const mapImplementation = <I, O>(
        startArray: I[],
        finalResult: (mappedArray: O[]) => O[],
        transformerFn: (value: I, index: number, array: I[]) => O,
      ): O[] | unknown => {
        const resultArray = [] as O[]
        const nTimes = startArray.length
        // next
        for (let step = 0; step < nTimes; step += 1)
          resultArray.push(transformerFn(startArray[step] as I, step, startArray))

        return finalResult(resultArray)
      }
      mapImplementation(
        [1, 2, 3],
        (result) => {
          console.log(result)
          done(undefined)
          return result
        },
        (i) => i + 1,
      )
    }))

  it('observable - producer sync/async active, consumer reactive', () =>
    new Promise((done) => {
      const observable = (
        transformer: (consumer: { next: (result: number) => void; complete: () => void }) => void,
        consumer: { next: (result: number) => void; complete: () => void },
      ) => {
        transformer(consumer)
      }
      observable(
        (consumer) => {
          consumer.next(1)
          consumer.next(2)
          consumer.next(3)
          setTimeout(() => {
            consumer.next(4)
            consumer.complete()
          }, 1000)
        },
        {
          next(x) {
            console.log(`got value ${x}`)
          },
          complete() {
            debugger
            console.log('done')
            done(undefined)
          },
        },
      )
    }))
  it('generator - producer reactive, consumer sync/async active', () => {
    const generator = () => {
      let index = 0
      const transformer = () => {
        if (index >= 3) return { done: true }
        index += 1
        return { value: index, done: false }
      }
      return { next: transformer }
    }
    const gen = generator()
    console.log(gen.next()) // { value: 0, done: false }
    console.log(gen.next()) // { value: 1, done: false }
    console.log(gen.next()) // { value: 2, done: false }
    console.log(gen.next()) // { done: true }
    console.log(gen.next()) // { done: true }
  })
  it('EventEmitter - producer reactive, consumer sync/async active', () => {
    const eventEmitter = () => {
      const consumers: { [eventType: string]: (() => void)[] } = {}
      const consumer = (event: string) => {
        if (consumers[event] !== undefined) consumers[event].forEach((callback) => callback())
      }
      return {
        on(event: string, callback: () => void) {
          if (consumers[event] === undefined) consumers[event] = []
          consumers[event].push(callback)
        },
        emit: consumer,
      }
    }
    const eMitter = eventEmitter()
    // producer code
    eMitter.on('hello', () => console.log(`world1`))
    eMitter.on('hello', () => console.log(`world2`))
    eMitter.emit('hello')
  })
})
