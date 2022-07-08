/* eslint-disable @typescript-eslint/no-explicit-any */
import '../reverseForEach'

import { globalReverseForEach as reverseForEach } from '..'

// debugger

type CancelFn<Reasons> = (reason: Reasons) => void
type ResultFn<ResultTypes> = (result: ResultTypes) => void
type ErrorFn<ErrorTypes> = (error: ErrorTypes) => boolean | void

type AsyncMap<I, O, ErrorTypes, CancelTypes> = (
  input: I,
  result: ResultFn<O>, // report results to customer
  error?: ErrorFn<ErrorTypes>, // report errors to customer
) => CancelFn<CancelTypes> | void

type AsyncMapArray<I, O, ErrorTypes, CancelTypes> = AsyncMap<I, O, ErrorTypes, CancelTypes>[]

// const Fn = <Spec, ResultTypes, ErrorTypes, CancelReasons>(...asyncMapArray: AsyncMapArray<any, any, any, any>) => {
//   const completeMapArray = asyncMapArray

//   const iFace = {
//     andThen: (asyncMap: AsyncMap<any, any, any, any>) => {
//       completeMapArray.unshift(asyncMap)
//       return iFace
//     },
//     before: (asyncMap: AsyncMap<any, any, any, any>) => {
//       completeMapArray.push(asyncMap)
//       return iFace
//     },
//     await: (
//       spec: Spec,
//       result: ResultFn<ResultTypes>,
//       error: ErrorFn<ErrorTypes>,
//     ): CancelFn<CancelReasons> | undefined => {
//       const mapArray = [...completeMapArray]
//       let currentCancelFn: CancelFn<CancelReasons> | void
//       let state : 'init' | 'complete' | 'cancelled' = 'init'
//       const sendInputToNextMapFn = (input: any, remainingMapTypes: AsyncMapArray<any, any, any, any>) => {
//         const asyncMapFn = <AsyncMap<any, any, any, any>>remainingMapTypes.pop()
//         let mapResolved = false

//         const ifNotCancelledOrDone = (func: ()=>void) => {
//           mapResolved = true
//           if (state === 'init') func()
//         }
//         const onFinalResult = (res: ResultTypes) => ifNotCancelledOrDone(() => {
//           state = 'complete'
//           result(res)
//         })

//         const onResult = (output: any) => ifNotCancelledOrDone(() => sendInputToNextMapFn(output, remainingMapTypes))

//         const onError = (err: ErrorTypes) => ifNotCancelledOrDone(() => {
//           if (error(err)) { // if error function returns true, then propagate results [not sure about this!]
//             if (remainingMapTypes.length !== 0) sendInputToNextMapFn(err, remainingMapTypes)
//             else onFinalResult(<ResultTypes><unknown>err)
//           }
//         })

//         debugger
//         const mapCancelFn = asyncMapFn(input, remainingMapTypes.length === 0 ? onFinalResult : onResult, onError)
//         if (!mapResolved) currentCancelFn = mapCancelFn
//         debugger
//       }
//       sendInputToNextMapFn(spec, mapArray)
//       debugger
//       return state === 'init'
//         ? (reason) => {
//           state = 'cancelled'
//           if (currentCancelFn) currentCancelFn(reason)
//         } : undefined
//     },
//   }
//   return iFace
// }

const Fn = <Spec, ResultTypes, ErrorTypes, CancelReasons>(...asyncMapArray: AsyncMapArray<any, any, any, any>) => {
  const completeMapArray = asyncMapArray
  let state: 'init' | 'complete' | 'cancelled' | 'error' = 'init'
  let finalDone: ResultFn<ResultTypes>
  let priorChain = (result: ResultTypes) => {
    if (state === 'init') {
      state = 'complete'
      finalDone(result)
    }
  }
  let currentCancelFn: CancelFn<CancelReasons> | void
  let i = 0

  const addLink = (linkToAdd: AsyncMap<any, any, any, any>, finalError) => {
    const fn = priorChain
    priorChain = (result: ResultTypes) => {
      if (state === 'init') {
        const onError = (err: ErrorTypes) => {
          if (state === 'init') {
            if (finalError(err)) {
              // if error function returns true, then propagate results [not sure about this!]
              fn(<ResultTypes>(<unknown>err))
            } else state = 'error'
          }
        }
        i += 1
        const t = i
        const cancelFn = linkToAdd(result, fn, onError)
        if (i === t) currentCancelFn = cancelFn // only set if async function
      }
    }
  }

  const iFace = {
    andThen: (asyncMap: AsyncMap<any, any, any, any>) => {
      completeMapArray.unshift(asyncMap)
      return iFace
    },
    before: (asyncMap: AsyncMap<any, any, any, any>) => {
      completeMapArray.push(asyncMap)
      return iFace
    },
    await: (spec: Spec, result: ResultFn<ResultTypes>, error: ErrorFn<ErrorTypes>): CancelFn<CancelReasons> | undefined => {
      finalDone = result
      completeMapArray[reverseForEach]((link) => addLink(link, error))
      priorChain(<ResultTypes>(<unknown>spec))
      return state === 'init'
        ? (reason) => {
            state = 'cancelled'
            if (currentCancelFn) currentCancelFn(reason)
          }
        : undefined
    },
  }
  return iFace
}

let cancel

const aFn =
  (suffix, doCancel = false, throws = false, setTimeOut = 100, hasCancel = doCancel) =>
  (inputs, result, error) => {
    console.log(inputs)
    const func = () => {
      const r = `${inputs}:${suffix}`
      debugger
      if (doCancel) {
        if (!cancel) throw new Error('no cancel fn')
        cancel(r)
      }
      if (throws) error(r)
      result(r)
    }
    if (setTimeOut) setTimeout(func, setTimeOut)
    else func()
    return hasCancel ? (reason) => console.log(`Cancel Result: ${reason}`) : undefined
  }

const fn = Fn<string, string, string, string>(
  aFn('A', undefined, undefined, 0),
  aFn('B', undefined, undefined, undefined, true),
  aFn('C', undefined, true, undefined, true),
  aFn('D', undefined, undefined, undefined, true),
  aFn('E', undefined, true, undefined, true),
)

cancel = fn.await(
  'start',
  (a) => console.log(`Final Result: ${a}`),
  (e) => console.log(`Top Level Error Logged:${e}`),
)

debugger
console.log(cancel)
