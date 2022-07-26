/* eslint-disable @typescript-eslint/no-explicit-any */
// merges type T1 with type T2
export type Union<T1, T2> = {
  [k in keyof T1 | keyof T2]: k extends keyof T1 ? T1[k] : k extends keyof T2 ? T2[k] : never
}
// Looks up T[K]
export type Lookup<T, K extends keyof any, Else = never> = K extends keyof T ? T[K] : Else
// tests if a type is `any` if not return `never`
export type IsStrictAny<T> = 0 extends 1 & T ? T : never

type IsNotStrictAny<T> = T extends IsStrictAny<T> ? never : T
type IsVoid<T> = T extends void ? T : never
export type IsStrictVoid<T> = IsVoid<T> & IsNotStrictAny<T>
export type IsStrictNever<T> = [T] extends [never] ? true : false

export type IsNotTuple<T> = T extends Array<any> ? (number extends T['length'] ? T : never) : never

export type IsStrictUnknown<T> = T extends IsStrictAny<T> ? never : unknown extends T ? T : never
export type IsStrictAnyArray<T> = T extends IsNotTuple<T>
  ? T extends Array<infer U>
    ? U extends IsStrictAny<U>
      ? T
      : never
    : never
  : never
export type IsStrictUnknownArray<T> = T extends IsNotTuple<T>
  ? T extends Array<infer U>
    ? T extends IsStrictUnknown<U>
      ? T extends IsStrictAny<T>
        ? never
        : T
      : never
    : never
  : never

export type Push<Array extends unknown[], Tail> = [...Array, Tail]
export type Unshift<Array extends unknown[], Head> = [Head, ...Array]
export type Last<Array extends unknown[]> = Array extends [...unknown[], infer L] ? L : never
export type LastIndex<Arr extends unknown[]> = Arr extends [any, ...infer Rest]
  ? Rest['length']
  : never
export type Tail<L extends unknown[]> = L extends [any, ...infer LTail] ? LTail : never

// type TupleToObject<T extends any[]> = { [K in keyof T as Exclude<K, keyof any[]>]: T[K] }
export type TupleToObject<T extends any[]> = Omit<T, keyof any[]>

type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (k: infer I) => void
  ? I
  : never
/**
 * test is a type is a union e.g. A|B
 * type Foo = IsUnion<true | false> // true
 * type Bar = IsUnion<true>         // false
 */
export type IsUnion<T> = [T] extends [UnionToIntersection<T>] ? never : T

type Equals<X, Y> = (<T>() => T extends X ? 1 : 2) extends <T>() => T extends Y ? 1 : 2
  ? true
  : false
export type TupleElementComparison<T1 extends readonly unknown[], T2 extends readonly unknown[]> = {
  [K in keyof T1]: Equals<T1[K], T2[K & keyof T2]> extends true ? 1 : 0
}

type TupleToUnionBase<T extends readonly unknown[]> = T extends [infer First, ...infer Rest]
  ? First | TupleToUnionBase<Rest>
  : never

/**
 * Converts a tuple of types into a union of types
 */
export type TupleToUnion<T extends readonly unknown[]> = T extends [
  infer First,
  infer Second,
  infer Third,
  infer Fourth,
  infer Fifth,
  ...infer Rest,
]
  ? First | Second | Third | Fourth | Fifth | TupleToUnion<Rest>
  : TupleToUnionBase<T>

type a = IsStrictAnyArray<[]>
type b = IsStrictUnknownArray<unknown[]>
type c = IsStrictUnknownArray<any>
type c2 = IsStrictUnknownArray<any[]>
type d = IsStrictUnknownArray<never>
type e = IsStrictUnknownArray<void>
type f = IsStrictUnknownArray<void[]>
type g = IsStrictUnknownArray<(() => unknown)[]>
type h = IsStrictUnknownArray<[unknown]>

type IsAnyArray1 = unknown extends any[] ? true : false // false
type IsAnyArray2 = any extends any[] ? true : false // boolean

type za = IsStrictAnyArray<unknown>
type zb = IsStrictAnyArray<unknown[]>
type zc = IsStrictAnyArray<any>
type zc2 = IsStrictAnyArray<any[]>
type zc21 = IsStrictAnyArray<[any]>
type zd = IsStrictAnyArray<never>
type ze = IsStrictAnyArray<void>
type zf = IsStrictAnyArray<void[]>
type zg = IsStrictAnyArray<(() => unknown)[]>
type zh = IsStrictAnyArray<[unknown]>

type zzzz = unknown extends string ? true : false // true
type zzzz1 = unknown extends unknown ? true : false // true
type zzzz2 = any extends unknown ? true : false // true
type zzzz3 = any extends string ? true : false // true
