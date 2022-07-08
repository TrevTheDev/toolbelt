/* eslint-disable dot-notation */
import { describe, it, expect } from 'vitest'
import { enhancedMap } from '../src/smallUtils'

describe('queue', () => {
  it('is iterable', () => {
    // debugger
    const q = enhancedMap('a', 'b', 'c')
    // eslint-disable-next-line no-restricted-syntax
    for (const item of q) {
      // debugger
      console.log(item)
    }
    console.log(q.toString())
  })
})
