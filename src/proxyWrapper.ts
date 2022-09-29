import type { LMerge, Union } from './typescript utils'

type OuterFn<
  T extends (...args) => any,
  OutputTransformer extends (arg: ReturnType<T>) => any,
  RV = (...args: Parameters<T>) => ReturnType<OutputTransformer>,
> = RV

type Z = OuterFn<(a: string, b: number) => string, (a: string) => string>

type Transform<T, S> = T extends (...args) => any
  ? S extends (arg: ReturnType<T>) => any
    ? OuterFn<T, S>
    : never
  : never

export type OuterMerge<
  T1 extends object,
  T2 extends object,
  R = {
    [k in keyof T1]: k extends keyof T2 ? Transform<T1[k], T2[k]> : T1[k]
  },
  N = { [k in Exclude<keyof T2, keyof T1>]: T2[k] },
> = Union<R, N>

export type ValidateMerge<
  T1 extends object,
  T2 extends object,
  R = {
    [k in keyof T2]: k extends keyof T1
      ? [Transform<T1[k], T2[k]>] extends [never]
        ? never
        : T2[k]
      : T2[k]
  },
> = R

type ZZ = ValidateMerge<
  {
    a(input: 'a'): string
    b(input: 'b'): 'b'
    c(input: 'c'): 'c'
    e: number
  },
  {
    a(input: string): 'a'
    c(input: number): string
    d(input: 'd'): 'd'
    e(input: number): 'e'
    f: 'f'
  }
>

const proxyWrapper = <
  T1 extends object,
  T2 extends ValidateMerge<T1, T2>,
  T3 extends ValidateMerge<OuterMerge<T1, T2>, T3>,
>(
  originalObject: T2,
  inputTransformers: T1,
  outputTransformers: T3,
) => {
  const x = {}
  console.log(x)
  return new Proxy(originalObject, {
    get(target, prop) {
      if (prop in inputTransformers || prop in outputTransformers) {
        debugger
        return (...args) => {
          debugger
          const fn =
            prop in inputTransformers
              ? (...args2) => inputTransformers[prop](target[prop], ...args2)
              : target[prop]
          const results = fn(...args)
          return prop in outputTransformers ? outputTransformers[prop](results) : results
        }
      }
      return target[prop]
    },
  }) as OuterMerge<OuterMerge<T1, T2>, T3>
}

const x = proxyWrapper(
  {
    a(input: number) {
      return input
    },
    b(input: string) {
      return input
    },
    c(input: 'c') {
      return input
    },
    d: 1,
  },
  {
    a(supr, input) {
      return supr(input + 1)
    },
    b(supr, input) {
      return supr(`b:${input}`)
    },
  },
  {
    a(input) {
      return input * 2
    },
    c(input) {
      return `c:${input}`
    },
  },
)
console.log(x.a(1), x.b(1), x.c(1), x.d)
