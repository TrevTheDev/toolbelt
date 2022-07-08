import callbacksInParallel from './asyncEffectsInParallel'

type BeforeRemovalCb<QueueItemType> = (queueItem: QueueItemType, done: () => void) => void

type IndexedQueueItem<QueueItem> = [index: string, queueItem: QueueItem]

type RemoveItemFn = () => void

type QueueDb<T> = { [idx: string]: T }

export type Queue<T> = {
  /**
   * adds an item and an optional `index` can be supplied, otherwise insertion order is used.
   * @returns `RemoveItemFn` a function that removes the item from the queue.
   */
  add(item: T, index?: string | number | undefined): RemoveItemFn //set
  /**
   * link to `add`
   */
  push(item: T): RemoveItemFn
  /**
   * adds an array of item to the queue.
   */
  addItems(...items: T[]): RemoveItemFn // new
  /**
   * removes item at `index`
   */
  remove: (index: string | number) => void // delete
  readonly allItems: T[]
  readonly queue: { [idx: string]: T }
  /**
   * current number of items in the queue
   */
  readonly length: number
  /**
   * count of the total number of items added to the queue
   */
  readonly countOfItemsAdded: number
  /**
   * array of items keys in item insertion order
   */
  readonly insertionOrderIndex: string[]
  /**
   * array of items keys in key order
   */
  readonly index: (keyof T)[]
  /**
   * returns an `array` of all items in the order in which they were inserted
   */
  readonly queueInInsertionOrder: IndexedQueueItem<T>[]

  readonly queueInIndexOrder: T[]

  readonly queueInIndexOrderWithKey: IndexedQueueItem<T>[]
  /**
   * returns queue as an array in index order
   */
  readonly asArrayInIndexOrder: T[]
  /**
   * Removes the first item from the queue and returns it
   */
  shift: () => T | undefined

  toString(): string

  [Symbol.iterator](): IterableIterator<IndexedQueueItem<T>>
}

const queue = <T>(...queueItems: T[]): Queue<T> => {
  const q: { [idx: string]: T } = {}
  const qIdx: { [idx: string]: number } = {}
  let cachedIndex
  let cachedInsertionOrder
  let idx = 0
  const iFace: Queue<T> = {
    add(item, index?) {
      const itemIdx = index === undefined ? idx : index
      if (itemIdx in q) throw new Error(`an item with index: ${itemIdx} is already in the queue`)
      q[itemIdx] = item
      qIdx[itemIdx] = idx
      idx += 1
      cachedIndex = undefined
      cachedInsertionOrder = undefined
      return () => iFace.remove(itemIdx)
    },

    push: (item) => iFace.add(item),

    addItems(...items: T[]) {
      const removeItemFns = items.map((item) => iFace.add(item))
      return () => removeItemFns.forEach((removeItemFn) => removeItemFn())
    },

    remove: (index: string | number) => {
      cachedIndex = undefined
      cachedInsertionOrder = undefined
      delete q[index]
      delete qIdx[index]
    },

    get allItems() {
      return Object.values(q)
    },

    get queue() {
      return q
    },

    get length() {
      return Object.entries(q).length
    },

    get insertionOrderIndex() {
      if (cachedInsertionOrder === undefined) cachedInsertionOrder = Object.keys(qIdx).sort()
      return cachedInsertionOrder
    },

    get index() {
      if (cachedIndex === undefined) cachedIndex = Object.keys(q).sort()
      return cachedIndex
    },

    get queueInInsertionOrder() {
      return iFace.insertionOrderIndex.map((key) => q[key])
    },

    get queueInIndexOrder() {
      return iFace.index.map((key) => q[key])
    },

    get asArrayInIndexOrder() {
      return iFace.index.map(([key]) => <T>q[key as string])
    },

    get countOfItemsAdded() {
      return idx
    },

    shift: () => {
      const arr = iFace.index
      if (arr.length === 0) return undefined
      const firstItemIdx: string = (arr as [string, ...string[]])[0]
      const firstItem = q[firstItemIdx] as T
      iFace.remove(firstItemIdx)
      return firstItem
    },

    toString() {
      return iFace.queueInIndexOrder.toString()
    },

    [Symbol.iterator]() {
      return iFace.queueInIndexOrder[Symbol.iterator]()
    },
  }
  iFace.addItems(...queueItems)
  return iFace
}

type AwaitRemoval = (removedCb: () => void) => void

export interface QueueWithAsyncRemoveAll<QueueItem> extends Queue<QueueItem> {
  removeAll: (beforeRemovalCb: BeforeRemovalCb<QueueItem>) => AwaitRemoval
}

function queueWithAsyncRemoveAll<QueueItem>(): QueueWithAsyncRemoveAll<QueueItem> {
  const q: Queue<QueueItem> = queue()
  Object.defineProperties(q, {
    removeAll: {
      value: (beforeRemovalCb: BeforeRemovalCb<QueueItem>, doneCb) => {
        // callbacksInParallel(
        //   Object.entries(queue).map(([key, item]) => (done) => {
        //     beforeRemovalCb(item, () => {
        //       q.remove(key)
        //       done()
        //     })
        //   }),
        //   doneCb,
        // )
      },
    },
  })
  return <QueueWithAsyncRemoveAll<QueueItem>>q
}

export { queue }
export default queueWithAsyncRemoveAll
