import { describe, it, expect } from 'vitest'
import { compose } from '../src/index'

const chainNode =
  <I, O>(expectedInput: I, Output: O) =>
  (input: I) => {
    expect(input).toEqual(expectedInput)
    return Output
  }

describe('compose', () => {
  it.only('example', () => {
    const fn = compose(
      (a: string) => `${a}:A`,
      (a: string) => `${a}:B`,
    )
    console.log(fn('start'))
  })
  it('basic usage', () => {
    const y1 = compose(
      chainNode('start' as const, 'Ra' as const),
      chainNode('Ra' as const, 'Rb' as const),
      chainNode('Rb' as const, 'Rc' as const),
      chainNode('Rc' as const, 'Rd' as const),
      chainNode('Rd' as const, 'done' as const),
    )
    expect(y1('start' as const)).toEqual('done')

    const y2 = compose(chainNode('start' as const, 'done' as const))
    expect(y2('start' as const)).toEqual('done')

    const x = chainNode('b' as const, 'done2' as const)
    const y3 = compose(y1, chainNode<'done', 'a'>('done', 'a'), chainNode<'a', 'b'>('a', 'b'), x)
    expect(y3('start' as const)).toEqual('done2')
  })
})
