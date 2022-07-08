export const capitalise = (stringToCapitalise: string) => {
  if (stringToCapitalise.length < 1) throw new Error('')
  return stringToCapitalise.charAt(0).toUpperCase() + stringToCapitalise.slice(1)
}

export const createUid = (length = 20): string => Array.from({ length }, () => Math.random().toString(36)[2]).join('')

// returns a function that is only executed on the first call,
// irrespective of how many times it is called.
export function runFunctionOnlyOnce() {
  let called = false
  return (fn) => {
    if (called) return undefined
    called = true
    return fn()
  }
}

export function curriedRunFunctionOnlyOnce(errorMsgToThrow?: string) {
  let called = false
  return (fn: (...args: unknown[]) => unknown) =>
    (...args: unknown[]) => {
      if (called) {
        if (errorMsgToThrow) throw new Error(errorMsgToThrow)
        return undefined
      }
      called = true
      return fn(...args)
    }
}

type ObjectWithExecutableProperty<P extends string> = { [K in P]: (...args) => unknown }

const validObjects = ['object', 'function']
export const isObjectAndHasExecutableProperty = <P extends string>(object: unknown, property: P): object is ObjectWithExecutableProperty<P> => {
  if (object === null || !validObjects.includes(typeof object)) return false
  const descriptor = Object.getOwnPropertyDescriptor(object, property)
  if (descriptor === undefined) return false
  return typeof descriptor.get === 'function' || typeof descriptor.value === 'function'
}

export interface EnhancedMap<V> extends Omit<Map<number, V>, 'entries' | 'keys' | 'values' | 'set'> {
  /**
   * adds an item and an optional `key` can be supplied, otherwise insertion order is used.
   * @returns a function that removes the added item from the map.
   */
  add(value: V, key?: number): () => void
  /**
   * adds an array of item to the map.
   */
  addItems(...items: V[]): () => void
  /**
   *
   * @param basedOnInsertionOrder whether to shift based on insertion order, or key order
   * @returns V|undefined
   */
  shift(basedOnInsertionOrder?: boolean): V | undefined
  /**
   * count of the total number of items added to the queue
   */
  readonly countOfItemsAdded: number

  set(key: number, value: V): this
  readonly entries: IterableIterator<[number, V]>
  readonly keys: IterableIterator<number>
  readonly values: IterableIterator<V>
}

/**
 * adds a shift function the Map and by default autogenerates integer keys
 */
export const enhancedMap = <V>(...iterable: readonly V[]) => {
  const map = new Map<number, V>()
  let itemsAdded = 0
  const iFace: EnhancedMap<V> = {
    add: (item, key?) => {
      const idx = key || itemsAdded
      if (map.get(idx)) throw new Error(`item with key '${idx}' already exists in map`)
      map.set(idx, item)
      itemsAdded += 1
      return () => map.delete(idx)
    },

    addItems(...items) {
      const removeItemFns = items.map((item) => iFace.add(item))
      return () => removeItemFns.forEach((removeItemFn) => removeItemFn())
    },

    shift(basedOnInsertionOrder = true) {
      const [firstKey] = basedOnInsertionOrder ? map.keys() : [...map.keys()].sort()
      if (firstKey === undefined) return undefined
      const result = map.get(firstKey)
      map.delete(firstKey)
      return result
    },

    set: (...args) => {
      map.set(...args)
      return iFace
    },

    get countOfItemsAdded() {
      return itemsAdded
    },

    clear: (...args) => map.clear(...args),
    delete: (...args) => map.delete(...args),
    forEach: (...args) => map.forEach(...args),
    get: (...args) => map.get(...args),
    has: (...args) => map.has(...args),
    [Symbol.iterator]: () => map[Symbol.iterator](),
    get [Symbol.toStringTag]() {
      return 'EnhancedMap'
    },
    get entries() {
      return map.entries()
    },
    get keys() {
      return map.keys()
    },
    get values() {
      return map.values()
    },
    get size() {
      return map.size
    },
  }
  if (iterable) iterable.forEach((item) => iFace.add(item))
  return iFace
}
