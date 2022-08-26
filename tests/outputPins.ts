/* eslint-disable @typescript-eslint/prefer-as-const */
import { vi, describe, it, expect, Mock } from 'vitest'

// import outputPins, {
//   resultErrorOutputPins,
//   resultNoneOutputPins,
//   resultOutputPins,
// } from '../src/outputPins'

// describe('outputPins', () => {
//   it('basic', () => {
//     // debugger
//     const pins1 = resultErrorOutputPins<string, number, (sArg: string) => boolean>()
//     // debugger
//     expect(pins1.pinReturned).toEqual(undefined)
//     const x1 = pins1('a')
//     expect(pins1.pinReturned).toEqual('result')
//     expect(pins1.getResult()).toEqual('a')
//     expect(pins1.value).toEqual('a')
//     expect(() => {
//       pins1.error(1)
//     }).toThrowError(`only one outputPin can be set and the 'result' pin already contains 'a'`)
//     // debugger
//     const pins2 = resultErrorOutputPins<string, string>()
//     // debugger
//     pins2.error('THROWN')
//     expect(pins2.pinReturned).toEqual('error')
//     expect(pins2.getError()).toEqual('THROWN')

//     expect(() => {
//       pins2.result('A')
//     }).toThrowError(`only one outputPin can be set and the 'error' pin already contains 'THROWN'`)

//     const pins3 = resultErrorOutputPins<string, string>()
//     expect(() => {
//       console.log(pins3.getResult())
//     }).toThrowError(`pin 'result' not set`)
//     expect(() => {
//       console.log(pins3.getError())
//     }).toThrowError(`pin 'error' not set`)
//   })
//   it('undefined test', () => {
//     // debugger
//     const pins1 = resultNoneOutputPins<string, null>()
//     // debugger
//     pins1.none(null)
//     expect(pins1.pinReturned).toEqual('none')
//     expect(pins1.getNone()).toEqual(null)
//     expect(pins1.value).toEqual(null)
//     const pins2 = resultNoneOutputPins<string, undefined>()
//     // debugger
//     pins2.none(undefined)
//     expect(pins2.pinReturned).toEqual('none')
//     expect(pins2.getNone()).toEqual(undefined)
//   })
//   it('fn chaining', () => {
//     debugger
//     const pins1 = resultOutputPins<string, (sArg: string) => boolean>()
//     const fn = vi.fn((result) => {
//       debugger
//       console.log(result)
//       expect(result).toEqual('a')
//       return true
//     })
//     const x = pins1('a')(fn)

//     expect(fn).toHaveBeenCalled()
//     expect(x).toEqual(true)
//   })
//   it.only('fn chaining2', () => {
//     debugger
//     const chain = resultOutputPins()
//       .then((a, cb) => cb(`A:${a}`))
//       .then((a, cb) => setTimeout(() => cb(`B:${a}`), 100))
//       .then((a, cb) => cb(`C:${a}`))
//       // .onError(fnD)
//       .input('a')
//     debugger
//     console.log(chain)

//     // fnA.onResult((result) => {
//     //   debugger
//     //   console.log(result)
//     // })
//     // fnA('B')
//   })
// })

import chain, { AwaitedChainNode, ErrorCb } from '../src/scratch'
import type { Pins, ChainNode } from '../src/scratch'
import type { StrictEqual } from '../src/typescript utils'
import { times } from '../src/smallUtils'

const doNotCall = () => expect(true).toBe(false)
const checkType = <T>(arg: T) => arg
const typesMatch = <A, B>(match: StrictEqual<A, B>) => match

const autoResolvers = () => {
  const resolvers: Mock<[x: unknown, resolve: unknown], void>[] = []
  const resultResolver = <I, O>(expectedInput: I, output: O) => {
    const resolver = vi.fn((x, resolve) => {
      if (expectedInput !== undefined) expect(x).toEqual(expectedInput)
      resolve(output) as (i: I, res: (out: O) => void) => void
    })
    resolvers.push(resolver)
    return resolver
  }
  const errorResolver = <I, O>(expectedInput: I, output: O) => {
    const resolver = vi.fn((x, resolve) => {
      expect(x).toEqual(expectedInput)
      resolve.error(output) as (i: I, res: (out: O) => void) => void
    })
    resolvers.push(resolver)
    return resolver
  }
  const matches = <T>(expectedResult: T, done?: (value: unknown) => void) => {
    const matcher = vi.fn((x: T) => {
      expect(x).toEqual(expectedResult)
      if (done) {
        resolvers.forEach((resolver) => expect(resolver).toBeCalled())
        done(undefined)
      }
    })
    resolvers.push(matcher as unknown as Mock<[x: unknown, resolve: unknown]>)
    return matcher
  }
  const createChainSegment = <T extends unknown[]>(chainValues: T, chainy: any) =>
    chainValues.reduce<ChainNode<any, any, any, any, any, any, any>>(
      (previousValue, currentValue, index) => {
        // debugger
        if (index === 0) return previousValue
        const res = resultResolver(chainValues[index - 1], currentValue)
        return previousValue(res)
      },
      chainy,
    )
  const createChainSegment2 = <Chain extends ChainNode<any, any, any, any, any, any>>(
    numberOfLinks: number,
    chainy: any,
  ) => {
    let res: any = chainy
    times(numberOfLinks, () => {
      const resolver = vi.fn((x, resolve) => resolve(x + 1))
      resolvers.push(resolver)
      res = res(resolver)
    })
    return res
  }
  return { resultResolver, errorResolver, matches, createChainSegment, createChainSegment2 }
}

describe('chain', () => {
  it.skip('type check', () => {
    const chn1 = chain<'stringD', 'voidD'>()
    const chn1a = chn1((x, resolve) => {
      typesMatch<'stringD', typeof x>(true)
      typesMatch<Pins<'stringD', 'voidD'>, typeof resolve>(true)
      const t = resolve('stringD')
      typesMatch<void, typeof t>(true)
      return 'chn1a' as 'chn1a'
    })
    const chn1b = chn1a<'numberA'>((x, resolve) => {
      typesMatch<'stringD', typeof x>(true)
      typesMatch<Pins<'numberA', 'voidD'>, typeof resolve>(true)
      const t = resolve(1)
      typesMatch<void, typeof t>(true)
      return 'chn1b' as 'chn1b'
    })
    const chn1c = chn1b<'booleanB', 'voidB', 'chn1d'>((x, resolve) => {
      typesMatch<'numberA', typeof x>(true)
      typesMatch<Pins<'booleanB', 'voidD' | 'voidB', 'chn1d', void>, typeof resolve>(true)
      const t = resolve('booleanB')
      typesMatch<'chn1d', typeof t>(true)
      return 'chn1c' as 'chn1c'
    })
    const chn1d = chn1c<'booleanC', 'voidC', 'ch1Await'>((x, resolve) => {
      typesMatch<'booleanB', typeof x>(true)
      typesMatch<Pins<'booleanC', 'voidD' | 'voidB' | 'voidC', 'ch1Await', void>, typeof resolve>(
        true,
      )
      const t = resolve('booleanC')
      typesMatch<'ch1Await', typeof t>(true)
      return 'chn1d' as 'chn1d'
    })
    const chn1e = chn1d.onError((x) => {
      typesMatch<'voidD' | 'voidB' | 'voidC', typeof x>(true)
    })
    const ch1Await = chn1e.await(
      'stringD',
      (result) => {
        typesMatch<'booleanC', typeof result>(true)
        return 'ch1Await'
      },
      (error) => {
        typesMatch<'voidD' | 'voidB' | 'voidC', typeof error>(true)
      },
    )
    typesMatch<AwaitedChainNode<void | 'chn1d' | 'ch1Await'>, typeof ch1Await>(true)
  })
  it('basic', () =>
    new Promise((done) => {
      const chainy = chain<string>()
      const a = chainy<string>((x, resolve) => {
        checkType<string>(x)
        checkType<Pins<string>>(resolve)
        resolve('done')
      })
      // checkType<
      //   (arg: string, resultCb: (result: string) => void, errorCb: (error: unknown) => void) => void
      // >(a.await)
      a.await(
        'start',
        (result) => {
          checkType<string>(result)
          expect(result).toEqual('done')
          done(undefined)
        },
        doNotCall,
      )
    }))

  it('basic2', () =>
    new Promise((done) => {
      const chainy = chain<string>()

      const a = chainy<number>((x, resolve) => {
        expect(x).toEqual('start')
        checkType<string>(x)
        checkType<Pins<number, unknown>>(resolve)
        resolve(1)
      })

      const b = a<boolean>((x, resolve) => {
        expect(x).toEqual(1)
        checkType<number>(x)
        checkType<Pins<boolean, unknown>>(resolve)
        resolve(true)
      })

      checkType<
        (
          arg: string,
          resultCb: (result: boolean) => void,
          errorCb: (error: unknown) => void,
        ) => void
      >(b.await)
      b.await(
        'start',
        (result) => {
          checkType<boolean>(result)
          expect(result).toEqual(true)
          done(undefined)
        },
        doNotCall,
      )
    }))
  it('basic3', () =>
    new Promise((done) => {
      const chainy = chain<string>()

      const a = chainy<number>((x, resolve) => {
        expect(x).toEqual('start')
        checkType<string>(x)
        checkType<Pins<number, unknown>>(resolve)
        resolve.result(1)
      })

      const b = a<boolean>((x, resolve) => {
        expect(x).toEqual(1)
        checkType<number>(x)
        checkType<Pins<boolean, unknown>>(resolve)
        resolve.result(true)
      })

      checkType<
        (
          arg: string,
          resultCb: (result: boolean) => void,
          errorCb: (error: unknown) => void,
        ) => void
      >(b.await)
      b.await(
        'start',
        (result) => {
          checkType<boolean>(result)
          expect(result).toEqual(true)
          done(undefined)
        },
        doNotCall,
      )
    }))
  it('basic4', () =>
    new Promise((done) => {
      const chainy = chain<string, string>()

      const a = chainy<number>((x, resolve) => {
        expect(x).toEqual('start')
        typesMatch<Pins<number, string>, typeof resolve>(true)
        resolve.result(1)
      })

      const b = a<boolean, boolean>((x, resolve) => {
        expect(x).toEqual(1)
        typesMatch<Pins<boolean, string | boolean>, typeof resolve>(true)
        resolve.error(true)
      })
      typesMatch<
        (
          arg: string,
          resultCb: (result: boolean) => void,
          errorCb: ErrorCb<string | boolean, boolean>,
        ) => AwaitedChainNode<void>,
        typeof b.await
      >(true)

      b.await('start', doNotCall, (error) => {
        typesMatch<string | boolean, typeof error>(true)
        expect(error).toEqual(true)
        done(undefined)
      })
    }))
  it('basic5', () =>
    new Promise((done) => {
      const chainy = chain<string, string, string>()

      const { errorResolver, matches, createChainSegment } = autoResolvers()

      // debugger

      const b = createChainSegment(['start', 'a', 'b'], chainy)

      const c = b(
        errorResolver('b', 'c'),
        /* (input, resolver) => {
          debugger
          console.log(input)
          resolver.error(input)
        }, */
      )

      const c1 = c.onError(
        matches('c', done) /* (err) => {
          debugger
          console.log(err)
          done(undefined)
        }, */,
      )

      const d = c1(doNotCall)

      // debugger

      d.await('start', doNotCall, doNotCall)
    }))
  it('basic6', () =>
    new Promise((done) => {
      const { errorResolver, matches, createChainSegment } = autoResolvers()
      const chainy = chain<string, string, string>()

      const seg = createChainSegment(['start', 'a', 'b', 'c'], chainy)
      const c1 = seg.onError(doNotCall)

      const d = c1(errorResolver('c', 'd'))

      d.await('start', doNotCall, matches('d', done))
    }))

  it('executes multiple times', () =>
    new Promise((done) => {
      const { createChainSegment2 } = autoResolvers()
      const chainy = chain<number, number, number>()

      const seg = createChainSegment2(3, chainy)

      seg.await(
        1,
        (x) => {
          expect(x).toEqual(4)
          seg.await(
            2,
            (y) => {
              expect(y).toEqual(5)
              done(undefined)
            },
            doNotCall,
          )
        },
        doNotCall,
      )
    }))

  it('s', () =>
    new Promise((done) => {
      const { matches } = autoResolvers()
      const chainy = chain()
      const a = chainy<string>((x, resolve) => resolve(`a:${x}`)).s<string>((x) => `b:${x}`)(
        (x, resolve) => resolve(`c:${x}`),
      )
      a.await('1', matches('c:b:a:1'), doNotCall)
      a.await('2', matches('c:b:a:2', done), doNotCall)
    }))

  it('splits onError throws', () =>
    new Promise((done) => {
      const { matches } = autoResolvers()
      const chainy = chain()
      const a = chainy<string, string>((x, resolve) => resolve.error(`a:${x}`))
      const x = a.onError(matches('a:1'))
      const y = a.onError((result) => {
        debugger
        expect(result).toEqual('a:2')
        done(undefined)
      })

      x.await('1', doNotCall, doNotCall)
      y.await('2', doNotCall, doNotCall)
    }))
  it('duplicate onError throws', () =>
    new Promise((done) => {
      const { resultResolver, matches } = autoResolvers()
      const chainy = chain()
      const a = chainy<string>(resultResolver('a', 'b'))
      const b1 = a(resultResolver('b', 'b1'))
      const b2 = a(resultResolver('b', 'b2'))

      b1.await('a', matches('b1'), doNotCall)
      b2.await('a', matches('b2'), doNotCall)

      const c = b2(resultResolver('b2', 'c'))
      c.await('a', matches('c', done), doNotCall)
    }))
  it('sequential onError', () =>
    new Promise((done) => {
      const chainy = chain<string, never>()
      const a = chainy<string, string>((x, resolve) => resolve.error(`a:${x}`))
      const b = a.onError((result, resolver) => {
        expect(result).toEqual('a:1')
        resolver('b')
      })
      const c = b<string>((x, resolve) => resolve(`c:${x}`))((x, resolve) =>
        resolve.error(`c2:${x}`),
      )
      const d = c.onError((result, resolver) => {
        expect(result).toEqual('c2:c:b')
        resolver('b')
      })

      d.await(
        '1',
        (result) => {
          expect(result).toEqual('b')
          done(undefined)
        },
        doNotCall,
      )
    }))
  it('return types', () =>
    new Promise((done) => {
      const chainy = chain<string, never, never, 'a'>()
      const a = chainy<string, string, 'b'>((x, resolve) => {
        debugger
        const t = resolve(`a:${x}`) // 'b'
        typesMatch<'b', typeof t>(true)
        debugger
        console.log(t)
        return 'a'
      })
      const b = a<string, string, 'done'>((x, resolve) => {
        debugger
        const t = resolve(`b:${x}`) // 'done'
        typesMatch<'done', typeof t>(true)
        debugger
        console.log(t)
        return 'b'
      })

      const c = b.await(
        '1',
        (result) => {
          debugger
          // expect(result).toEqual('b')
          // done(undefined)
          return 'done'
        },
        doNotCall,
      )
      debugger
      typesMatch<AwaitedChainNode<'a' | 'b' | 'done'>, typeof c>(true)
      console.log(c) // 'a'
      done(undefined)
    }))
})

// const chain = asyncMapChain(getFile, splitFile, searchOnline, consolidateResults, formatResults)

// stream -> new stream -y-> new Conversation      -> process stream
//                      -n-> existing Conversation -> process stream
