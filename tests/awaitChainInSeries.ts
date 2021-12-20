// import { expect } from 'chai'

import { awaitChainInSeries } from '../src/index'

describe('awaitChainInSeries', () => {
  it('awaitChainInSeries', (done) => {
    const itemFn = (string: string, doneCb: () => void) => () => {
      console.log(string)
      doneCb()
    }

    const x = awaitChainInSeries([
      (doneCb: () => void) => itemFn('x a', doneCb)(),
      (doneCb: () => void) => setTimeout(itemFn('x b', doneCb), 100),
      (doneCb: () => void) => setTimeout(itemFn('x c', doneCb), 200),
      (doneCb: () => void) => setTimeout(itemFn('x d', doneCb), 100),
      (doneCb: () => void) => itemFn('x e', doneCb)(),
    ])
    x.await(() => {
      console.log('x done!')
      done()
    })

    // const y = awaitChainInSeriesReverse([
    //   (doneCb: ()=>void) => { console.log("y a");doneCb() },
    //   (doneCb: ()=>void) => { setTimeout(()=>{ console.log("y b");doneCb() },100) },
    //   (doneCb: ()=>void) => { setTimeout(()=>{ console.log("y c");doneCb() },200) },
    //   (doneCb: ()=>void) => { setTimeout(()=>{ console.log("y d");doneCb() },100) },
    //   (doneCb: ()=>void) => { console.log("y e");doneCb() },
    // ])
    // y(()=>console.log('y done!'))
    //
    //
    // const z = awaitCbInParallelArray([
    //   (doneCb: ()=>void) => { console.log("z a");doneCb() },
    //   (doneCb: ()=>void) => { setTimeout(()=>{ console.log("z b");doneCb() },100) },
    //   (doneCb: ()=>void) => { setTimeout(()=>{ console.log("z c");doneCb() },200) },
    //   (doneCb: ()=>void) => { setTimeout(()=>{ console.log("z d");doneCb() },100) },
    //   (doneCb: ()=>void) => { console.log("z e");doneCb() },
    // ])
    // z(()=>console.log('z done!'))
  })
  it('awaitChainInSeries2', (done) => {
    const x = awaitChainInSeries()
    x.addLink((doneCb: () => void) => {
      console.log('x a')
      setTimeout(doneCb, 100)
    })
    x.addLink((doneCb: () => void) => {
      console.log('x b')
      setTimeout(doneCb, 300)
    })
    x.addLink((doneCb: () => void) => {
      console.log('x c')
      setTimeout(doneCb, 100)
    })

    x.await(() => {
      console.log('done!')
      done()
    })
  })
})
