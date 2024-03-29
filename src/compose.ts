/* eslint-disable no-shadow */
/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Lookup } from './typescript utils'

export type Fn<InputType = any, ReturnedType = any, Res = (input: InputType) => ReturnedType> = Res

// type LinkedFn<F1 extends Fn, F2 extends Fn> = (input: Parameters<F1>[0]) => Parameters<F2>[0]
type LinkedFn<
  F1 extends Fn,
  F2 extends Fn,
  RT = (input: ReturnType<F1>) => ReturnType<F2>,
> = RT extends Fn ? RT : never

export type FunctionChainArray<
  T extends [Fn, ...Fn[]],
  Input = any,
  First extends Fn = T extends [infer F extends Fn, ...any] ? F : never,
  ModdedT extends Fn[] = [(Input: Input) => Parameters<First>[0], ...T],
  Res = { [K in keyof T]: LinkedFn<Lookup<ModdedT, K>, T[K]> },
  RT extends [Fn, ...Fn[]] = Res extends [...infer A extends [Fn, ...Fn[]]] ? A : never, // hack
> = RT

export type CalculatedCompositeFn<
  T extends [Fn, ...Fn[]],
  First extends Fn = T extends [infer F extends Fn, ...any] ? F : never,
  Last extends Fn = T extends [...any, infer F extends Fn] ? F : never,
  Res extends Fn = Fn<Parameters<First>[0], ReturnType<Last>>,
> = Res

/**
 * composes multiple functions, into a single function.  Equivalent to (arg)=>fn3(fn2(fn1(arg)))
 * each function must take the form `(input:T)=>output`
 * @param functionsToCompose - array of functions, with linked inputs and outputs
 * @returns a function that accepts the first function in the array's input, and returns the last function
 *  in the array's output
 */
// function compose<>(...functionsToCompose: [Fn, ...Fn[]])
function compose<I, T extends [Fn, ...Fn[]]>(
  ...functionsToCompose: T & FunctionChainArray<T, I>
): CalculatedCompositeFn<FunctionChainArray<T, I>>
function compose<T extends [Fn, ...Fn[]]>(
  ...functionsToCompose: T & FunctionChainArray<T>
): CalculatedCompositeFn<FunctionChainArray<T>>
function compose<S>(...functionsToCompose: [Fn<S, S>, ...Fn<S, S>[]]): <T extends S>(input: T) => T
function compose(...functionsToCompose) {
  const composedFn = functionsToCompose.reduce(
    (previousFn, currentFn) => (input) => currentFn(previousFn(input)),
  )
  return composedFn
}

/**
 * Pipes input into a pipeline of functions.
 *
 * @param input
 * @param functionsToCompose
 * @returns
 */
export function pipe<A>(a: A): A
export function pipe<A, B>(a: A, ab: (a: A) => B): B
export function pipe<A, B, C>(a: A, ab: (a: A) => B, bc: (b: B) => C): C
export function pipe<A, B, C, D>(a: A, ab: (a: A) => B, bc: (b: B) => C, cd: (c: C) => D): D
export function pipe<A, B, C, D, E>(
  a: A,
  ab: (a: A) => B,
  bc: (b: B) => C,
  cd: (c: C) => D,
  de: (d: D) => E,
): E
export function pipe<A, B, C, D, E, F>(
  a: A,
  ab: (a: A) => B,
  bc: (b: B) => C,
  cd: (c: C) => D,
  de: (d: D) => E,
  ef: (e: E) => F,
): F
export function pipe(input, ...functionsToCompose) {
  return functionsToCompose.length > 0
    ? compose(...(functionsToCompose as unknown as [Fn, ...Fn[]]))(input)
    : input
}

export default compose
