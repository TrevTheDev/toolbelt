const awaitCallbacksInParallel = (cbArray: ((doneCb: () => void) => void)[]) => {
  let finalDone: () => void
  let arrayLength: number
  let i = 0
  const addLink = (linkToAdd: (doneCb: () => void) => void) => {
    linkToAdd(() => {
      i += 1
      if (i === arrayLength) finalDone()
    })
  }
  return (doneCb: () => void) => {
    arrayLength = cbArray.length
    finalDone = doneCb
    cbArray.forEach((link) => addLink(link))
  }
}
export default awaitCallbacksInParallel
