/* eslint-disable @typescript-eslint/no-explicit-any */

type GroupOfFunctions<T extends (...args) => any> = (...args: Parameters<T>) => ReturnType<T>[]

type GroupOfObjects<T extends Record<string, unknown>> = {
  [Property in keyof T]: T[Property] extends (...args) => any ? GroupOfFunctions<T[Property]> : T[Property][]
}

type GroupObjectsOrFunctions<T extends ((...args) => any) | object> = T extends (...args) => any
  ? GroupOfFunctions<T>
  : T extends Record<string, unknown>
  ? GroupOfObjects<T>
  : never

/**
 * Allows the treating of multiple objects or functions as a single object or function.
 * Every object or function in the array must provide an equivalent interface which can the be called.
 *
 * E.g { { a: ()=>console.log('a') }, { a: ()=>console.log('b')} }
 * can then be called with groupObjectsOrFunctions.a() and both 'a' and 'b' will be logged
 *
 * @param objectsOrFunctions
 * @returns
 */
const groupObjectsOrFunctions = <T extends ((...args) => any) | object>(...objectsOrFunctions: T[]): GroupObjectsOrFunctions<T> => {
  // eslint-disable-next-line prefer-arrow-callback, func-names, @typescript-eslint/no-empty-function
  const base = (typeof objectsOrFunctions[0] === 'function' ? function () {} : {}) as GroupObjectsOrFunctions<T>
  return new Proxy(base, {
    apply(_target, thisArg, argumentsList) {
      return (objectsOrFunctions as ((...args) => any)[]).map((object) => {
        if (typeof object !== 'function') throw new Error(`one of the items in the array is not an executable function!`)
        return object.apply(thisArg, argumentsList)
      })
    },
    get(_target, property) {
      let isFunction = false
      const results = objectsOrFunctions.map((object) => {
        if (!(property in object)) throw new Error(`property '${String(property)}' does not exist on an object in the array!`)
        const result = object[property]
        if (typeof result === 'function') isFunction = true
        return result
      })
      return isFunction ? groupObjectsOrFunctions(...results) : results
    },
  })
}
export default groupObjectsOrFunctions
