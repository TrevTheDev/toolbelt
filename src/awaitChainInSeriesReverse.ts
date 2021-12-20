import reverseForEach from './reverseForEach'

if (!('reverseForEach' in Array.prototype)) {
  // eslint-disable-next-line no-extend-native
  Array.prototype.reverseForEach = reverseForEach
}

const awaitChainInSeriesReverse = (chainLinks: ((doneCb: () => void) => void)[]) => {
  let finalDone: () => void
  let priorChain = () => finalDone()
  const addLink = (linkToAdd: (doneCb: () => void) => void) => {
    const fn = priorChain
    priorChain = () => linkToAdd(fn)
  }
  return (doneCb: () => void) => {
    finalDone = doneCb
    chainLinks.reverseForEach((link) => addLink(link))
    priorChain()
  }
}
export default awaitChainInSeriesReverse
