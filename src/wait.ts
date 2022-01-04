/* eslint-disable @typescript-eslint/no-explicit-any */
type FulfilledCallback<T> = (result: T) => void
// eslint-disable-next-line no-use-before-define
type RejectedCallback = (reason: any) => void

type WaitableCallback = (fulfilledCallback: FulfilledCallback<any>, rejectedCallback?: RejectedCallback)=>void

// const GENSYNC_START = Symbol.for('gensync:v1:start')

const wait = (waitableCallback: WaitableCallback) => {
//   let done = false
  function* waitCallback() {
    debugger
    const pms = new Promise(waitableCallback)
    debugger
    yield pms
  }
  //   let finalValue
  //   const assertStart = (value: any) => {
  //     if (value === GENSYNC_START) return
  //     throw new Error('error')
  //   }
  const gen = waitCallback()
  debugger
  gen.next().then((result))
  debugger
  const next2 = gen.next()
  return next2
}
export default wait
