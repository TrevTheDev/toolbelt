import { awaitCallbacksInParallel } from '.'

type BeforeRemovalCb<QueueItemType> = (queueItem: QueueItemType, done:()=>void)=>void

const queueWithAsyncRemoveAll = <QueueItem>() => {
  const queue : {[idx:string]: QueueItem} = {}
  let idx = 0
  const iFace = {
    add(item: QueueItem, index?: string|number): ()=>void {
      idx += 1
      const itemIdx = index || idx
      if (queue[itemIdx]) throw new Error(`an item with index: ${itemIdx} is already in the queue`)
      queue[itemIdx] = item
      return () => iFace.remove(itemIdx)
    },

    addItems(...items: [QueueItem, ...QueueItem[]]): (()=>void)[] {
      return items.map((item) => iFace.add(item))
    },

    remove: (index: string|number) => { delete queue[index] },
    get allItems() { return Object.values(queue) },
    get queue() { return queue },
    get length() { return Object.entries(queue).length },

    removeAll: (beforeRemovalCb: BeforeRemovalCb<QueueItem>) => {
      const doneCb = awaitCallbacksInParallel(
        Object.entries(queue).map(([key, item]) => (done) => {
          beforeRemovalCb(
            item,
            () => {
              iFace.remove(key)
              done()
            },
          )
        }),
      )
      return doneCb
    },
  }
  return iFace
}

export default queueWithAsyncRemoveAll
