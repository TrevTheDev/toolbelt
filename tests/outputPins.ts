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

import chain, { AwaitedChainNodeController } from '../src/scratch'
import type { Pins, ChainNode } from '../src/scratch'
import { times } from '../src/smallUtils'

type StrictEqual<A1, A2> = [A1] extends [A2] ? ([A2] extends [A1] ? true : false) : false

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
  const createChainSegment2 = <Chain extends ChainNode<any, any, any, any, any, any, any>>(
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
    const chainN0 = chain<{
      //   DefaultInputOutput: 'stringD'
      //   DefaultResultResolverController: 'voidD'
      Input: 'RI'
      Output: 'OutputN0'
      ResultResolverController: 'ResResolverN0'
    }>()
    // const chainN01 = chn1<{ Output: 'N01O'; ResultResolverController: 'N01RRC' }>((x, resolve) => {
    //     typesMatch<'RO', typeof x>(true)
    //     typesMatch<
    //     Pins<{
    //         Output: 'N01O'
    //         Error: unknown
    //         ResultResolverController: 'N01RRC'
    //         ErrorResolverController: unknown
    //     }>,
    //     typeof resolve
    //     >(true)
    //     const t = resolve('N01O')
    //     typesMatch<'N01RRC', typeof t>(true)
    //     return 'chn1a' as 'RRR'
    // })

    const chainN1 = chainN0<{ Output: 'OutputN1'; ResultResolverController: 'ResResolverN1' }>(
      (x, resolve) => {
        typesMatch<'OutputN0', typeof x>(true)
        typesMatch<
          Pins<{
            Output: 'OutputN1'
            Error: unknown
            ResultResolverController: 'ResResolverN1'
            ErrorResolverController: unknown
          }>,
          typeof resolve
        >(true)
        const t = resolve('OutputN1')
        typesMatch<'ResResolverN1', typeof t>(true)
        return 'chn1a' as 'ResResolverN0'
      },
    )
    const chainN2 = chainN1<{ Output: 'OutputN2'; ResultResolverController: 'ResResolverN2' }>(
      (x, resolve) => {
        typesMatch<'OutputN1', typeof x>(true)
        typesMatch<
          Pins<{
            Output: 'OutputN2'
            Error: unknown
            ResultResolverController: 'ResResolverN2'
            ErrorResolverController: unknown
          }>,
          typeof resolve
        >(true)
        const t = resolve('OutputN2')
        typesMatch<'ResResolverN2', typeof t>(true)
        return 'chn1a' as 'ResResolverN1'
      },
    )
    const chainN3 = chainN2<{ Output: 'OutputN3'; ResultResolverController: 'ResResolverN3' }>(
      (x, resolve) => {
        typesMatch<'OutputN2', typeof x>(true)
        typesMatch<
          Pins<{
            Output: 'OutputN3'
            Error: unknown
            ResultResolverController: 'ResResolverN3'
            ErrorResolverController: unknown
          }>,
          typeof resolve
        >(true)
        const t = resolve('OutputN3')
        typesMatch<'ResResolverN3', typeof t>(true)
        return 'chn1a' as 'ResResolverN2'
      },
    )
    const chainN4 = chainN3<{ Output: 'OutputN4'; ResultResolverController: 'ResResolverN4' }>(
      (x, resolve) => {
        typesMatch<'OutputN3', typeof x>(true)
        typesMatch<
          Pins<{
            Output: 'OutputN4'
            Error: unknown
            ResultResolverController: 'ResResolverN4'
            ErrorResolverController: unknown
          }>,
          typeof resolve
        >(true)
        const t = resolve('OutputN4')
        typesMatch<'ResResolverN4', typeof t>(true)
        return 'chn1a' as 'ResResolverN3'
      },
    )
    const chainN5 = chainN4<{ Output: 'OutputN5'; ResultResolverController: 'ResResolverN5' }>(
      (x, resolve) => {
        typesMatch<'OutputN4', typeof x>(true)
        typesMatch<
          Pins<{
            Output: 'OutputN5'
            Error: unknown
            ResultResolverController: 'ResResolverN5'
            ErrorResolverController: unknown
          }>,
          typeof resolve
        >(true)
        const t = resolve('OutputN5')
        typesMatch<'ResResolverN5', typeof t>(true)
        return 'chn1a' as 'ResResolverN4'
      },
    )
    const chainN6 = chainN5<{ Output: 'OutputN6'; ResultResolverController: 'ResResolverN6' }>(
      (x, resolve) => {
        typesMatch<'OutputN5', typeof x>(true)
        typesMatch<
          Pins<{
            Output: 'OutputN6'
            Error: unknown
            ResultResolverController: 'ResResolverN6'
            ErrorResolverController: unknown
          }>,
          typeof resolve
        >(true)
        const t = resolve('OutputN6')
        typesMatch<'ResResolverN6', typeof t>(true)
        return 'chn1a' as 'ResResolverN5'
      },
    )
    const chainN7 = chainN6<{ Output: 'OutputN7'; ResultResolverController: 'ResResolverN7' }>(
      (x, resolve) => {
        typesMatch<'OutputN6', typeof x>(true)
        typesMatch<
          Pins<{
            Output: 'OutputN7'
            Error: unknown
            ResultResolverController: 'ResResolverN7'
            ErrorResolverController: unknown
          }>,
          typeof resolve
        >(true)
        const t = resolve('OutputN7')
        typesMatch<'ResResolverN7', typeof t>(true)
        return 'chn1a' as 'ResResolverN6'
      },
    )
    const chainN8 = chainN7<{ Output: 'OutputN8'; ResultResolverController: 'ResResolverN8' }>(
      (x, resolve) => {
        typesMatch<'OutputN7', typeof x>(true)
        typesMatch<
          Pins<{
            Output: 'OutputN8'
            Error: unknown
            ResultResolverController: 'ResResolverN8'
            ErrorResolverController: unknown
          }>,
          typeof resolve
        >(true)
        const t = resolve('OutputN8')
        typesMatch<'ResResolverN8', typeof t>(true)
        return 'chn1a' as 'ResResolverN7'
      },
    )
    const chainN9 = chainN8<{ Output: 'OutputN9'; ResultResolverController: 'ResResolverN9' }>(
      (x, resolve) => {
        typesMatch<'OutputN8', typeof x>(true)
        typesMatch<
          Pins<{
            Output: 'OutputN9'
            Error: unknown
            ResultResolverController: 'ResResolverN9'
            ErrorResolverController: unknown
          }>,
          typeof resolve
        >(true)
        const t = resolve('OutputN9')
        typesMatch<'ResResolverN9', typeof t>(true)
        return 'chn1a' as 'ResResolverN8'
      },
    )
    const chainN10 = chainN9<{ Output: 'OutputN10'; ResultResolverController: 'ResResolverN10' }>(
      (x, resolve) => {
        typesMatch<'OutputN9', typeof x>(true)
        typesMatch<
          Pins<{
            Output: 'OutputN10'
            Error: unknown
            ResultResolverController: 'ResResolverN10'
            ErrorResolverController: unknown
          }>,
          typeof resolve
        >(true)
        const t = resolve('OutputN10')
        typesMatch<'ResResolverN10', typeof t>(true)
        return 'chn1a' as 'ResResolverN9'
      },
    )
    const chainN11 = chainN10<{ Output: 'OutputN11'; ResultResolverController: 'ResResolverN11' }>(
      (x, resolve) => {
        typesMatch<'OutputN10', typeof x>(true)
        typesMatch<
          Pins<{
            Output: 'OutputN11'
            Error: unknown
            ResultResolverController: 'ResResolverN11'
            ErrorResolverController: unknown
          }>,
          typeof resolve
        >(true)
        const t = resolve('OutputN11')
        typesMatch<'ResResolverN11', typeof t>(true)
        return 'chn1a' as 'ResResolverN10'
      },
    )
    const chainN12 = chainN11<{ Output: 'OutputN12'; ResultResolverController: 'ResResolverN12' }>(
      (x, resolve) => {
        typesMatch<'OutputN11', typeof x>(true)
        typesMatch<
          Pins<{
            Output: 'OutputN12'
            Error: unknown
            ResultResolverController: 'ResResolverN12'
            ErrorResolverController: unknown
          }>,
          typeof resolve
        >(true)
        const t = resolve('OutputN12')
        typesMatch<'ResResolverN12', typeof t>(true)
        return 'chn1a' as 'ResResolverN11'
      },
    )
    const chainN13 = chainN12<{ Output: 'OutputN13'; ResultResolverController: 'ResResolverN13' }>(
      (x, resolve) => {
        typesMatch<'OutputN12', typeof x>(true)
        typesMatch<
          Pins<{
            Output: 'OutputN13'
            Error: unknown
            ResultResolverController: 'ResResolverN13'
            ErrorResolverController: unknown
          }>,
          typeof resolve
        >(true)
        const t = resolve('OutputN13')
        typesMatch<'ResResolverN13', typeof t>(true)
        return 'chn1a' as 'ResResolverN12'
      },
    )
    const chainN14 = chainN13<{ Output: 'OutputN14'; ResultResolverController: 'ResResolverN14' }>(
      (x, resolve) => {
        typesMatch<'OutputN13', typeof x>(true)
        typesMatch<
          Pins<{
            Output: 'OutputN14'
            Error: unknown
            ResultResolverController: 'ResResolverN14'
            ErrorResolverController: unknown
          }>,
          typeof resolve
        >(true)
        const t = resolve('OutputN14')
        typesMatch<'ResResolverN14', typeof t>(true)
        return 'chn1a' as 'ResResolverN13'
      },
    )
    const chainN15 = chainN14<{ Output: 'OutputN15'; ResultResolverController: 'ResResolverN15' }>(
      (x, resolve) => {
        typesMatch<'OutputN14', typeof x>(true)
        typesMatch<
          Pins<{
            Output: 'OutputN15'
            Error: unknown
            ResultResolverController: 'ResResolverN15'
            ErrorResolverController: unknown
          }>,
          typeof resolve
        >(true)
        const t = resolve('OutputN15')
        typesMatch<'ResResolverN15', typeof t>(true)
        return 'chn1a' as 'ResResolverN14'
      },
    )
    const chainN16 = chainN15<{ Output: 'OutputN16'; ResultResolverController: 'ResResolverN16' }>(
      (x, resolve) => {
        typesMatch<'OutputN15', typeof x>(true)
        typesMatch<
          Pins<{
            Output: 'OutputN16'
            Error: unknown
            ResultResolverController: 'ResResolverN16'
            ErrorResolverController: unknown
          }>,
          typeof resolve
        >(true)
        const t = resolve('OutputN16')
        typesMatch<'ResResolverN16', typeof t>(true)
        return 'chn1a' as 'ResResolverN15'
      },
    )
    const chainN17 = chainN16<{ Output: 'OutputN17'; ResultResolverController: 'ResResolverN17' }>(
      (x, resolve) => {
        typesMatch<'OutputN16', typeof x>(true)
        typesMatch<
          Pins<{
            Output: 'OutputN17'
            Error: unknown
            ResultResolverController: 'ResResolverN17'
            ErrorResolverController: unknown
          }>,
          typeof resolve
        >(true)
        const t = resolve('OutputN17')
        typesMatch<'ResResolverN17', typeof t>(true)
        return 'chn1a' as 'ResResolverN16'
      },
    )
    const chainN18 = chainN17<{ Output: 'OutputN18'; ResultResolverController: 'ResResolverN18' }>(
      (x, resolve) => {
        typesMatch<'OutputN17', typeof x>(true)
        typesMatch<
          Pins<{
            Output: 'OutputN18'
            Error: unknown
            ResultResolverController: 'ResResolverN18'
            ErrorResolverController: unknown
          }>,
          typeof resolve
        >(true)
        const t = resolve('OutputN18')
        typesMatch<'ResResolverN18', typeof t>(true)
        return 'chn1a' as 'ResResolverN17'
      },
    )
    const chainN19 = chainN18<{ Output: 'OutputN19'; ResultResolverController: 'ResResolverN19' }>(
      (x, resolve) => {
        typesMatch<'OutputN18', typeof x>(true)
        typesMatch<
          Pins<{
            Output: 'OutputN19'
            Error: unknown
            ResultResolverController: 'ResResolverN19'
            ErrorResolverController: unknown
          }>,
          typeof resolve
        >(true)
        const t = resolve('OutputN19')
        typesMatch<'ResResolverN19', typeof t>(true)
        return 'chn1a' as 'ResResolverN18'
      },
    )
    const chainN20 = chainN19<{ Output: 'OutputN20'; ResultResolverController: 'ResResolverN20' }>(
      (x, resolve) => {
        typesMatch<'OutputN19', typeof x>(true)
        typesMatch<
          Pins<{
            Output: 'OutputN20'
            Error: unknown
            ResultResolverController: 'ResResolverN20'
            ErrorResolverController: unknown
          }>,
          typeof resolve
        >(true)
        const t = resolve('OutputN20')
        typesMatch<'ResResolverN20', typeof t>(true)
        return 'chn1a' as 'ResResolverN19'
      },
    )
    const chainN21 = chainN20<{ Output: 'OutputN21'; ResultResolverController: 'ResResolverN21' }>(
      (x, resolve) => {
        typesMatch<'OutputN20', typeof x>(true)
        typesMatch<
          Pins<{
            Output: 'OutputN21'
            Error: unknown
            ResultResolverController: 'ResResolverN21'
            ErrorResolverController: unknown
          }>,
          typeof resolve
        >(true)
        const t = resolve('OutputN21')
        typesMatch<'ResResolverN21', typeof t>(true)
        return 'chn1a' as 'ResResolverN20'
      },
    )
    const chainN22 = chainN21<{ Output: 'OutputN22'; ResultResolverController: 'ResResolverN22' }>(
      (x, resolve) => {
        typesMatch<'OutputN21', typeof x>(true)
        typesMatch<
          Pins<{
            Output: 'OutputN22'
            Error: unknown
            ResultResolverController: 'ResResolverN22'
            ErrorResolverController: unknown
          }>,
          typeof resolve
        >(true)
        const t = resolve('OutputN22')
        typesMatch<'ResResolverN22', typeof t>(true)
        return 'chn1a' as 'ResResolverN21'
      },
    )
    const chainN23 = chainN22<{ Output: 'OutputN23'; ResultResolverController: 'ResResolverN23' }>(
      (x, resolve) => {
        typesMatch<'OutputN22', typeof x>(true)
        typesMatch<
          Pins<{
            Output: 'OutputN23'
            Error: unknown
            ResultResolverController: 'ResResolverN23'
            ErrorResolverController: unknown
          }>,
          typeof resolve
        >(true)
        const t = resolve('OutputN23')
        typesMatch<'ResResolverN23', typeof t>(true)
        return 'chn1a' as 'ResResolverN22'
      },
    )
    const chainN24 = chainN23<{ Output: 'OutputN24'; ResultResolverController: 'ResResolverN24' }>(
      (x, resolve) => {
        typesMatch<'OutputN23', typeof x>(true)
        typesMatch<
          Pins<{
            Output: 'OutputN24'
            Error: unknown
            ResultResolverController: 'ResResolverN24'
            ErrorResolverController: unknown
          }>,
          typeof resolve
        >(true)
        const t = resolve('OutputN24')
        typesMatch<'ResResolverN24', typeof t>(true)
        return 'chn1a' as 'ResResolverN23'
      },
    )
    const chainN25 = chainN24<{ Output: 'OutputN25'; ResultResolverController: 'ResResolverN25' }>(
      (x, resolve) => {
        typesMatch<'OutputN24', typeof x>(true)
        typesMatch<
          Pins<{
            Output: 'OutputN25'
            Error: unknown
            ResultResolverController: 'ResResolverN25'
            ErrorResolverController: unknown
          }>,
          typeof resolve
        >(true)
        const t = resolve('OutputN25')
        typesMatch<'ResResolverN25', typeof t>(true)
        return 'chn1a' as 'ResResolverN24'
      },
    )
    const chainN26 = chainN25<{ Output: 'OutputN26'; ResultResolverController: 'ResResolverN26' }>(
      (x, resolve) => {
        typesMatch<'OutputN25', typeof x>(true)
        typesMatch<
          Pins<{
            Output: 'OutputN26'
            Error: unknown
            ResultResolverController: 'ResResolverN26'
            ErrorResolverController: unknown
          }>,
          typeof resolve
        >(true)
        const t = resolve('OutputN26')
        typesMatch<'ResResolverN26', typeof t>(true)
        return 'chn1a' as 'ResResolverN25'
      },
    )
    const chainN27 = chainN26<{ Output: 'OutputN27'; ResultResolverController: 'ResResolverN27' }>(
      (x, resolve) => {
        typesMatch<'OutputN26', typeof x>(true)
        typesMatch<
          Pins<{
            Output: 'OutputN27'
            Error: unknown
            ResultResolverController: 'ResResolverN27'
            ErrorResolverController: unknown
          }>,
          typeof resolve
        >(true)
        const t = resolve('OutputN27')
        typesMatch<'ResResolverN27', typeof t>(true)
        return 'chn1a' as 'ResResolverN26'
      },
    )
    const chainN28 = chainN27<{ Output: 'OutputN28'; ResultResolverController: 'ResResolverN28' }>(
      (x, resolve) => {
        typesMatch<'OutputN27', typeof x>(true)
        typesMatch<
          Pins<{
            Output: 'OutputN28'
            Error: unknown
            ResultResolverController: 'ResResolverN28'
            ErrorResolverController: unknown
          }>,
          typeof resolve
        >(true)
        const t = resolve('OutputN28')
        typesMatch<'ResResolverN28', typeof t>(true)
        return 'chn1a' as 'ResResolverN27'
      },
    )
    const chainN29 = chainN28<{ Output: 'OutputN29'; ResultResolverController: 'ResResolverN29' }>(
      (x, resolve) => {
        typesMatch<'OutputN28', typeof x>(true)
        typesMatch<
          Pins<{
            Output: 'OutputN29'
            Error: unknown
            ResultResolverController: 'ResResolverN29'
            ErrorResolverController: unknown
          }>,
          typeof resolve
        >(true)
        const t = resolve('OutputN29')
        typesMatch<'ResResolverN29', typeof t>(true)
        return 'chn1a' as 'ResResolverN28'
      },
    )
    const chainN30 = chainN29<{ Output: 'OutputN30'; ResultResolverController: 'ResResolverN30' }>(
      (x, resolve) => {
        typesMatch<'OutputN29', typeof x>(true)
        typesMatch<
          Pins<{
            Output: 'OutputN30'
            Error: unknown
            ResultResolverController: 'ResResolverN30'
            ErrorResolverController: unknown
          }>,
          typeof resolve
        >(true)
        const t = resolve('OutputN30')
        typesMatch<'ResResolverN30', typeof t>(true)
        return 'chn1a' as 'ResResolverN29'
      },
    )
    const chainN31 = chainN30<{ Output: 'OutputN31'; ResultResolverController: 'ResResolverN31' }>(
      (x, resolve) => {
        typesMatch<'OutputN30', typeof x>(true)
        typesMatch<
          Pins<{
            Output: 'OutputN31'
            Error: unknown
            ResultResolverController: 'ResResolverN31'
            ErrorResolverController: unknown
          }>,
          typeof resolve
        >(true)
        const t = resolve('OutputN31')
        typesMatch<'ResResolverN31', typeof t>(true)
        return 'chn1a' as 'ResResolverN30'
      },
    )
    const chainN32 = chainN31<{ Output: 'OutputN32'; ResultResolverController: 'ResResolverN32' }>(
      (x, resolve) => {
        typesMatch<'OutputN31', typeof x>(true)
        typesMatch<
          Pins<{
            Output: 'OutputN32'
            Error: unknown
            ResultResolverController: 'ResResolverN32'
            ErrorResolverController: unknown
          }>,
          typeof resolve
        >(true)
        const t = resolve('OutputN32')
        typesMatch<'ResResolverN32', typeof t>(true)
        return 'chn1a' as 'ResResolverN31'
      },
    )
    const chainN33 = chainN32<{ Output: 'OutputN33'; ResultResolverController: 'ResResolverN33' }>(
      (x, resolve) => {
        typesMatch<'OutputN32', typeof x>(true)
        typesMatch<
          Pins<{
            Output: 'OutputN33'
            Error: unknown
            ResultResolverController: 'ResResolverN33'
            ErrorResolverController: unknown
          }>,
          typeof resolve
        >(true)
        const t = resolve('OutputN33')
        typesMatch<'ResResolverN33', typeof t>(true)
        return 'chn1a' as 'ResResolverN32'
      },
    )
    const chainN34 = chainN33<{ Output: 'OutputN34'; ResultResolverController: 'ResResolverN34' }>(
      (x, resolve) => {
        typesMatch<'OutputN33', typeof x>(true)
        typesMatch<
          Pins<{
            Output: 'OutputN34'
            Error: unknown
            ResultResolverController: 'ResResolverN34'
            ErrorResolverController: unknown
          }>,
          typeof resolve
        >(true)
        const t = resolve('OutputN34')
        typesMatch<'ResResolverN34', typeof t>(true)
        return 'chn1a' as 'ResResolverN33'
      },
    )
    const chainN35 = chainN34<{ Output: 'OutputN35'; ResultResolverController: 'ResResolverN35' }>(
      (x, resolve) => {
        typesMatch<'OutputN34', typeof x>(true)
        typesMatch<
          Pins<{
            Output: 'OutputN35'
            Error: unknown
            ResultResolverController: 'ResResolverN35'
            ErrorResolverController: unknown
          }>,
          typeof resolve
        >(true)
        const t = resolve('OutputN35')
        typesMatch<'ResResolverN35', typeof t>(true)
        return 'chn1a' as 'ResResolverN34'
      },
    )
    const chainN36 = chainN35<{ Output: 'OutputN36'; ResultResolverController: 'ResResolverN36' }>(
      (x, resolve) => {
        typesMatch<'OutputN35', typeof x>(true)
        typesMatch<
          Pins<{
            Output: 'OutputN36'
            Error: unknown
            ResultResolverController: 'ResResolverN36'
            ErrorResolverController: unknown
          }>,
          typeof resolve
        >(true)
        const t = resolve('OutputN36')
        typesMatch<'ResResolverN36', typeof t>(true)
        return 'chn1a' as 'ResResolverN35'
      },
    )
    const chainN37 = chainN36<{ Output: 'OutputN37'; ResultResolverController: 'ResResolverN37' }>(
      (x, resolve) => {
        typesMatch<'OutputN36', typeof x>(true)
        typesMatch<
          Pins<{
            Output: 'OutputN37'
            Error: unknown
            ResultResolverController: 'ResResolverN37'
            ErrorResolverController: unknown
          }>,
          typeof resolve
        >(true)
        const t = resolve('OutputN37')
        typesMatch<'ResResolverN37', typeof t>(true)
        return 'chn1a' as 'ResResolverN36'
      },
    )
    const chainN38 = chainN37<{ Output: 'OutputN38'; ResultResolverController: 'ResResolverN38' }>(
      (x, resolve) => {
        typesMatch<'OutputN37', typeof x>(true)
        typesMatch<
          Pins<{
            Output: 'OutputN38'
            Error: unknown
            ResultResolverController: 'ResResolverN38'
            ErrorResolverController: unknown
          }>,
          typeof resolve
        >(true)
        const t = resolve('OutputN38')
        typesMatch<'ResResolverN38', typeof t>(true)
        return 'chn1a' as 'ResResolverN37'
      },
    )
    const chainN39 = chainN38<{ Output: 'OutputN39'; ResultResolverController: 'ResResolverN39' }>(
      (x, resolve) => {
        typesMatch<'OutputN38', typeof x>(true)
        typesMatch<
          Pins<{
            Output: 'OutputN39'
            Error: unknown
            ResultResolverController: 'ResResolverN39'
            ErrorResolverController: unknown
          }>,
          typeof resolve
        >(true)
        const t = resolve('OutputN39')
        typesMatch<'ResResolverN39', typeof t>(true)
        return 'chn1a' as 'ResResolverN38'
      },
    )
    const chainN40 = chainN39<{ Output: 'OutputN40'; ResultResolverController: 'ResResolverN40' }>(
      (x, resolve) => {
        typesMatch<'OutputN39', typeof x>(true)
        typesMatch<
          Pins<{
            Output: 'OutputN40'
            Error: unknown
            ResultResolverController: 'ResResolverN40'
            ErrorResolverController: unknown
          }>,
          typeof resolve
        >(true)
        const t = resolve('OutputN40')
        typesMatch<'ResResolverN40', typeof t>(true)
        return 'chn1a' as 'ResResolverN39'
      },
    )
    const chainN41 = chainN40<{ Output: 'OutputN41'; ResultResolverController: 'ResResolverN41' }>(
      (x, resolve) => {
        typesMatch<'OutputN40', typeof x>(true)
        typesMatch<
          Pins<{
            Output: 'OutputN41'
            Error: unknown
            ResultResolverController: 'ResResolverN41'
            ErrorResolverController: unknown
          }>,
          typeof resolve
        >(true)
        const t = resolve('OutputN41')
        typesMatch<'ResResolverN41', typeof t>(true)
        return 'chn1a' as 'ResResolverN40'
      },
    )
    const chainN42 = chainN41<{ Output: 'OutputN42'; ResultResolverController: 'ResResolverN42' }>(
      (x, resolve) => {
        typesMatch<'OutputN41', typeof x>(true)
        typesMatch<
          Pins<{
            Output: 'OutputN42'
            Error: unknown
            ResultResolverController: 'ResResolverN42'
            ErrorResolverController: unknown
          }>,
          typeof resolve
        >(true)
        const t = resolve('OutputN42')
        typesMatch<'ResResolverN42', typeof t>(true)
        return 'chn1a' as 'ResResolverN41'
      },
    )

    const chn1b = chainN01<{ Output: 'numberA'; ResultResolverController: 'N2RRC' }>(
      (x, resolve) => {
        typesMatch<'N1O', typeof x>(true)
        typesMatch<Pins<'numberA', 'voidD'>, typeof resolve>(true)
        const t = resolve('numberA')
        typesMatch<'N2RRC', typeof t>(true)
        return 'chn1b' as 'N1RRC'
      },
    )
    const chn1c = chn1b<{
      Output: 'booleanB'
      ResultResolverController: 'voidB'
    }>((x, resolve) => {
      typesMatch<'numberA', typeof x>(true)
      typesMatch<Pins<'booleanB', 'voidB', 'chn1d', void>, typeof resolve>(true)
      const t = resolve('booleanB')
      typesMatch<'chn1d', typeof t>(true)
      return 'chn1d' as 'chn1d'
    })
    const chn1d = chn1c<{
      Output: 'booleanC'
      AsyncFnController: 'voidC'
      ResultResolverController: 'ch1Await'
    }>((x, resolve) => {
      typesMatch<'booleanB', typeof x>(true)
      typesMatch<Pins<'booleanC', 'voidC', 'ch1Await', void>, typeof resolve>(true)
      const t = resolve('booleanC')
      typesMatch<'ch1Await', typeof t>(true)
      return 'chn1d' as 'voidC'
    })
    const chn1e = chn1d.onError((x) => {
      typesMatch<'voidD' | 'voidB' | 'voidC', typeof x>(true)
    })
    const ch1Await = chn1e.await(
      'stringI',
      (result) => {
        typesMatch<'booleanC', typeof result>(true)
        return 'ch1Await'
      },
      (error) => {
        typesMatch<never, typeof error>(true)
      },
    )
    typesMatch<AwaitedChainNodeController<void | 'chn1d' | 'ch1Await'>, typeof ch1Await>(true)
    const chn1f = chn1e<'booleanE', 'voidE', 'chn1f'>((x, resolve) => {
      typesMatch<'booleanC', typeof x>(true)
      typesMatch<Pins<'booleanE', 'voidE', 'chn1f', void>, typeof resolve>(true)
      const t = resolve('booleanE')
      typesMatch<'chn1f', typeof t>(true)
      return 'ch1Await' as 'ch1Await'
    })
    const chn1g = chn1f.onError((x) => {
      typesMatch<'voidE', typeof x>(true)
    })
  })
  // it('basic', () =>
  //   new Promise((done) => {
  //     const chainy = chain<string>()
  //     const a = chainy<string>((x, resolve) => {
  //       checkType<string>(x)
  //       checkType<Pins<string>>(resolve)
  //       resolve('done')
  //     })
  //     // checkType<
  //     //   (arg: string, resultCb: (result: string) => void, errorCb: (error: unknown) => void) => void
  //     // >(a.await)
  //     a.await(
  //       'start',
  //       (result) => {
  //         checkType<string>(result)
  //         expect(result).toEqual('done')
  //         done(undefined)
  //       },
  //       doNotCall,
  //     )
  //   }))

  // it('basic2', () =>
  //   new Promise((done) => {
  //     const chainy = chain<string>()

  //     const a = chainy<number>((x, resolve) => {
  //       expect(x).toEqual('start')
  //       resolve(1)
  //     })

  //     const b = a<boolean>((x, resolve) => {
  //       expect(x).toEqual(1)
  //       resolve(true)
  //     })

  //     checkType<
  //       (
  //         arg: string,
  //         resultCb: (result: boolean) => void,
  //         errorCb: (error: unknown) => void,
  //       ) => void
  //     >(b.await)
  //     b.await(
  //       'start',
  //       (result) => {
  //         expect(result).toEqual(true)
  //         done(undefined)
  //       },
  //       doNotCall,
  //     )
  //   }))
  // it('basic3', () =>
  //   new Promise((done) => {
  //     const chainy = chain<string>()

  //     const a = chainy<number>((x, resolve) => {
  //       expect(x).toEqual('start')
  //       resolve.result(1)
  //     })

  //     const b = a<boolean>((x, resolve) => {
  //       expect(x).toEqual(1)
  //       resolve.result(true)
  //     })

  //     checkType<
  //       (
  //         arg: string,
  //         resultCb: (result: boolean) => void,
  //         errorCb: (error: unknown) => void,
  //       ) => void
  //     >(b.await)
  //     b.await(
  //       'start',
  //       (result) => {
  //         expect(result).toEqual(true)
  //         done(undefined)
  //       },
  //       doNotCall,
  //     )
  //   }))
  // it('basic4', () =>
  //   new Promise((done) => {
  //     const chainy = chain<string, string>()

  //     const a = chainy<number>((x, resolve) => {
  //       expect(x).toEqual('start')
  //       resolve.result(1)
  //     })

  //     const b = a<boolean, boolean>((x, resolve) => {
  //       expect(x).toEqual(1)
  //       resolve.error(true)
  //     })
  //     typesMatch<
  //       (
  //         arg: string,
  //         resultCb: (result: boolean) => void,
  //         errorCb: ErrorCb<string | boolean, boolean>,
  //       ) => AwaitedChainNode<void>,
  //       typeof b.await
  //     >(true)

  //     b.await('start', doNotCall, (error) => {
  //       expect(error).toEqual(true)
  //       done(undefined)
  //     })
  //   }))
  // it('basic5', () =>
  //   new Promise((done) => {
  //     const chainy = chain<string, string, string>()

  //     const { errorResolver, matches, createChainSegment } = autoResolvers()

  //     const b = createChainSegment(['start', 'a', 'b'], chainy)

  //     const c = b(errorResolver('b', 'c'))

  //     const c1 = c.onError(matches('c', done))

  //     const d = c1(doNotCall)

  //     d.await('start', doNotCall, doNotCall)
  //   }))
  // it('basic6', () =>
  //   new Promise((done) => {
  //     const { errorResolver, matches, createChainSegment } = autoResolvers()
  //     const chainy = chain<string, string, string>()

  //     const seg = createChainSegment(['start', 'a', 'b', 'c'], chainy)
  //     const c1 = seg.onError(doNotCall)

  //     const d = c1(errorResolver('c', 'd'))

  //     d.await('start', doNotCall, matches('d', done))
  //   }))

  // it('executes multiple times', () =>
  //   new Promise((done) => {
  //     const { createChainSegment2 } = autoResolvers()
  //     const chainy = chain<number, number, number>()

  //     const seg = createChainSegment2(3, chainy)

  //     seg.await(
  //       1,
  //       (x) => {
  //         expect(x).toEqual(4)
  //         seg.await(
  //           2,
  //           (y) => {
  //             expect(y).toEqual(5)
  //             done(undefined)
  //           },
  //           doNotCall,
  //         )
  //       },
  //       doNotCall,
  //     )
  //   }))

  // it('s', () =>
  //   new Promise((done) => {
  //     const { matches } = autoResolvers()
  //     const chainy = chain()
  //     const a = chainy<string>((x, resolve) => resolve(`a:${x}`)).s<string>((x) => `b:${x}`)(
  //       (x, resolve) => resolve(`c:${x}`),
  //     )
  //     a.await('1', matches('c:b:a:1'), doNotCall)
  //     a.await('2', matches('c:b:a:2', done), doNotCall)
  //   }))

  // it('splits onError throws', () =>
  //   new Promise((done) => {
  //     const { matches } = autoResolvers()
  //     const chainy = chain()
  //     const a = chainy<string, string>((x, resolve) => resolve.error(`a:${x}`))
  //     const x = a.onError(matches('a:1'))
  //     const y = a.onError((result) => {
  //       debugger
  //       expect(result).toEqual('a:2')
  //       done(undefined)
  //     })

  //     x.await('1', doNotCall, doNotCall)
  //     y.await('2', doNotCall, doNotCall)
  //   }))
  // it('duplicate onError throws', () =>
  //   new Promise((done) => {
  //     const { resultResolver, matches } = autoResolvers()
  //     const chainy = chain<string>()
  //     const a = chainy(resultResolver('a', 'b'))
  //     const b1 = a(resultResolver('b', 'b1'))
  //     const b2 = a(resultResolver('b', 'b2'))

  //     b1.await('a', matches('b1'), doNotCall)
  //     b2.await('a', matches('b2'), doNotCall)

  //     const c = b2(resultResolver('b2', 'c'))
  //     c.await('a', matches('c', done), doNotCall)
  //   }))
  // it('sequential onError', () =>
  //   new Promise((done) => {
  //     const chainy = chain<string, string>()
  //     const a = chainy((x, resolve) => resolve.error(`a:${x}`))
  //     const b = a.onError((result, resolver) => {
  //       expect(result).toEqual('a:1')
  //       resolver('b')
  //     })
  //     const c = b((x, resolve) => resolve(`c:${x}`))((x, resolve) => resolve.error(`c2:${x}`))
  //     const d = c.onError((result, resolver) => {
  //       expect(result).toEqual('c2:c:b')
  //       resolver('b')
  //     })

  //     d.await(
  //       '1',
  //       (result) => {
  //         expect(result).toEqual('b')
  //         done(undefined)
  //       },
  //       doNotCall,
  //     )
  //   }))
  // it('return types', () =>
  //   new Promise((done) => {
  //     const chainy = chain<string, never, 'a'>()
  //     const a = chainy<string, string, 'b'>((x, resolve) => {
  //       debugger
  //       const t = resolve(`a:${x}`) // 'b'
  //       typesMatch<'b', typeof t>(true)
  //       debugger
  //       console.log(t)
  //       return 'a'
  //     })
  //     const b = a<string, string, 'done'>((x, resolve) => {
  //       debugger
  //       const t = resolve(`b:${x}`) // 'done'
  //       typesMatch<'done', typeof t>(true)
  //       debugger
  //       console.log(t)
  //       return 'b'
  //     })

  //     const c = b.await(
  //       '1',
  //       (result) => {
  //         debugger
  //         // expect(result).toEqual('b')
  //         // done(undefined)
  //         return 'done'
  //       },
  //       doNotCall,
  //     )
  //     debugger
  //     typesMatch<AwaitedChainNode<'a' | 'b' | 'done'>, typeof c>(true)
  //     console.log(c) // 'a'
  //     done(undefined)
  //   }))
})

// const chain = asyncMapChain(getFile, splitFile, searchOnline, consolidateResults, formatResults)

// stream -> new stream -y-> new Conversation      -> process stream
//                      -n-> existing Conversation -> process stream
