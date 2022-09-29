/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Lookup } from './typescript utils'

type Fn<InputType = any, ReturnedType = any, Res = (input: InputType) => ReturnedType> = Res

type ChainGenerics = {
  Input: unknown
  Output: unknown
}

type LinkedFn<
  F1 extends Fn,
  F2 extends Fn,
  Res extends Fn = (input: Parameters<F1>[0]) => Parameters<F2>[0],
> = Res

type FunctionChainArray<
  T extends [Fn, ...Fn[]],
  Tail1 extends Fn[] = T extends [any, ...infer R] ? R : never,
  Tail2 = [
    ...Tail1,
    T extends [...any, infer L extends Fn] ? (Input: ReturnType<L>) => never : never,
  ],
  Tail extends [Fn, ...Fn[]] = Tail2 extends [Fn, ...Fn[]] ? Tail2 : never,
> = {
  [K in keyof T]: LinkedFn<T[K], Lookup<Tail, K>>
}

type ComposedFn<Chain extends ChainGenerics, Res = (input: Chain['Input']) => Chain['Output']> = Res

type CalculatedCompositeFn<
  T extends [Fn, ...Fn[]],
  First extends Fn = T extends [infer F extends Fn, ...any] ? F : never,
  Last extends Fn = T extends [...any, infer F extends Fn] ? F : never,
  Res = ComposedFn<{
    Input: Parameters<First>[0]
    Output: ReturnType<Last>
  }>,
> = Res

/**
 * composes multiple functions, into a single function.  Equivalent to fn1(fn2(fn3('arg')))
 * each function must take the form `(input)=>output`
 * @param fnsToAdd
 * @returns
 */
const compose = <T extends [Fn, ...Fn[]]>(...fnsToAdd: T & FunctionChainArray<T>) => {
  const composedFn: CalculatedCompositeFn<FunctionChainArray<T>> = fnsToAdd.reduce(
    (previousFn, currentFn) => (input) => currentFn(previousFn(input)),
  )
  return composedFn //  { T: T; FChain: FunctionChainArray<T> }
}

export default compose
