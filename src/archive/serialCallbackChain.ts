/* eslint-disable no-confusing-arrow */
/* eslint-disable @typescript-eslint/no-explicit-any */
import '../reverseForEach'
import { globalReverseForEach as reverseForEach } from '..'
import type { AsyncMap, AsyncMapWithCancel, ResultCb, ErrorCb, CancelCb } from '../asyncMap'

type AsyncMapArray = (AsyncMap | AsyncMapWithCancel)[]

interface AwaitChainInSeries {
  andThen: (asyncMap: AsyncMap | AsyncMapWithCancel) => AwaitChainInSeries
  add: (asyncMap: AsyncMap | AsyncMapWithCancel) => AwaitChainInSeries
  before: (asyncMap: AsyncMap | AsyncMapWithCancel) => AwaitChainInSeries
  await: (input: unknown[], result: ResultCb, error?: ErrorCb) => CancelCb | undefined
}

const serialCallbackChain = (...asyncMapArray: AsyncMapArray): AwaitChainInSeries => {
  const completeMapArray = asyncMapArray
  let state: 'init' | 'complete' | 'cancelled' | 'error' = 'init'
  let finalDone: ResultCb
  let priorChain: ResultCb = (...resultArgs) => {
    if (state === 'init') {
      state = 'complete'
      finalDone(...resultArgs)
    }
  }
  let currentCancelFn: CancelCb | void
  let i = 0

  const addLink = (asyncMap: AsyncMap | AsyncMapWithCancel, finalError: ErrorCb | undefined) => {
    const fn = priorChain
    priorChain = (...result) => {
      debugger
      if (state === 'init') {
        const onError: ErrorCb = (...err) => {
          if (state === 'init') {
            state = 'error'
            if (finalError) finalError(...err)
          }
        }
        i += 1
        const t = i
        try {
          const cancelFn = asyncMap(result, fn, onError)
          if (i === t) currentCancelFn = cancelFn // only set if async function
        } catch (e) {
          debugger
          state = 'error'
          if (finalError) finalError(e) // note: can break type safety
          else throw e
        }
      }
    }
  }

  let iFace: AwaitChainInSeries

  const add = (asyncMap) => {
    completeMapArray.push(asyncMap)
    return iFace
  }

  iFace = {
    andThen: add,
    add,
    before: (asyncMap) => {
      completeMapArray.unshift(asyncMap)
      return iFace
    },
    await: (input, result, error?) => {
      finalDone = result
      completeMapArray[reverseForEach]((link) => addLink(link, error))
      priorChain(...input) // note: can break type safety

      const canFn = (...args) => {
        state = 'cancelled'
        if (currentCancelFn) currentCancelFn(...args)
      }
      return state === 'init' ? canFn : undefined
    },
  }
  return iFace
}

// const awaitChainInSeries = (chainLinks?: ((doneCb: () => void) => void)[]) => {
//   let finalDone: () => void
//   let priorChain = () => finalDone()
//   const aChain = {
//     addLink: (linkToAdd: (doneCb: () => void) => void) => {
//       const fn = priorChain
//       priorChain = () => linkToAdd(fn)
//     },
//     await: (doneCb: () => void) => {
//       finalDone = doneCb
//       priorChain()
//       aChain.await = () => {
//         throw new Error('already awaited')
//       }
//       aChain.addLink = () => {
//         throw new Error('already awaited')
//       }
//     },
//   }
//   if (chainLinks) chainLinks.forEach((link) => aChain.addLink(link))
//   return aChain
// }

export default serialCallbackChain
// type VsVoi = unknown extends never ? true:false
// type VsVoid<T> = T extends (()=>void) ? true:false
// type S1 = VsVoid<string> // boolean
// type S2 = VsVoid<number> // true
// type S3 = VsVoid<{}> // false
// type S4 = VsVoid<false> // false
// type S5 = VsVoid<any> // false
// type S6 = VsVoid<unknown> // false       // false
// type S7 = VsVoid<void> // never
// type S8 = VsVoid<undefined> // never
// type S9 = VsVoid<never> // never
// type S10 = VsVoid<any[]> // never
// type S11 = VsVoid<unknown[]> // never
// type S12 = VsVoid<[any]> // never
// type S13 = VsVoid<[unknown]> // never       // never
// type S14 = VsVoid<[never]> // never       // never
// type S15 = VsVoid<never[]> // never       // never
// type S16 = VsVoid<(()=>void)> // never       // never
