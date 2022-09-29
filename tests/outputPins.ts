/* eslint-disable @typescript-eslint/ban-types */
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

import chain, { AwaitedChainNodeController, ErrorCb } from '../src/scratch.js'
import type { PinsA, ChainNode } from '../src/scratch.js'
import { times } from '../src/smallUtils.js'

type StrictEqual<A1, A2> = [A1] extends [A2] ? ([A2] extends [A1] ? true : false) : false

const doNotCall = () => expect(true).toBe(false) as unknown as never
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
    chainValues.reduce<ChainNode<any, any, any, any>>((previousValue, currentValue, index) => {
      // debugger
      if (index === 0) return previousValue
      const res = resultResolver(chainValues[index - 1], currentValue)
      return previousValue(res)
    }, chainy)
  const createChainSegment2 = (numberOfLinks: number, chainy: any) => {
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
  it.skip('type check - long chain', () => {
    const chainN0 = chain<
      { Input: 'RI'; ResultResolverController: 'ResResolverN0' },
      {
        Output: 'OutputN1'
        Error: 'ErrorN1'
        ResultResolverController: 'ResResolverN1'
        ErrorResolverController: 'ErrResolverN1'
      }
    >((x, resolve) => {
      typesMatch<'RI', typeof x>(true)
      typesMatch<PinsA<'ErrorN1', 'OutputN1', 'ResResolverN1', 'ErrResolverN1'>, typeof resolve>(
        true,
      )
      const t = resolve('OutputN1')
      typesMatch<'ResResolverN1', typeof t>(true)
      return 'chn1a' as 'ResResolverN0'
    })
    const chainN2 = chainN0<{
      Output: 'OutputN2'
      Error: 'ErrorN2'
      ResultResolverController: 'ResResolverN2'
      ErrorResolverController: 'ErrResolverN2'
    }>((x, resolve) => {
      typesMatch<'OutputN1', typeof x>(true)
      typesMatch<
        PinsA<'ErrorN2', 'OutputN2', 'ResResolverN2', 'ErrResolverN1' | 'ErrResolverN2'>,
        typeof resolve
      >(true)
      const t = resolve('OutputN2')
      typesMatch<'ResResolverN2', typeof t>(true)
      return 'chn1a' as 'ResResolverN1'
    })
    const chainN3 = chainN2<{
      Output: 'OutputN3'
      Error: 'ErrorN3'
      ResultResolverController: 'ResResolverN3'
      ErrorResolverController: 'ErrResolverN3'
    }>((x, resolve) => {
      typesMatch<'OutputN2', typeof x>(true)
      typesMatch<
        PinsA<
          'ErrorN3',
          'OutputN3',
          'ResResolverN3',
          'ErrResolverN1' | 'ErrResolverN2' | 'ErrResolverN3'
        >,
        typeof resolve
      >(true)
      const t = resolve('OutputN3')
      typesMatch<'ResResolverN3', typeof t>(true)
      return 'chn1a' as 'ResResolverN2'
    })
    const chainN4 = chainN3<{
      Output: 'OutputN4'
      Error: 'ErrorN4'
      ResultResolverController: 'ResResolverN4'
      ErrorResolverController: 'ErrResolverN4'
    }>((x, resolve) => {
      typesMatch<'OutputN3', typeof x>(true)
      typesMatch<
        PinsA<
          'ErrorN4',
          'OutputN4',
          'ResResolverN4',
          'ErrResolverN1' | 'ErrResolverN2' | 'ErrResolverN3' | 'ErrResolverN4'
        >,
        typeof resolve
      >(true)
      const t = resolve('OutputN4')
      typesMatch<'ResResolverN4', typeof t>(true)
      return 'chn1a' as 'ResResolverN3'
    })
    const chainN5 = chainN4<{
      Output: 'OutputN5'
      Error: 'ErrorN5'
      ResultResolverController: 'ResResolverN5'
      ErrorResolverController: 'ErrResolverN5'
    }>((x, resolve) => {
      typesMatch<'OutputN4', typeof x>(true)
      typesMatch<
        PinsA<
          'ErrorN5',
          'OutputN5',
          'ResResolverN5',
          'ErrResolverN1' | 'ErrResolverN2' | 'ErrResolverN3' | 'ErrResolverN4' | 'ErrResolverN5'
        >,
        typeof resolve
      >(true)
      const t = resolve('OutputN5')
      typesMatch<'ResResolverN5', typeof t>(true)
      return 'chn1a' as 'ResResolverN4'
    })
    const chainN6 = chainN5<{
      Output: 'OutputN6'
      Error: 'ErrorN6'
      ResultResolverController: 'ResResolverN6'
      ErrorResolverController: 'ErrResolverN6'
    }>((x, resolve) => {
      typesMatch<'OutputN5', typeof x>(true)
      typesMatch<
        PinsA<
          'ErrorN6',
          'OutputN6',
          'ResResolverN6',
          | 'ErrResolverN1'
          | 'ErrResolverN2'
          | 'ErrResolverN3'
          | 'ErrResolverN4'
          | 'ErrResolverN5'
          | 'ErrResolverN6'
        >,
        typeof resolve
      >(true)
      const t = resolve('OutputN6')
      typesMatch<'ResResolverN6', typeof t>(true)
      return 'chn1a' as 'ResResolverN5'
    })
    const chainN7 = chainN6<{
      Output: 'OutputN7'
      Error: 'ErrorN7'
      ResultResolverController: 'ResResolverN7'
      ErrorResolverController: 'ErrResolverN7'
    }>((x, resolve) => {
      typesMatch<'OutputN6', typeof x>(true)
      typesMatch<
        PinsA<
          'ErrorN7',
          'OutputN7',
          'ResResolverN7',
          | 'ErrResolverN1'
          | 'ErrResolverN2'
          | 'ErrResolverN3'
          | 'ErrResolverN4'
          | 'ErrResolverN5'
          | 'ErrResolverN6'
          | 'ErrResolverN7'
        >,
        typeof resolve
      >(true)
      const t = resolve('OutputN7')
      typesMatch<'ResResolverN7', typeof t>(true)
      return 'chn1a' as 'ResResolverN6'
    })
    const chainN8 = chainN7<{
      Output: 'OutputN8'
      Error: 'ErrorN8'
      ResultResolverController: 'ResResolverN8'
      ErrorResolverController: 'ErrResolverN8'
    }>((x, resolve) => {
      typesMatch<'OutputN7', typeof x>(true)
      typesMatch<
        PinsA<
          'ErrorN8',
          'OutputN8',
          'ResResolverN8',
          | 'ErrResolverN1'
          | 'ErrResolverN2'
          | 'ErrResolverN3'
          | 'ErrResolverN4'
          | 'ErrResolverN5'
          | 'ErrResolverN6'
          | 'ErrResolverN7'
          | 'ErrResolverN8'
        >,
        typeof resolve
      >(true)
      const t = resolve('OutputN8')
      typesMatch<'ResResolverN8', typeof t>(true)
      return 'chn1a' as 'ResResolverN7'
    })
    const chainN9 = chainN8<{
      Output: 'OutputN9'
      Error: 'ErrorN9'
      ResultResolverController: 'ResResolverN9'
      ErrorResolverController: 'ErrResolverN9'
    }>((x, resolve) => {
      typesMatch<'OutputN8', typeof x>(true)
      typesMatch<
        PinsA<
          'ErrorN9',
          'OutputN9',
          'ResResolverN9',
          | 'ErrResolverN1'
          | 'ErrResolverN2'
          | 'ErrResolverN3'
          | 'ErrResolverN4'
          | 'ErrResolverN5'
          | 'ErrResolverN6'
          | 'ErrResolverN7'
          | 'ErrResolverN8'
          | 'ErrResolverN9'
        >,
        typeof resolve
      >(true)
      const t = resolve('OutputN9')
      typesMatch<'ResResolverN9', typeof t>(true)
      return 'chn1a' as 'ResResolverN8'
    })
    const chainN10 = chainN9<{
      Output: 'OutputN10'
      Error: 'ErrorN10'
      ResultResolverController: 'ResResolverN10'
      ErrorResolverController: 'ErrResolverN10'
    }>((x, resolve) => {
      typesMatch<'OutputN9', typeof x>(true)
      typesMatch<
        PinsA<
          'ErrorN10',
          'OutputN10',
          'ResResolverN10',
          | 'ErrResolverN1'
          | 'ErrResolverN2'
          | 'ErrResolverN3'
          | 'ErrResolverN4'
          | 'ErrResolverN5'
          | 'ErrResolverN6'
          | 'ErrResolverN7'
          | 'ErrResolverN8'
          | 'ErrResolverN9'
          | 'ErrResolverN10'
        >,
        typeof resolve
      >(true)
      const t = resolve('OutputN10')
      typesMatch<'ResResolverN10', typeof t>(true)
      return 'chn1a' as 'ResResolverN9'
    })
    const chainN11 = chainN10<{
      Output: 'OutputN11'
      Error: 'ErrorN11'
      ResultResolverController: 'ResResolverN11'
      ErrorResolverController: 'ErrResolverN11'
    }>((x, resolve) => {
      typesMatch<'OutputN10', typeof x>(true)
      typesMatch<
        PinsA<
          'ErrorN11',
          'OutputN11',
          'ResResolverN11',
          | 'ErrResolverN1'
          | 'ErrResolverN2'
          | 'ErrResolverN3'
          | 'ErrResolverN4'
          | 'ErrResolverN5'
          | 'ErrResolverN6'
          | 'ErrResolverN7'
          | 'ErrResolverN8'
          | 'ErrResolverN9'
          | 'ErrResolverN10'
          | 'ErrResolverN11'
        >,
        typeof resolve
      >(true)
      const t = resolve('OutputN11')
      typesMatch<'ResResolverN11', typeof t>(true)
      return 'chn1a' as 'ResResolverN10'
    })
    const chainN12 = chainN11<{
      Output: 'OutputN12'
      Error: 'ErrorN12'
      ResultResolverController: 'ResResolverN12'
      ErrorResolverController: 'ErrResolverN12'
    }>((x, resolve) => {
      typesMatch<'OutputN11', typeof x>(true)
      typesMatch<
        PinsA<
          'ErrorN12',
          'OutputN12',
          'ResResolverN12',
          | 'ErrResolverN1'
          | 'ErrResolverN2'
          | 'ErrResolverN3'
          | 'ErrResolverN4'
          | 'ErrResolverN5'
          | 'ErrResolverN6'
          | 'ErrResolverN7'
          | 'ErrResolverN8'
          | 'ErrResolverN9'
          | 'ErrResolverN10'
          | 'ErrResolverN11'
          | 'ErrResolverN12'
        >,
        typeof resolve
      >(true)
      const t = resolve('OutputN12')
      typesMatch<'ResResolverN12', typeof t>(true)
      return 'chn1a' as 'ResResolverN11'
    })
    const chainN13 = chainN12<{
      Output: 'OutputN13'
      Error: 'ErrorN13'
      ResultResolverController: 'ResResolverN13'
      ErrorResolverController: 'ErrResolverN13'
    }>((x, resolve) => {
      typesMatch<'OutputN12', typeof x>(true)
      typesMatch<
        PinsA<
          'ErrorN13',
          'OutputN13',
          'ResResolverN13',
          | 'ErrResolverN1'
          | 'ErrResolverN2'
          | 'ErrResolverN3'
          | 'ErrResolverN4'
          | 'ErrResolverN5'
          | 'ErrResolverN6'
          | 'ErrResolverN7'
          | 'ErrResolverN8'
          | 'ErrResolverN9'
          | 'ErrResolverN10'
          | 'ErrResolverN11'
          | 'ErrResolverN12'
          | 'ErrResolverN13'
        >,
        typeof resolve
      >(true)
      const t = resolve('OutputN13')
      typesMatch<'ResResolverN13', typeof t>(true)
      return 'chn1a' as 'ResResolverN12'
    })
    const chainN14 = chainN13<{
      Output: 'OutputN14'
      Error: 'ErrorN14'
      ResultResolverController: 'ResResolverN14'
      ErrorResolverController: 'ErrResolverN14'
    }>((x, resolve) => {
      typesMatch<'OutputN13', typeof x>(true)
      typesMatch<
        PinsA<
          'ErrorN14',
          'OutputN14',
          'ResResolverN14',
          | 'ErrResolverN1'
          | 'ErrResolverN2'
          | 'ErrResolverN3'
          | 'ErrResolverN4'
          | 'ErrResolverN5'
          | 'ErrResolverN6'
          | 'ErrResolverN7'
          | 'ErrResolverN8'
          | 'ErrResolverN9'
          | 'ErrResolverN10'
          | 'ErrResolverN11'
          | 'ErrResolverN12'
          | 'ErrResolverN13'
          | 'ErrResolverN14'
        >,
        typeof resolve
      >(true)
      const t = resolve('OutputN14')
      typesMatch<'ResResolverN14', typeof t>(true)
      return 'chn1a' as 'ResResolverN13'
    })
    const chainN15 = chainN14<{
      Output: 'OutputN15'
      Error: 'ErrorN15'
      ResultResolverController: 'ResResolverN15'
      ErrorResolverController: 'ErrResolverN15'
    }>((x, resolve) => {
      typesMatch<'OutputN14', typeof x>(true)
      typesMatch<
        PinsA<
          'ErrorN15',
          'OutputN15',
          'ResResolverN15',
          | 'ErrResolverN1'
          | 'ErrResolverN2'
          | 'ErrResolverN3'
          | 'ErrResolverN4'
          | 'ErrResolverN5'
          | 'ErrResolverN6'
          | 'ErrResolverN7'
          | 'ErrResolverN8'
          | 'ErrResolverN9'
          | 'ErrResolverN10'
          | 'ErrResolverN11'
          | 'ErrResolverN12'
          | 'ErrResolverN13'
          | 'ErrResolverN14'
          | 'ErrResolverN15'
        >,
        typeof resolve
      >(true)
      const t = resolve('OutputN15')
      typesMatch<'ResResolverN15', typeof t>(true)
      return 'chn1a' as 'ResResolverN14'
    })
    const chainN16 = chainN15<{
      Output: 'OutputN16'
      Error: 'ErrorN16'
      ResultResolverController: 'ResResolverN16'
      ErrorResolverController: 'ErrResolverN16'
    }>((x, resolve) => {
      typesMatch<'OutputN15', typeof x>(true)
      typesMatch<
        PinsA<
          'ErrorN16',
          'OutputN16',
          'ResResolverN16',
          | 'ErrResolverN1'
          | 'ErrResolverN2'
          | 'ErrResolverN3'
          | 'ErrResolverN4'
          | 'ErrResolverN5'
          | 'ErrResolverN6'
          | 'ErrResolverN7'
          | 'ErrResolverN8'
          | 'ErrResolverN9'
          | 'ErrResolverN10'
          | 'ErrResolverN11'
          | 'ErrResolverN12'
          | 'ErrResolverN13'
          | 'ErrResolverN14'
          | 'ErrResolverN15'
          | 'ErrResolverN16'
        >,
        typeof resolve
      >(true)
      const t = resolve('OutputN16')
      typesMatch<'ResResolverN16', typeof t>(true)
      return 'chn1a' as 'ResResolverN15'
    })
    const chainN17 = chainN16<{
      Output: 'OutputN17'
      Error: 'ErrorN17'
      ResultResolverController: 'ResResolverN17'
      ErrorResolverController: 'ErrResolverN17'
    }>((x, resolve) => {
      typesMatch<'OutputN16', typeof x>(true)
      typesMatch<
        PinsA<
          'ErrorN17',
          'OutputN17',
          'ResResolverN17',
          | 'ErrResolverN1'
          | 'ErrResolverN2'
          | 'ErrResolverN3'
          | 'ErrResolverN4'
          | 'ErrResolverN5'
          | 'ErrResolverN6'
          | 'ErrResolverN7'
          | 'ErrResolverN8'
          | 'ErrResolverN9'
          | 'ErrResolverN10'
          | 'ErrResolverN11'
          | 'ErrResolverN12'
          | 'ErrResolverN13'
          | 'ErrResolverN14'
          | 'ErrResolverN15'
          | 'ErrResolverN16'
          | 'ErrResolverN17'
        >,
        typeof resolve
      >(true)
      const t = resolve('OutputN17')
      typesMatch<'ResResolverN17', typeof t>(true)
      return 'chn1a' as 'ResResolverN16'
    })
    const chainN18 = chainN17<{
      Output: 'OutputN18'
      Error: 'ErrorN18'
      ResultResolverController: 'ResResolverN18'
      ErrorResolverController: 'ErrResolverN18'
    }>((x, resolve) => {
      typesMatch<'OutputN17', typeof x>(true)
      typesMatch<
        PinsA<
          'ErrorN18',
          'OutputN18',
          'ResResolverN18',
          | 'ErrResolverN1'
          | 'ErrResolverN2'
          | 'ErrResolverN3'
          | 'ErrResolverN4'
          | 'ErrResolverN5'
          | 'ErrResolverN6'
          | 'ErrResolverN7'
          | 'ErrResolverN8'
          | 'ErrResolverN9'
          | 'ErrResolverN10'
          | 'ErrResolverN11'
          | 'ErrResolverN12'
          | 'ErrResolverN13'
          | 'ErrResolverN14'
          | 'ErrResolverN15'
          | 'ErrResolverN16'
          | 'ErrResolverN17'
          | 'ErrResolverN18'
        >,
        typeof resolve
      >(true)
      const t = resolve('OutputN18')
      typesMatch<'ResResolverN18', typeof t>(true)
      return 'chn1a' as 'ResResolverN17'
    })
    const chainN19 = chainN18<{
      Output: 'OutputN19'
      Error: 'ErrorN19'
      ResultResolverController: 'ResResolverN19'
      ErrorResolverController: 'ErrResolverN19'
    }>((x, resolve) => {
      typesMatch<'OutputN18', typeof x>(true)
      typesMatch<
        PinsA<
          'ErrorN19',
          'OutputN19',
          'ResResolverN19',
          | 'ErrResolverN1'
          | 'ErrResolverN2'
          | 'ErrResolverN3'
          | 'ErrResolverN4'
          | 'ErrResolverN5'
          | 'ErrResolverN6'
          | 'ErrResolverN7'
          | 'ErrResolverN8'
          | 'ErrResolverN9'
          | 'ErrResolverN10'
          | 'ErrResolverN11'
          | 'ErrResolverN12'
          | 'ErrResolverN13'
          | 'ErrResolverN14'
          | 'ErrResolverN15'
          | 'ErrResolverN16'
          | 'ErrResolverN17'
          | 'ErrResolverN18'
          | 'ErrResolverN19'
        >,
        typeof resolve
      >(true)
      const t = resolve('OutputN19')
      typesMatch<'ResResolverN19', typeof t>(true)
      return 'chn1a' as 'ResResolverN18'
    })
    const chainN20 = chainN19<{
      Output: 'OutputN20'
      Error: 'ErrorN20'
      ResultResolverController: 'ResResolverN20'
      ErrorResolverController: 'ErrResolverN20'
    }>((x, resolve) => {
      typesMatch<'OutputN19', typeof x>(true)
      typesMatch<
        PinsA<
          'ErrorN20',
          'OutputN20',
          'ResResolverN20',
          | 'ErrResolverN1'
          | 'ErrResolverN2'
          | 'ErrResolverN3'
          | 'ErrResolverN4'
          | 'ErrResolverN5'
          | 'ErrResolverN6'
          | 'ErrResolverN7'
          | 'ErrResolverN8'
          | 'ErrResolverN9'
          | 'ErrResolverN10'
          | 'ErrResolverN11'
          | 'ErrResolverN12'
          | 'ErrResolverN13'
          | 'ErrResolverN14'
          | 'ErrResolverN15'
          | 'ErrResolverN16'
          | 'ErrResolverN17'
          | 'ErrResolverN18'
          | 'ErrResolverN19'
          | 'ErrResolverN20'
        >,
        typeof resolve
      >(true)
      const t = resolve('OutputN20')
      typesMatch<'ResResolverN20', typeof t>(true)
      return 'chn1a' as 'ResResolverN19'
    })
    const chainN21 = chainN20<{
      Output: 'OutputN21'
      Error: 'ErrorN21'
      ResultResolverController: 'ResResolverN21'
      ErrorResolverController: 'ErrResolverN21'
    }>((x, resolve) => {
      typesMatch<'OutputN20', typeof x>(true)
      typesMatch<
        PinsA<
          'ErrorN21',
          'OutputN21',
          'ResResolverN21',
          | 'ErrResolverN1'
          | 'ErrResolverN2'
          | 'ErrResolverN3'
          | 'ErrResolverN4'
          | 'ErrResolverN5'
          | 'ErrResolverN6'
          | 'ErrResolverN7'
          | 'ErrResolverN8'
          | 'ErrResolverN9'
          | 'ErrResolverN10'
          | 'ErrResolverN11'
          | 'ErrResolverN12'
          | 'ErrResolverN13'
          | 'ErrResolverN14'
          | 'ErrResolverN15'
          | 'ErrResolverN16'
          | 'ErrResolverN17'
          | 'ErrResolverN18'
          | 'ErrResolverN19'
          | 'ErrResolverN20'
          | 'ErrResolverN21'
        >,
        typeof resolve
      >(true)
      const t = resolve('OutputN21')
      typesMatch<'ResResolverN21', typeof t>(true)
      return 'chn1a' as 'ResResolverN20'
    })
    const chainN22 = chainN21<{
      Output: 'OutputN22'
      Error: 'ErrorN22'
      ResultResolverController: 'ResResolverN22'
      ErrorResolverController: 'ErrResolverN22'
    }>((x, resolve) => {
      typesMatch<'OutputN21', typeof x>(true)
      typesMatch<
        PinsA<
          'ErrorN22',
          'OutputN22',
          'ResResolverN22',
          | 'ErrResolverN1'
          | 'ErrResolverN2'
          | 'ErrResolverN3'
          | 'ErrResolverN4'
          | 'ErrResolverN5'
          | 'ErrResolverN6'
          | 'ErrResolverN7'
          | 'ErrResolverN8'
          | 'ErrResolverN9'
          | 'ErrResolverN10'
          | 'ErrResolverN11'
          | 'ErrResolverN12'
          | 'ErrResolverN13'
          | 'ErrResolverN14'
          | 'ErrResolverN15'
          | 'ErrResolverN16'
          | 'ErrResolverN17'
          | 'ErrResolverN18'
          | 'ErrResolverN19'
          | 'ErrResolverN20'
          | 'ErrResolverN21'
          | 'ErrResolverN22'
        >,
        typeof resolve
      >(true)
      const t = resolve('OutputN22')
      typesMatch<'ResResolverN22', typeof t>(true)
      return 'chn1a' as 'ResResolverN21'
    })
    const chainN23 = chainN22<{
      Output: 'OutputN23'
      Error: 'ErrorN23'
      ResultResolverController: 'ResResolverN23'
      ErrorResolverController: 'ErrResolverN23'
    }>((x, resolve) => {
      typesMatch<'OutputN22', typeof x>(true)
      typesMatch<
        PinsA<
          'ErrorN23',
          'OutputN23',
          'ResResolverN23',
          | 'ErrResolverN1'
          | 'ErrResolverN2'
          | 'ErrResolverN3'
          | 'ErrResolverN4'
          | 'ErrResolverN5'
          | 'ErrResolverN6'
          | 'ErrResolverN7'
          | 'ErrResolverN8'
          | 'ErrResolverN9'
          | 'ErrResolverN10'
          | 'ErrResolverN11'
          | 'ErrResolverN12'
          | 'ErrResolverN13'
          | 'ErrResolverN14'
          | 'ErrResolverN15'
          | 'ErrResolverN16'
          | 'ErrResolverN17'
          | 'ErrResolverN18'
          | 'ErrResolverN19'
          | 'ErrResolverN20'
          | 'ErrResolverN21'
          | 'ErrResolverN22'
          | 'ErrResolverN23'
        >,
        typeof resolve
      >(true)
      const t = resolve('OutputN23')
      typesMatch<'ResResolverN23', typeof t>(true)
      return 'chn1a' as 'ResResolverN22'
    })
    const chainN24 = chainN23<{
      Output: 'OutputN24'
      Error: 'ErrorN24'
      ResultResolverController: 'ResResolverN24'
      ErrorResolverController: 'ErrResolverN24'
    }>((x, resolve) => {
      typesMatch<'OutputN23', typeof x>(true)
      typesMatch<
        PinsA<
          'ErrorN24',
          'OutputN24',
          'ResResolverN24',
          | 'ErrResolverN1'
          | 'ErrResolverN2'
          | 'ErrResolverN3'
          | 'ErrResolverN4'
          | 'ErrResolverN5'
          | 'ErrResolverN6'
          | 'ErrResolverN7'
          | 'ErrResolverN8'
          | 'ErrResolverN9'
          | 'ErrResolverN10'
          | 'ErrResolverN11'
          | 'ErrResolverN12'
          | 'ErrResolverN13'
          | 'ErrResolverN14'
          | 'ErrResolverN15'
          | 'ErrResolverN16'
          | 'ErrResolverN17'
          | 'ErrResolverN18'
          | 'ErrResolverN19'
          | 'ErrResolverN20'
          | 'ErrResolverN21'
          | 'ErrResolverN22'
          | 'ErrResolverN23'
          | 'ErrResolverN24'
        >,
        typeof resolve
      >(true)
      const t = resolve('OutputN24')
      typesMatch<'ResResolverN24', typeof t>(true)
      return 'chn1a' as 'ResResolverN23'
    })
    const chainN25 = chainN24<{
      Output: 'OutputN25'
      Error: 'ErrorN25'
      ResultResolverController: 'ResResolverN25'
      ErrorResolverController: 'ErrResolverN25'
    }>((x, resolve) => {
      typesMatch<'OutputN24', typeof x>(true)
      typesMatch<
        PinsA<
          'ErrorN25',
          'OutputN25',
          'ResResolverN25',
          | 'ErrResolverN1'
          | 'ErrResolverN2'
          | 'ErrResolverN3'
          | 'ErrResolverN4'
          | 'ErrResolverN5'
          | 'ErrResolverN6'
          | 'ErrResolverN7'
          | 'ErrResolverN8'
          | 'ErrResolverN9'
          | 'ErrResolverN10'
          | 'ErrResolverN11'
          | 'ErrResolverN12'
          | 'ErrResolverN13'
          | 'ErrResolverN14'
          | 'ErrResolverN15'
          | 'ErrResolverN16'
          | 'ErrResolverN17'
          | 'ErrResolverN18'
          | 'ErrResolverN19'
          | 'ErrResolverN20'
          | 'ErrResolverN21'
          | 'ErrResolverN22'
          | 'ErrResolverN23'
          | 'ErrResolverN24'
          | 'ErrResolverN25'
        >,
        typeof resolve
      >(true)
      const t = resolve('OutputN25')
      typesMatch<'ResResolverN25', typeof t>(true)
      return 'chn1a' as 'ResResolverN24'
    })
    const chainN26 = chainN25<{
      Output: 'OutputN26'
      Error: 'ErrorN26'
      ResultResolverController: 'ResResolverN26'
      ErrorResolverController: 'ErrResolverN26'
    }>((x, resolve) => {
      typesMatch<'OutputN25', typeof x>(true)
      typesMatch<
        PinsA<
          'ErrorN26',
          'OutputN26',
          'ResResolverN26',
          | 'ErrResolverN1'
          | 'ErrResolverN2'
          | 'ErrResolverN3'
          | 'ErrResolverN4'
          | 'ErrResolverN5'
          | 'ErrResolverN6'
          | 'ErrResolverN7'
          | 'ErrResolverN8'
          | 'ErrResolverN9'
          | 'ErrResolverN10'
          | 'ErrResolverN11'
          | 'ErrResolverN12'
          | 'ErrResolverN13'
          | 'ErrResolverN14'
          | 'ErrResolverN15'
          | 'ErrResolverN16'
          | 'ErrResolverN17'
          | 'ErrResolverN18'
          | 'ErrResolverN19'
          | 'ErrResolverN20'
          | 'ErrResolverN21'
          | 'ErrResolverN22'
          | 'ErrResolverN23'
          | 'ErrResolverN24'
          | 'ErrResolverN25'
          | 'ErrResolverN26'
        >,
        typeof resolve
      >(true)
      const t = resolve('OutputN26')
      typesMatch<'ResResolverN26', typeof t>(true)
      return 'chn1a' as 'ResResolverN25'
    })
    const chainN27 = chainN26<{
      Output: 'OutputN27'
      Error: 'ErrorN27'
      ResultResolverController: 'ResResolverN27'
      ErrorResolverController: 'ErrResolverN27'
    }>((x, resolve) => {
      typesMatch<'OutputN26', typeof x>(true)
      typesMatch<
        PinsA<
          'ErrorN27',
          'OutputN27',
          'ResResolverN27',
          | 'ErrResolverN1'
          | 'ErrResolverN2'
          | 'ErrResolverN3'
          | 'ErrResolverN4'
          | 'ErrResolverN5'
          | 'ErrResolverN6'
          | 'ErrResolverN7'
          | 'ErrResolverN8'
          | 'ErrResolverN9'
          | 'ErrResolverN10'
          | 'ErrResolverN11'
          | 'ErrResolverN12'
          | 'ErrResolverN13'
          | 'ErrResolverN14'
          | 'ErrResolverN15'
          | 'ErrResolverN16'
          | 'ErrResolverN17'
          | 'ErrResolverN18'
          | 'ErrResolverN19'
          | 'ErrResolverN20'
          | 'ErrResolverN21'
          | 'ErrResolverN22'
          | 'ErrResolverN23'
          | 'ErrResolverN24'
          | 'ErrResolverN25'
          | 'ErrResolverN26'
          | 'ErrResolverN27'
        >,
        typeof resolve
      >(true)
      const t = resolve('OutputN27')
      typesMatch<'ResResolverN27', typeof t>(true)
      return 'chn1a' as 'ResResolverN26'
    })
    const chainN28 = chainN27<{
      Output: 'OutputN28'
      Error: 'ErrorN28'
      ResultResolverController: 'ResResolverN28'
      ErrorResolverController: 'ErrResolverN28'
    }>((x, resolve) => {
      typesMatch<'OutputN27', typeof x>(true)
      typesMatch<
        PinsA<
          'ErrorN28',
          'OutputN28',
          'ResResolverN28',
          | 'ErrResolverN1'
          | 'ErrResolverN2'
          | 'ErrResolverN3'
          | 'ErrResolverN4'
          | 'ErrResolverN5'
          | 'ErrResolverN6'
          | 'ErrResolverN7'
          | 'ErrResolverN8'
          | 'ErrResolverN9'
          | 'ErrResolverN10'
          | 'ErrResolverN11'
          | 'ErrResolverN12'
          | 'ErrResolverN13'
          | 'ErrResolverN14'
          | 'ErrResolverN15'
          | 'ErrResolverN16'
          | 'ErrResolverN17'
          | 'ErrResolverN18'
          | 'ErrResolverN19'
          | 'ErrResolverN20'
          | 'ErrResolverN21'
          | 'ErrResolverN22'
          | 'ErrResolverN23'
          | 'ErrResolverN24'
          | 'ErrResolverN25'
          | 'ErrResolverN26'
          | 'ErrResolverN27'
          | 'ErrResolverN28'
        >,
        typeof resolve
      >(true)
      const t = resolve('OutputN28')
      typesMatch<'ResResolverN28', typeof t>(true)
      return 'chn1a' as 'ResResolverN27'
    })
    const chainN29 = chainN28<{
      Output: 'OutputN29'
      Error: 'ErrorN29'
      ResultResolverController: 'ResResolverN29'
      ErrorResolverController: 'ErrResolverN29'
    }>((x, resolve) => {
      typesMatch<'OutputN28', typeof x>(true)
      typesMatch<
        PinsA<
          'ErrorN29',
          'OutputN29',
          'ResResolverN29',
          | 'ErrResolverN1'
          | 'ErrResolverN2'
          | 'ErrResolverN3'
          | 'ErrResolverN4'
          | 'ErrResolverN5'
          | 'ErrResolverN6'
          | 'ErrResolverN7'
          | 'ErrResolverN8'
          | 'ErrResolverN9'
          | 'ErrResolverN10'
          | 'ErrResolverN11'
          | 'ErrResolverN12'
          | 'ErrResolverN13'
          | 'ErrResolverN14'
          | 'ErrResolverN15'
          | 'ErrResolverN16'
          | 'ErrResolverN17'
          | 'ErrResolverN18'
          | 'ErrResolverN19'
          | 'ErrResolverN20'
          | 'ErrResolverN21'
          | 'ErrResolverN22'
          | 'ErrResolverN23'
          | 'ErrResolverN24'
          | 'ErrResolverN25'
          | 'ErrResolverN26'
          | 'ErrResolverN27'
          | 'ErrResolverN28'
          | 'ErrResolverN29'
        >,
        typeof resolve
      >(true)
      const t = resolve('OutputN29')
      typesMatch<'ResResolverN29', typeof t>(true)
      return 'chn1a' as 'ResResolverN28'
    })
    const chainN30 = chainN29<{
      Output: 'OutputN30'
      Error: 'ErrorN30'
      ResultResolverController: 'ResResolverN30'
      ErrorResolverController: 'ErrResolverN30'
    }>((x, resolve) => {
      typesMatch<'OutputN29', typeof x>(true)
      typesMatch<
        PinsA<
          'ErrorN30',
          'OutputN30',
          'ResResolverN30',
          | 'ErrResolverN1'
          | 'ErrResolverN2'
          | 'ErrResolverN3'
          | 'ErrResolverN4'
          | 'ErrResolverN5'
          | 'ErrResolverN6'
          | 'ErrResolverN7'
          | 'ErrResolverN8'
          | 'ErrResolverN9'
          | 'ErrResolverN10'
          | 'ErrResolverN11'
          | 'ErrResolverN12'
          | 'ErrResolverN13'
          | 'ErrResolverN14'
          | 'ErrResolverN15'
          | 'ErrResolverN16'
          | 'ErrResolverN17'
          | 'ErrResolverN18'
          | 'ErrResolverN19'
          | 'ErrResolverN20'
          | 'ErrResolverN21'
          | 'ErrResolverN22'
          | 'ErrResolverN23'
          | 'ErrResolverN24'
          | 'ErrResolverN25'
          | 'ErrResolverN26'
          | 'ErrResolverN27'
          | 'ErrResolverN28'
          | 'ErrResolverN29'
          | 'ErrResolverN30'
        >,
        typeof resolve
      >(true)
      const t = resolve('OutputN30')
      typesMatch<'ResResolverN30', typeof t>(true)
      return 'chn1a' as 'ResResolverN29'
    })
    const chainN31 = chainN30<{
      Output: 'OutputN31'
      Error: 'ErrorN31'
      ResultResolverController: 'ResResolverN31'
      ErrorResolverController: 'ErrResolverN31'
    }>((x, resolve) => {
      typesMatch<'OutputN30', typeof x>(true)
      typesMatch<
        PinsA<
          'ErrorN31',
          'OutputN31',
          'ResResolverN31',
          | 'ErrResolverN1'
          | 'ErrResolverN2'
          | 'ErrResolverN3'
          | 'ErrResolverN4'
          | 'ErrResolverN5'
          | 'ErrResolverN6'
          | 'ErrResolverN7'
          | 'ErrResolverN8'
          | 'ErrResolverN9'
          | 'ErrResolverN10'
          | 'ErrResolverN11'
          | 'ErrResolverN12'
          | 'ErrResolverN13'
          | 'ErrResolverN14'
          | 'ErrResolverN15'
          | 'ErrResolverN16'
          | 'ErrResolverN17'
          | 'ErrResolverN18'
          | 'ErrResolverN19'
          | 'ErrResolverN20'
          | 'ErrResolverN21'
          | 'ErrResolverN22'
          | 'ErrResolverN23'
          | 'ErrResolverN24'
          | 'ErrResolverN25'
          | 'ErrResolverN26'
          | 'ErrResolverN27'
          | 'ErrResolverN28'
          | 'ErrResolverN29'
          | 'ErrResolverN30'
          | 'ErrResolverN31'
        >,
        typeof resolve
      >(true)
      const t = resolve('OutputN31')
      typesMatch<'ResResolverN31', typeof t>(true)
      return 'chn1a' as 'ResResolverN30'
    })
    const chainN32 = chainN31<{
      Output: 'OutputN32'
      Error: 'ErrorN32'
      ResultResolverController: 'ResResolverN32'
      ErrorResolverController: 'ErrResolverN32'
    }>((x, resolve) => {
      typesMatch<'OutputN31', typeof x>(true)
      typesMatch<
        PinsA<
          'ErrorN32',
          'OutputN32',
          'ResResolverN32',
          | 'ErrResolverN1'
          | 'ErrResolverN2'
          | 'ErrResolverN3'
          | 'ErrResolverN4'
          | 'ErrResolverN5'
          | 'ErrResolverN6'
          | 'ErrResolverN7'
          | 'ErrResolverN8'
          | 'ErrResolverN9'
          | 'ErrResolverN10'
          | 'ErrResolverN11'
          | 'ErrResolverN12'
          | 'ErrResolverN13'
          | 'ErrResolverN14'
          | 'ErrResolverN15'
          | 'ErrResolverN16'
          | 'ErrResolverN17'
          | 'ErrResolverN18'
          | 'ErrResolverN19'
          | 'ErrResolverN20'
          | 'ErrResolverN21'
          | 'ErrResolverN22'
          | 'ErrResolverN23'
          | 'ErrResolverN24'
          | 'ErrResolverN25'
          | 'ErrResolverN26'
          | 'ErrResolverN27'
          | 'ErrResolverN28'
          | 'ErrResolverN29'
          | 'ErrResolverN30'
          | 'ErrResolverN31'
          | 'ErrResolverN32'
        >,
        typeof resolve
      >(true)
      const t = resolve('OutputN32')
      typesMatch<'ResResolverN32', typeof t>(true)
      return 'chn1a' as 'ResResolverN31'
    })
    const chainN33 = chainN32<{
      Output: 'OutputN33'
      Error: 'ErrorN33'
      ResultResolverController: 'ResResolverN33'
      ErrorResolverController: 'ErrResolverN33'
    }>((x, resolve) => {
      typesMatch<'OutputN32', typeof x>(true)
      typesMatch<
        PinsA<
          'ErrorN33',
          'OutputN33',
          'ResResolverN33',
          | 'ErrResolverN1'
          | 'ErrResolverN2'
          | 'ErrResolverN3'
          | 'ErrResolverN4'
          | 'ErrResolverN5'
          | 'ErrResolverN6'
          | 'ErrResolverN7'
          | 'ErrResolverN8'
          | 'ErrResolverN9'
          | 'ErrResolverN10'
          | 'ErrResolverN11'
          | 'ErrResolverN12'
          | 'ErrResolverN13'
          | 'ErrResolverN14'
          | 'ErrResolverN15'
          | 'ErrResolverN16'
          | 'ErrResolverN17'
          | 'ErrResolverN18'
          | 'ErrResolverN19'
          | 'ErrResolverN20'
          | 'ErrResolverN21'
          | 'ErrResolverN22'
          | 'ErrResolverN23'
          | 'ErrResolverN24'
          | 'ErrResolverN25'
          | 'ErrResolverN26'
          | 'ErrResolverN27'
          | 'ErrResolverN28'
          | 'ErrResolverN29'
          | 'ErrResolverN30'
          | 'ErrResolverN31'
          | 'ErrResolverN32'
          | 'ErrResolverN33'
        >,
        typeof resolve
      >(true)
      const t = resolve('OutputN33')
      typesMatch<'ResResolverN33', typeof t>(true)
      return 'chn1a' as 'ResResolverN32'
    })
    const chainN34 = chainN33<{
      Output: 'OutputN34'
      Error: 'ErrorN34'
      ResultResolverController: 'ResResolverN34'
      ErrorResolverController: 'ErrResolverN34'
    }>((x, resolve) => {
      typesMatch<'OutputN33', typeof x>(true)
      typesMatch<
        PinsA<
          'ErrorN34',
          'OutputN34',
          'ResResolverN34',
          | 'ErrResolverN1'
          | 'ErrResolverN2'
          | 'ErrResolverN3'
          | 'ErrResolverN4'
          | 'ErrResolverN5'
          | 'ErrResolverN6'
          | 'ErrResolverN7'
          | 'ErrResolverN8'
          | 'ErrResolverN9'
          | 'ErrResolverN10'
          | 'ErrResolverN11'
          | 'ErrResolverN12'
          | 'ErrResolverN13'
          | 'ErrResolverN14'
          | 'ErrResolverN15'
          | 'ErrResolverN16'
          | 'ErrResolverN17'
          | 'ErrResolverN18'
          | 'ErrResolverN19'
          | 'ErrResolverN20'
          | 'ErrResolverN21'
          | 'ErrResolverN22'
          | 'ErrResolverN23'
          | 'ErrResolverN24'
          | 'ErrResolverN25'
          | 'ErrResolverN26'
          | 'ErrResolverN27'
          | 'ErrResolverN28'
          | 'ErrResolverN29'
          | 'ErrResolverN30'
          | 'ErrResolverN31'
          | 'ErrResolverN32'
          | 'ErrResolverN33'
          | 'ErrResolverN34'
        >,
        typeof resolve
      >(true)
      const t = resolve('OutputN34')
      typesMatch<'ResResolverN34', typeof t>(true)
      return 'chn1a' as 'ResResolverN33'
    })
    const chainN35 = chainN34<{
      Output: 'OutputN35'
      Error: 'ErrorN35'
      ResultResolverController: 'ResResolverN35'
      ErrorResolverController: 'ErrResolverN35'
    }>((x, resolve) => {
      typesMatch<'OutputN34', typeof x>(true)
      typesMatch<
        PinsA<
          'ErrorN35',
          'OutputN35',
          'ResResolverN35',
          | 'ErrResolverN1'
          | 'ErrResolverN2'
          | 'ErrResolverN3'
          | 'ErrResolverN4'
          | 'ErrResolverN5'
          | 'ErrResolverN6'
          | 'ErrResolverN7'
          | 'ErrResolverN8'
          | 'ErrResolverN9'
          | 'ErrResolverN10'
          | 'ErrResolverN11'
          | 'ErrResolverN12'
          | 'ErrResolverN13'
          | 'ErrResolverN14'
          | 'ErrResolverN15'
          | 'ErrResolverN16'
          | 'ErrResolverN17'
          | 'ErrResolverN18'
          | 'ErrResolverN19'
          | 'ErrResolverN20'
          | 'ErrResolverN21'
          | 'ErrResolverN22'
          | 'ErrResolverN23'
          | 'ErrResolverN24'
          | 'ErrResolverN25'
          | 'ErrResolverN26'
          | 'ErrResolverN27'
          | 'ErrResolverN28'
          | 'ErrResolverN29'
          | 'ErrResolverN30'
          | 'ErrResolverN31'
          | 'ErrResolverN32'
          | 'ErrResolverN33'
          | 'ErrResolverN34'
          | 'ErrResolverN35'
        >,
        typeof resolve
      >(true)
      const t = resolve('OutputN35')
      typesMatch<'ResResolverN35', typeof t>(true)
      return 'chn1a' as 'ResResolverN34'
    })
    const chainN36 = chainN35<{
      Output: 'OutputN36'
      Error: 'ErrorN36'
      ResultResolverController: 'ResResolverN36'
      ErrorResolverController: 'ErrResolverN36'
    }>((x, resolve) => {
      typesMatch<'OutputN35', typeof x>(true)
      typesMatch<
        PinsA<
          'ErrorN36',
          'OutputN36',
          'ResResolverN36',
          | 'ErrResolverN1'
          | 'ErrResolverN2'
          | 'ErrResolverN3'
          | 'ErrResolverN4'
          | 'ErrResolverN5'
          | 'ErrResolverN6'
          | 'ErrResolverN7'
          | 'ErrResolverN8'
          | 'ErrResolverN9'
          | 'ErrResolverN10'
          | 'ErrResolverN11'
          | 'ErrResolverN12'
          | 'ErrResolverN13'
          | 'ErrResolverN14'
          | 'ErrResolverN15'
          | 'ErrResolverN16'
          | 'ErrResolverN17'
          | 'ErrResolverN18'
          | 'ErrResolverN19'
          | 'ErrResolverN20'
          | 'ErrResolverN21'
          | 'ErrResolverN22'
          | 'ErrResolverN23'
          | 'ErrResolverN24'
          | 'ErrResolverN25'
          | 'ErrResolverN26'
          | 'ErrResolverN27'
          | 'ErrResolverN28'
          | 'ErrResolverN29'
          | 'ErrResolverN30'
          | 'ErrResolverN31'
          | 'ErrResolverN32'
          | 'ErrResolverN33'
          | 'ErrResolverN34'
          | 'ErrResolverN35'
          | 'ErrResolverN36'
        >,
        typeof resolve
      >(true)
      const t = resolve('OutputN36')
      typesMatch<'ResResolverN36', typeof t>(true)
      return 'chn1a' as 'ResResolverN35'
    })
    const chainN37 = chainN36<{
      Output: 'OutputN37'
      Error: 'ErrorN37'
      ResultResolverController: 'ResResolverN37'
      ErrorResolverController: 'ErrResolverN37'
    }>((x, resolve) => {
      typesMatch<'OutputN36', typeof x>(true)
      typesMatch<
        PinsA<
          'ErrorN37',
          'OutputN37',
          'ResResolverN37',
          | 'ErrResolverN1'
          | 'ErrResolverN2'
          | 'ErrResolverN3'
          | 'ErrResolverN4'
          | 'ErrResolverN5'
          | 'ErrResolverN6'
          | 'ErrResolverN7'
          | 'ErrResolverN8'
          | 'ErrResolverN9'
          | 'ErrResolverN10'
          | 'ErrResolverN11'
          | 'ErrResolverN12'
          | 'ErrResolverN13'
          | 'ErrResolverN14'
          | 'ErrResolverN15'
          | 'ErrResolverN16'
          | 'ErrResolverN17'
          | 'ErrResolverN18'
          | 'ErrResolverN19'
          | 'ErrResolverN20'
          | 'ErrResolverN21'
          | 'ErrResolverN22'
          | 'ErrResolverN23'
          | 'ErrResolverN24'
          | 'ErrResolverN25'
          | 'ErrResolverN26'
          | 'ErrResolverN27'
          | 'ErrResolverN28'
          | 'ErrResolverN29'
          | 'ErrResolverN30'
          | 'ErrResolverN31'
          | 'ErrResolverN32'
          | 'ErrResolverN33'
          | 'ErrResolverN34'
          | 'ErrResolverN35'
          | 'ErrResolverN36'
          | 'ErrResolverN37'
        >,
        typeof resolve
      >(true)
      const t = resolve('OutputN37')
      typesMatch<'ResResolverN37', typeof t>(true)
      return 'chn1a' as 'ResResolverN36'
    })
    const chainN38 = chainN37<{
      Output: 'OutputN38'
      Error: 'ErrorN38'
      ResultResolverController: 'ResResolverN38'
      ErrorResolverController: 'ErrResolverN38'
    }>((x, resolve) => {
      typesMatch<'OutputN37', typeof x>(true)
      typesMatch<
        PinsA<
          'ErrorN38',
          'OutputN38',
          'ResResolverN38',
          | 'ErrResolverN1'
          | 'ErrResolverN2'
          | 'ErrResolverN3'
          | 'ErrResolverN4'
          | 'ErrResolverN5'
          | 'ErrResolverN6'
          | 'ErrResolverN7'
          | 'ErrResolverN8'
          | 'ErrResolverN9'
          | 'ErrResolverN10'
          | 'ErrResolverN11'
          | 'ErrResolverN12'
          | 'ErrResolverN13'
          | 'ErrResolverN14'
          | 'ErrResolverN15'
          | 'ErrResolverN16'
          | 'ErrResolverN17'
          | 'ErrResolverN18'
          | 'ErrResolverN19'
          | 'ErrResolverN20'
          | 'ErrResolverN21'
          | 'ErrResolverN22'
          | 'ErrResolverN23'
          | 'ErrResolverN24'
          | 'ErrResolverN25'
          | 'ErrResolverN26'
          | 'ErrResolverN27'
          | 'ErrResolverN28'
          | 'ErrResolverN29'
          | 'ErrResolverN30'
          | 'ErrResolverN31'
          | 'ErrResolverN32'
          | 'ErrResolverN33'
          | 'ErrResolverN34'
          | 'ErrResolverN35'
          | 'ErrResolverN36'
          | 'ErrResolverN37'
          | 'ErrResolverN38'
        >,
        typeof resolve
      >(true)
      const t = resolve('OutputN38')
      typesMatch<'ResResolverN38', typeof t>(true)
      return 'chn1a' as 'ResResolverN37'
    })
    const chainN39 = chainN38<{
      Output: 'OutputN39'
      Error: 'ErrorN39'
      ResultResolverController: 'ResResolverN39'
      ErrorResolverController: 'ErrResolverN39'
    }>((x, resolve) => {
      typesMatch<'OutputN38', typeof x>(true)
      typesMatch<
        PinsA<
          'ErrorN39',
          'OutputN39',
          'ResResolverN39',
          | 'ErrResolverN1'
          | 'ErrResolverN2'
          | 'ErrResolverN3'
          | 'ErrResolverN4'
          | 'ErrResolverN5'
          | 'ErrResolverN6'
          | 'ErrResolverN7'
          | 'ErrResolverN8'
          | 'ErrResolverN9'
          | 'ErrResolverN10'
          | 'ErrResolverN11'
          | 'ErrResolverN12'
          | 'ErrResolverN13'
          | 'ErrResolverN14'
          | 'ErrResolverN15'
          | 'ErrResolverN16'
          | 'ErrResolverN17'
          | 'ErrResolverN18'
          | 'ErrResolverN19'
          | 'ErrResolverN20'
          | 'ErrResolverN21'
          | 'ErrResolverN22'
          | 'ErrResolverN23'
          | 'ErrResolverN24'
          | 'ErrResolverN25'
          | 'ErrResolverN26'
          | 'ErrResolverN27'
          | 'ErrResolverN28'
          | 'ErrResolverN29'
          | 'ErrResolverN30'
          | 'ErrResolverN31'
          | 'ErrResolverN32'
          | 'ErrResolverN33'
          | 'ErrResolverN34'
          | 'ErrResolverN35'
          | 'ErrResolverN36'
          | 'ErrResolverN37'
          | 'ErrResolverN38'
          | 'ErrResolverN39'
        >,
        typeof resolve
      >(true)
      const t = resolve('OutputN39')
      typesMatch<'ResResolverN39', typeof t>(true)
      return 'chn1a' as 'ResResolverN38'
    })
    const chainN40 = chainN39<{
      Output: 'OutputN40'
      Error: 'ErrorN40'
      ResultResolverController: 'ResResolverN40'
      ErrorResolverController: 'ErrResolverN40'
    }>((x, resolve) => {
      typesMatch<'OutputN39', typeof x>(true)
      typesMatch<
        PinsA<
          'ErrorN40',
          'OutputN40',
          'ResResolverN40',
          | 'ErrResolverN1'
          | 'ErrResolverN2'
          | 'ErrResolverN3'
          | 'ErrResolverN4'
          | 'ErrResolverN5'
          | 'ErrResolverN6'
          | 'ErrResolverN7'
          | 'ErrResolverN8'
          | 'ErrResolverN9'
          | 'ErrResolverN10'
          | 'ErrResolverN11'
          | 'ErrResolverN12'
          | 'ErrResolverN13'
          | 'ErrResolverN14'
          | 'ErrResolverN15'
          | 'ErrResolverN16'
          | 'ErrResolverN17'
          | 'ErrResolverN18'
          | 'ErrResolverN19'
          | 'ErrResolverN20'
          | 'ErrResolverN21'
          | 'ErrResolverN22'
          | 'ErrResolverN23'
          | 'ErrResolverN24'
          | 'ErrResolverN25'
          | 'ErrResolverN26'
          | 'ErrResolverN27'
          | 'ErrResolverN28'
          | 'ErrResolverN29'
          | 'ErrResolverN30'
          | 'ErrResolverN31'
          | 'ErrResolverN32'
          | 'ErrResolverN33'
          | 'ErrResolverN34'
          | 'ErrResolverN35'
          | 'ErrResolverN36'
          | 'ErrResolverN37'
          | 'ErrResolverN38'
          | 'ErrResolverN39'
          | 'ErrResolverN40'
        >,
        typeof resolve
      >(true)
      const t = resolve('OutputN40')
      typesMatch<'ResResolverN40', typeof t>(true)
      return 'chn1a' as 'ResResolverN39'
    })
    const chainN41 = chainN40<{
      Output: 'OutputN41'
      Error: 'ErrorN41'
      ResultResolverController: 'ResResolverN41'
      ErrorResolverController: 'ErrResolverN41'
    }>((x, resolve) => {
      typesMatch<'OutputN40', typeof x>(true)
      typesMatch<
        PinsA<
          'ErrorN41',
          'OutputN41',
          'ResResolverN41',
          | 'ErrResolverN1'
          | 'ErrResolverN2'
          | 'ErrResolverN3'
          | 'ErrResolverN4'
          | 'ErrResolverN5'
          | 'ErrResolverN6'
          | 'ErrResolverN7'
          | 'ErrResolverN8'
          | 'ErrResolverN9'
          | 'ErrResolverN10'
          | 'ErrResolverN11'
          | 'ErrResolverN12'
          | 'ErrResolverN13'
          | 'ErrResolverN14'
          | 'ErrResolverN15'
          | 'ErrResolverN16'
          | 'ErrResolverN17'
          | 'ErrResolverN18'
          | 'ErrResolverN19'
          | 'ErrResolverN20'
          | 'ErrResolverN21'
          | 'ErrResolverN22'
          | 'ErrResolverN23'
          | 'ErrResolverN24'
          | 'ErrResolverN25'
          | 'ErrResolverN26'
          | 'ErrResolverN27'
          | 'ErrResolverN28'
          | 'ErrResolverN29'
          | 'ErrResolverN30'
          | 'ErrResolverN31'
          | 'ErrResolverN32'
          | 'ErrResolverN33'
          | 'ErrResolverN34'
          | 'ErrResolverN35'
          | 'ErrResolverN36'
          | 'ErrResolverN37'
          | 'ErrResolverN38'
          | 'ErrResolverN39'
          | 'ErrResolverN40'
          | 'ErrResolverN41'
        >,
        typeof resolve
      >(true)
      const t = resolve('OutputN41')
      typesMatch<'ResResolverN41', typeof t>(true)
      return 'chn1a' as 'ResResolverN40'
    })
    const chainN42 = chainN41<{
      Output: 'OutputN42'
      Error: 'ErrorN42'
      ResultResolverController: 'ResResolverN42'
      ErrorResolverController: 'ErrResolverN42'
    }>((x, resolve) => {
      typesMatch<'OutputN41', typeof x>(true)
      typesMatch<
        PinsA<
          'ErrorN42',
          'OutputN42',
          'ResResolverN42',
          | 'ErrResolverN1'
          | 'ErrResolverN2'
          | 'ErrResolverN3'
          | 'ErrResolverN4'
          | 'ErrResolverN5'
          | 'ErrResolverN6'
          | 'ErrResolverN7'
          | 'ErrResolverN8'
          | 'ErrResolverN9'
          | 'ErrResolverN10'
          | 'ErrResolverN11'
          | 'ErrResolverN12'
          | 'ErrResolverN13'
          | 'ErrResolverN14'
          | 'ErrResolverN15'
          | 'ErrResolverN16'
          | 'ErrResolverN17'
          | 'ErrResolverN18'
          | 'ErrResolverN19'
          | 'ErrResolverN20'
          | 'ErrResolverN21'
          | 'ErrResolverN22'
          | 'ErrResolverN23'
          | 'ErrResolverN24'
          | 'ErrResolverN25'
          | 'ErrResolverN26'
          | 'ErrResolverN27'
          | 'ErrResolverN28'
          | 'ErrResolverN29'
          | 'ErrResolverN30'
          | 'ErrResolverN31'
          | 'ErrResolverN32'
          | 'ErrResolverN33'
          | 'ErrResolverN34'
          | 'ErrResolverN35'
          | 'ErrResolverN36'
          | 'ErrResolverN37'
          | 'ErrResolverN38'
          | 'ErrResolverN39'
          | 'ErrResolverN40'
          | 'ErrResolverN41'
          | 'ErrResolverN42'
        >,
        typeof resolve
      >(true)
      const t = resolve('OutputN42')
      typesMatch<'ResResolverN42', typeof t>(true)
      return 'chn1a' as 'ResResolverN41'
    })
  })
  // it.skip('type check - default chain - should error', () => {
  //   const chainN0 = chain()
  //   const chainN1 = chainN0((x, resolve) => {
  //     typesMatch<unknown, typeof x>(true)
  //     typesMatch<PinsA<unknown, unknown, unknown, unknown>, typeof resolve>(true)
  //     const t = resolve('OutputN1')
  //     typesMatch<unknown, typeof t>(true)
  //     return 'chn1a' as 'ResResolverN0'
  //   })
  //   const chainN2 = chainN1((x, resolve) => {
  //     typesMatch<unknown, typeof x>(true)
  //     typesMatch<PinsA<unknown, unknown, unknown, unknown>, typeof resolve>(true)
  //     const t = resolve('OutputN2')
  //     typesMatch<unknown, typeof t>(true)
  //     return 'chn1a' as 'ResResolverN1'
  //   })
  //   const chainN3 = chainN2<{
  //     Output: 'OutputN3'
  //     Error: 'ErrorN3'
  //     ResultResolverController: 'ResResolverN3'
  //     ErrorResolverController: 'ErrResolverN3'
  //   }>((x, resolve) => {
  //     typesMatch<'OutputN2', typeof x>(true)
  //     typesMatch<
  //       PinsA<
  //         'ErrorN3',
  //         'OutputN3',
  //         'ResResolverN3',
  //         'ErrResolverN1' | 'ErrResolverN2' | 'ErrResolverN3'
  //       >,
  //       typeof resolve
  //     >(true)
  //     const t = resolve('OutputN3')
  //     typesMatch<'ResResolverN3', typeof t>(true)
  //     return 'chn1a' as 'ResResolverN2'
  //   })
  // })
  // it.skip('type check - defaults chain', () => {
  //   const chainN0 = chain<
  //     {},
  //     {
  //       Error: 'Error'
  //       InputOutput: 'IO'
  //       ResultResolverController: 'ResultResolverController'
  //       ErrorResolverController: 'ErrorResolverController'
  //     }
  //   >()
  //   const chainN1 = chainN0((x, resolve) => {
  //     typesMatch<'IO', typeof x>(true)
  //     typesMatch<
  //       PinsA<'Error', 'IO', 'ResultResolverController', 'ErrorResolverController'>,
  //       typeof resolve
  //     >(true)
  //     const t = resolve('IO')
  //     typesMatch<'ResultResolverController', typeof t>(true)
  //     return 'chn1a' as 'ResultResolverController'
  //   })
  //   const chainN2 = chainN1((x, resolve) => {
  //     typesMatch<'IO', typeof x>(true)
  //     typesMatch<
  //       PinsA<'Error', 'IO', 'ResultResolverController', 'ErrorResolverController'>,
  //       typeof resolve
  //     >(true)
  //     const t = resolve('IO')
  //     typesMatch<'ResultResolverController', typeof t>(true)
  //     return 'chn1a' as 'ResultResolverController'
  //   })
  //   const chainN3 = chainN2((x, resolve) => {
  //     typesMatch<'IO', typeof x>(true)
  //     typesMatch<
  //       PinsA<'Error', 'IO', 'ResultResolverController', 'ErrorResolverController'>,
  //       typeof resolve
  //     >(true)
  //     const t = resolve('IO')
  //     typesMatch<'ResultResolverController', typeof t>(true)
  //     return 'chn1a' as 'ResultResolverController'
  //   })
  // })
  it('basic', () =>
    new Promise((done) => {
      const chainy = chain<{}, {}, { InputOutput: string; ResultResolverController: void }>(
        (x, resolve) => {
          expect(x).toEqual('start')
          resolve('done')
        },
      )
      // checkType<
      //   (arg: string, resultCb: (result: string) => void, errorCb: (error: unknown) => void) => void
      // >(a.await)
      chainy.await(
        'start',
        (result) => {
          debugger
          checkType<string>(result)
          expect(result).toEqual('done')
          done(undefined)
        },
        doNotCall,
      )
    }))

  it('basic2', () =>
    new Promise((done) => {
      const chainy = chain<
        {},
        { Output: number },
        { InputOutput: string; ResultResolverController: void }
      >((x, resolve) => {
        expect(x).toEqual('start')
        resolve(1)
      })

      const b = chainy<{ Output: boolean }>((x, resolve) => {
        expect(x).toEqual(1)
        resolve(true)
      })

      checkType<
        (arg: string, resultCb: (result: boolean) => void, errorCb: (error: never) => never) => void
      >(b.await)
      b.await(
        'start',
        (result) => {
          expect(result).toEqual(true)
          done(undefined)
        },
        doNotCall,
      )
    }))
  it('basic3', () =>
    new Promise((done) => {
      const chainy = chain<
        {},
        { Output: number },
        { InputOutput: string; ResultResolverController: void }
      >((x, resolve) => {
        expect(x).toEqual('start')
        resolve.result(1)
      })

      const b = chainy<{ Output: boolean }>((x, resolve) => {
        expect(x).toEqual(1)
        resolve.result(true)
      })

      checkType<
        (
          arg: string,
          resultCb: (result: boolean) => void,
          errorCb: (error: unknown) => never,
        ) => void
      >(b.await)
      b.await(
        'start',
        (result) => {
          expect(result).toEqual(true)
          done(undefined)
        },
        doNotCall,
      )
    }))
  it('basic4', () =>
    new Promise((done) => {
      const chainy = chain<
        {},
        { Output: number },
        { InputOutput: string; ResultResolverController: void; ErrorResolverController: void }
      >((x, resolve) => {
        expect(x).toEqual('start')
        resolve.result(1)
      })

      const b = chainy<{ Output: boolean; Error: boolean }>((x, resolve) => {
        expect(x).toEqual(1)
        resolve.error(true)
      })
      typesMatch<
        (
          arg: string,
          resultCb: (result: boolean) => void,
          errorCb: ErrorCb<boolean, number | boolean, void, void>,
        ) => AwaitedChainNodeController<void>,
        typeof b.await
      >(true)

      b.await('start', doNotCall, (error) => {
        expect(error).toEqual(true)
        done(undefined)
      })
    }))
  it('basic5', () =>
    new Promise((done) => {
      const { resultResolver, errorResolver, matches, createChainSegment } = autoResolvers()

      const chainy = chain<
        {},
        {},
        { InputOutput: string; ResultResolverController: void; ErrorResolverController: void }
      >(resultResolver('start', 'a'))

      const b = createChainSegment(['a', 'b'], chainy)

      const c = b(errorResolver('b', 'c'))

      const c1 = c.onError(matches('c', done))

      const d = c1(doNotCall)

      d.await('start', doNotCall, doNotCall)
    }))
  it('basic6', () =>
    new Promise((done) => {
      const { resultResolver, errorResolver, matches, createChainSegment } = autoResolvers()
      const chainy = chain<{}, {}, { InputOutput: string; ResultResolverController: void }>(
        resultResolver('start', 'a'),
      )

      const seg = createChainSegment(['a', 'b', 'c'], chainy)
      const c1 = seg.onError(doNotCall)

      const d = c1(errorResolver('c', 'd'))

      d.await('start', doNotCall, matches('d', done))
    }))

  it('executes multiple times', () =>
    new Promise((done) => {
      const { createChainSegment2 } = autoResolvers()
      const chainy = chain<{}, {}, { InputOutput: number; ResultResolverController: void }>(
        (x, resolver) => resolver(x + 1),
      )

      const seg = createChainSegment2(2, chainy)

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
      const chainy = chain<{}, {}, { InputOutput: string; ResultResolverController: void }>(
        (x, resolve) => resolve(`a:${x}`),
      )
      const a = chainy.s((x) => `b:${x}`)((x, resolve) => resolve(`c:${x}`))
      a.await('1', matches('c:b:a:1'), doNotCall)
      a.await('2', matches('c:b:a:2', done), doNotCall)
    }))

  it('splits onError throws', () =>
    new Promise((done) => {
      const { matches } = autoResolvers()
      const chainy = chain<
        { Input: string },
        { Output: string },
        { Error: string; ResultResolverController: void; ErrorResolverController: void }
      >((x, resolve) => resolve.error(`a:${x}`))
      const x = chainy.onError(matches('a:1'))
      const y = chainy.onError((result) => {
        expect(result).toEqual('a:2')
        done(undefined)
      })

      x.await('1', doNotCall, doNotCall)
      y.await('2', doNotCall, doNotCall)
    }))
  it('duplicate onError throws', () =>
    new Promise((done) => {
      const { resultResolver, matches } = autoResolvers()
      const chainy = chain<{}, {}, { InputOutput: string; ResultResolverController: void }>(
        resultResolver('a', 'b'),
      )
      const b1 = chainy(resultResolver('b', 'b1'))
      const b2 = chainy(resultResolver('b', 'b2'))

      b1.await('a', matches('b1'), doNotCall)
      b2.await('a', matches('b2'), doNotCall)

      const c = b2(resultResolver('b2', 'c'))
      c.await('a', matches('c', done), doNotCall)
    }))
  it('sequential onError', () =>
    new Promise((done) => {
      const chainy = chain<
        {},
        {},
        {
          InputOutput: string
          Error: string
          ResultResolverController: void
          ErrorResolverController: void
        }
      >((x, resolve) => resolve.error(`a:${x}`))
      const b = chainy.onError((result, resolver) => {
        expect(result).toEqual('a:1')
        resolver('b')
      })
      const c = b((x, resolve) => resolve(`c:${x}`))((x, resolve) => resolve.error(`c2:${x}`))
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
      let controller: AwaitedChainNodeController<'cancelA' | 'cancelB' | 'cancelD' | 'done'>
      const chainy = chain<
        {
          ResultResolverController: 'cancelA'
          ErrorResolverController: 'errorAR'
        },
        {
          Error: 'errorA'
          ResultResolverController: 'cancelB'
          ErrorResolverController: 'errorBR'
        },
        { InputOutput: string }
      >((x, resolve) => {
        setTimeout(() => {
          debugger
          expect(controller.controller).toEqual('cancelA')
          const t = resolve(`a:${x}`) // 'b'
          // const e = resolve.error('A')
          typesMatch<'cancelB', typeof t>(true)
          console.log(t)
        }, 100)
        return 'cancelA'
      })
      const b = chainy<{ Output: string; Error: 'errorB'; ErrorResolverController: 'errorCR' }>(
        (x, resolve) => {
          setTimeout(() => {
            debugger
            expect(controller.controller).toEqual('cancelB')
            const t = resolve(`b:${x}`) // 'done'
            // const e = resolve.error('A')
            expect(controller.controller).toEqual('cancelD')
            typesMatch<never, typeof t>(true)
            console.log(t)
          }, 100)
          return 'cancelB'
        },
      )
      const c = b.s<{ Output: string; Error: 'errorC'; ResultResolverController: 'cancelD' }>(
        (x) => {
          debugger
          expect(controller.controller).toEqual(undefined)
          return 'cancelC'
        },
      )
      const d = c<{ Output: string; Error: 'errorD'; ResultResolverController: 'done' }>(
        (x, resolve) => {
          setTimeout(() => {
            debugger
            expect(controller.controller).toEqual('cancelD')
            const t = resolve(`d:${x}`) // 'done'
            typesMatch<'done', typeof t>(true)
            console.log(t)
            done(undefined)
          }, 100)
          return 'cancelD'
        },
      )

      const controllerA = d.await(
        '1',
        (_result) => {
          debugger
          expect(controller.controller).toEqual(undefined)
          return 'done'
        },
        (_error) => _error as unknown as 'errorAR' | 'errorBR' | 'errorCR',
      )
      debugger
      typesMatch<
        AwaitedChainNodeController<'cancelA' | 'cancelB' | 'cancelD' | 'done'>,
        typeof controllerA
      >(true)
      controller = controllerA
      expect(controller.controller).toEqual('cancelA')
    }))
})

// const chain = asyncMapChain(getFile, splitFile, searchOnline, consolidateResults, formatResults)

// stream -> new stream -y-> new Conversation      -> process stream
//                      -n-> existing Conversation -> process stream
