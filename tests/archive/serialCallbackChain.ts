// import { expect } from 'chai'

import { expect } from 'chai'
import { ResultCb, serialCallbackChain } from '../../src/index'
import type { AsyncMap, CancelCb } from '../../src/index'

describe('await serialCallbackChain', () => {
  let cancel
  const genFunc = (
    suffix: string,
    expectFn: undefined | ((...args) => void) = undefined,
    setTimeOut = 100,
    cancelFn: undefined | CancelCb = undefined,
    throws = false,
    doneFn: undefined | ((cancelReason: string) => void) | ((cancelReason: string, doDone?: ((reason: string) => void) | undefined) => void) = undefined,
    unexpectedThrows = false,
  ): AsyncMap => {
    function fn(inputs, resultFn, errorFn?) {
      if (expectFn) expectFn(...inputs)
      console.log(inputs)
      const func = () => {
        const r = `${inputs}:${suffix}`
        // debugger
        if (cancelFn) {
          if (!cancel) throw new Error('no cancel fn')
          cancel(r, doneFn)
        }
        if (throws && errorFn) errorFn(r)
        if (unexpectedThrows) throw new Error(r)
        resultFn(r)
      }
      if (setTimeOut) setTimeout(func, setTimeOut)
      else func()
      return cancelFn
    }
    return fn
  }

  it('serialCallbackChain', (done) => {
    const chain = serialCallbackChain(
      genFunc(
        'A',
        (res) => {
          expect(res).to.equal('start')
        },
        0,
      ), // sync
      genFunc('B', (res) => {
        expect(res).to.equal('start:A')
      }),
      genFunc('C', (res) => {
        expect(res).to.equal('start:A:B')
      }),
      genFunc('D', (res) => {
        expect(res).to.equal('start:A:B:C')
      }),
      genFunc('E', (res) => {
        expect(res).to.equal('start:A:B:C:D')
      }),
    )
    debugger
    chain.await(['start'], (chainResult: string) => {
      console.log(`Final Result: ${chainResult}`)
      expect(chainResult).to.equal('start:A:B:C:D:E')
      done()
    })
  })
  it('awaitChainInSeries andThen', (done) => {
    const chain = serialCallbackChain()
    chain.add(genFunc('A')).andThen(genFunc('B')).andThen(genFunc('C'))

    chain.await(['start'], (chainResult: string) => {
      console.log(`Final Result: ${chainResult}`)
      expect(chainResult).to.equal('start:A:B:C')
      done()
    })
  })
  it('awaitChainInSeries before', (done) => {
    const chain = serialCallbackChain()
    chain.add(genFunc('A')).before(genFunc('B')).before(genFunc('C'))

    chain.await(['start'], (chainResult: string) => {
      console.log(`Final Result: ${chainResult}`)
      expect(chainResult).to.equal('start:C:B:A')
      done()
    })
  })
  it('throws', (done) => {
    const chain = serialCallbackChain(
      genFunc('A', undefined, 0), // sync
      genFunc('B'),
      genFunc('C', undefined, 0), // sync
      genFunc('D', undefined, undefined, undefined, true),
      genFunc('E'),
    )

    chain.await(
      ['start'],
      (chainResult: string) => {
        console.log(`Final Result: ${chainResult}`)
        expect(true).to.equal(false)
      },
      (error: string) => {
        console.log(`Final Error: ${error}`)
        expect(error).to.equal('start:A:B:C:D')
        done()
      },
    )
  })

  it('unexpected throws in sync code', (done) => {
    /* eslint-disable */
    const chain = serialCallbackChain(
      genFunc('A', undefined, 0), // sync
      genFunc('B'),
      genFunc('C', undefined, 0), // sync
      genFunc('D', undefined, 0, undefined, undefined, undefined, true),
      genFunc('E'),
    )
    /* eslint-enable */
    chain.await(
      ['start'],
      (chainResult: string) => {
        console.log(`Final Result: ${chainResult}`)
        expect(true).to.equal(false)
      },
      (error: string | Error) => {
        debugger
        if (error instanceof Error) {
          console.log(`Final Error: ${error}`)
          expect(error.constructor.name).to.equal('Error')
          expect(error.message).to.equal('start:A:B:C:D')
          done()
        }
      },
    )
  })

  it('can cancel', (done) => {
    const chain = serialCallbackChain(
      genFunc('A', undefined, 0), // sync
      genFunc('B'),
      genFunc('C', undefined, 0), // sync
      genFunc('D', undefined, undefined, (cancelReason) => {
        console.log(`Cancel Result: ${cancelReason}`)
        expect(cancelReason).to.equal('start:A:B:C:D')
        done()
      }),
      genFunc('E'),
    )

    cancel = chain.await(
      ['start'],
      (chainResult: string) => {
        console.log(`Final Result: ${chainResult}`)
        expect(true).to.equal(false)
      },
      (error: string) => {
        console.log(`Final Error: ${error}`)
        expect(true).to.equal(false)
      },
    )
  })
  it('can cancel with done', (done) => {
    const chain = serialCallbackChain(
      genFunc('A', undefined, 0), // sync
      genFunc('B'),
      genFunc('C', undefined, 0), // sync
      genFunc(
        'D',
        undefined,
        undefined,
        (cancelReason: string, doDone?: (reason: string) => void) => {
          console.log(`Cancel Result: ${cancelReason}`)
          expect(cancelReason).to.equal('start:A:B:C:D')
          if (doDone) doDone(cancelReason)
        },
        undefined,
        (cancelReason) => {
          debugger
          console.log(`Cancel Done: ${cancelReason}`)
          done()
        },
      ),
      genFunc('E'),
    )

    cancel = chain.await(
      ['start'],
      (chainResult: string) => {
        console.log(`Final Result: ${chainResult}`)
        expect(true).to.equal(false)
      },
      (error: string) => {
        console.log(`Final Error: ${error}`)
        expect(true).to.equal(false)
      },
    )
  })
  it('type safety work around', () => {
    const f = ([i]: [number], result: (arg0: number) => void) => {
      result(i * i)
    }
    const chain = serialCallbackChain(
      ([spec], result: ResultCb) => result(parseInt(spec as string, 10)),
      ([i], result) => result(i, i),
      ([x, y], result) => {
        result((x as number) + (y as number))
      },
      f as AsyncMap,
      (([i]: [number], result: (arg0: number) => void) => {
        result(i * i)
      }) as AsyncMap,
    )

    cancel = chain.await(['1'], (chainResult) => {
      debugger
      console.log(`Final Result: ${chainResult}`)
      expect(chainResult).to.equal(16)
    })
  })
})
