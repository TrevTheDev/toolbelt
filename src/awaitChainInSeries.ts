const awaitChainInSeries = (chainLinks?: ((doneCb: () => void) => void)[]) => {
  let finalDone: () => void
  let priorChain = () => finalDone()
  const aChain = {
    addLink: (linkToAdd: (doneCb: () => void) => void) => {
      const fn = priorChain
      priorChain = () => linkToAdd(fn)
    },
    await: (doneCb: () => void) => {
      finalDone = doneCb
      priorChain()
      aChain.await = () => {
        throw new Error('already awaited')
      }
      aChain.addLink = () => {
        throw new Error('already awaited')
      }
    },
  }
  if (chainLinks) chainLinks.forEach((link) => aChain.addLink(link))
  return aChain
}

export default awaitChainInSeries
