import { describe, it, expect } from 'vitest'

import groupObjectsOrFunctions from '../src/groupObjectsOrFunctions'

describe('proxyObjectGroup', () => {
  it('groups multiple functions', () => {
    function z(x) {
      return 5 * x
    }
    const p = groupObjectsOrFunctions(
      (x: number) => x,
      (x: number) => 2 * x,
      (x: number) => 3 * x,
      // eslint-disable-next-line prefer-arrow-callback, func-names
      function (x: number) {
        return 4 * x
      },
      z,
    )
    expect(p(1).toString()).toEqual([1, 2, 3, 4, 5].toString())
  })
  it('groups multiple object properties', () => {
    const p = groupObjectsOrFunctions({ a: '1' }, { a: '2' }, { a: '3' })
    expect(p.a.toString()).toEqual(['1', '2', '3'].toString())
  })
  it('groups multiple object functions', () => {
    const p = groupObjectsOrFunctions(
      { a: (value: string) => `1${value}` },
      { a: (value: string) => `2${value}` },
      { a: (value: string) => `3${value}` },
      // {},
    )
    expect(p.a('A').toString()).toEqual(['1A', '2A', '3A'].toString())
  })
})
