/* eslint @typescript-eslint/no-explicit-any: off */
type FinalDoneCb = (results: any[]) => void
type DoneCb = (result: any) => void

const awaitCallbacksInParallel = (cbArray: DoneCb[]) => {
  let finalDone: FinalDoneCb
  let arrayLength: number
  let i = 0
  const results: unknown[] = []
  const addCallback = (CallbackToAdd: (doneCb: DoneCb) => void) => {
    CallbackToAdd((result?: unknown) => {
      results.push(result)
      i += 1
      if (i === arrayLength) finalDone(results)
    })
  }
  return (doneCb: FinalDoneCb) => {
    arrayLength = cbArray.length
    finalDone = doneCb
    cbArray.forEach((callback) => addCallback(callback))
  }
}
export default awaitCallbacksInParallel
