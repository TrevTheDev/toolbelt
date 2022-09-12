/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * extracts the call signatures from a type
 * Gotcha: doesn't yet work for no parameter call signatures and only 4 overloads
 * @example
 * type J = JustSignatures<{(a: string): void, a: number}> // {(a: string): void}
 */
export type JustSignatures<T> = T extends {
  (...args: infer A1): infer R1
  (...args: infer A2): infer R2
  (...args: infer A3): infer R3
  (...args: infer A4): infer R4
}
  ? { (...args: A1): R1; (...args: A2): R2; (...args: A3): R3; (...args: A4): R4 }
  : T extends {
      (...args: infer A1): infer R1
      (...args: infer A2): infer R2
      (...args: infer A3): infer R3
    }
  ? { (...args: A1): R1; (...args: A2): R2; (...args: A3): R3 }
  : T extends { (...args: infer A1): infer R1; (...args: infer A2): infer R2 }
  ? { (...args: A1): R1; (...args: A2): R2 }
  : T extends { (...args: infer A1): infer R1 }
  ? { (...args: A1): R1 }
  : void

/**
 * merges T1 with T2.  Kinda like `&` but without the `&`.
 * Gotcha: doesn't merge call signatures or constructors
 * @example
 * type U = Union<{a: number}, {b: string}>     // {a: number, b: string}
 * type U = Union<{ a: number }, { a: string }> // {a: string}
 */
export type Union<T1, T2> = {
  [k in keyof T2 | keyof T1]: k extends keyof T2 ? T2[k] : k extends keyof T1 ? T1[k] : never
} extends infer O
  ? { [K in keyof O]: O[K] }
  : never
/**
 * Overwrites any properties in T1, that are also in T2
 * @example
 * type U = LMerge<{ a: number }, { b: string }> // {a: number}
 * type U = LMerge<{ a: number; c: boolean }, { a: string; b: number }> // {a: string, c:boolean}
 */
export type LMerge<T1, T2> = {
  [k in keyof T1]: k extends keyof T2 ? T2[k] : T1[k]
} extends infer O
  ? { [K in keyof O]: O[K] }
  : never

/**
 * Renames a property in a type object.
 * @example
 * type U = RenameProperty<{ a: number; c?: boolean; d?: string }, 'c', 'b'> // { a: number,  b?: boolean, d?: string }
 */
export type RenameProperty<T, K extends keyof T, N extends string> = {
  [P in keyof T as P extends K ? N : P]: T[P]
} extends infer O
  ? { [Key in keyof O]: O[Key] }
  : never
/* Omit<T, K> & {
  [P in N]: T[K]
} extends infer O
  ? { [Key in keyof O]: O[Key] }
  : never */

/**
 * Omits call signature from a type
 * @example
 * type O = OmitCallSignature<{(): void, a: number}> // {a: number}
 */
export type OmitCallSignature<T> = { [K in keyof T]: T[K] } & (T extends new (
  ...args: infer R
) => infer S
  ? new (...args: R) => S
  : unknown)

/**
 * Omits constructor from a type
 * @example
 * type O = OmitConstructorSignature<{new (): void, a: number}> // {a: number}
 */
export type OmitConstructorSignature<T> = { [K in keyof T]: T[K] } & (T extends (
  ...args: infer R
) => infer S
  ? (...args: R) => S
  : unknown)

/**
 * Looks up T[K] and if not found returns Else
 * @example
 * type L = Lookup<{a: string, b: number}, 'a'> // string
 */
export type Lookup<T, K extends keyof any, Else = never> = K extends keyof T ? T[K] : Else

/**
 * Tests if T is strictly `any` else returns never
 */
export type IsStrictAny<T> = 0 extends 1 & T ? T : never

type IsNotStrictAny<T> = T extends IsStrictAny<T> ? never : T
type IsVoid<T> = T extends void ? T : never

/**
 * Tests if T is strictly `void`
 */
export type IsStrictVoid<T> = IsVoid<T> & IsNotStrictAny<T>

/**
 * Tests if T is strictly `never` return true or false
 */
export type IsStrictNever<T> = [T] extends [never] ? true : false

/**
 * Tests if T is a tuple vs array
 */
export type IsNotTuple<T> = T extends Array<any> ? (number extends T['length'] ? T : never) : never

/**
 * Tests if T is strictly `unknown` else returns never
 */
export type IsStrictUnknown<T> = T extends IsStrictAny<T> ? never : unknown extends T ? T : never

/**
 * Tests if T is strictly `any[]` else returns never
 */
export type IsStrictAnyArray<T> = T extends IsNotTuple<T>
  ? T extends Array<infer U>
    ? U extends IsStrictAny<U>
      ? T
      : never
    : never
  : never

/**
 * Tests if T is strictly `unknown[]` else returns never
 */
export type IsStrictUnknownArray<T> = T extends IsNotTuple<T>
  ? T extends Array<infer U>
    ? T extends IsStrictUnknown<U>
      ? T extends IsStrictAny<T>
        ? never
        : T
      : never
    : never
  : never

/**
 * Adds Tail to the end of Array
 * @example
 * type P = Push<[1, 2, 3], 4> // [1, 2, 3, 4]
 */
export type Push<Array extends unknown[], Tail> = [...Array, Tail]

/**
 * Adds Head to the start of the Array
 * @example
 * type U = Unshift<[1, 2, 3], 0> // [0, 1, 2, 3]
 */
export type Unshift<Array extends unknown[], Head> = [Head, ...Array]

/**
 * Returns the last item from the array
 * @example
 * type L = Last<[1, 2, 3]> // 3
 */
export type Last<Array extends unknown[]> = Array extends [...unknown[], infer L] ? L : never

/**
 * Returns the index of the last item in an array
 * @example
 * type L = LastIndex<[1, 2, 3]> // 2
 */
export type LastIndex<Arr extends unknown[]> = Arr extends [any, ...infer Rest]
  ? Rest['length']
  : never

/**
 * @example
 * type T = Tail<[1, 2, 3]> // [2, 3]
 */
export type Tail<L extends unknown[]> = L extends [any, ...infer LTail] ? LTail : never

/**
 * @example
 * type T = Head<[1, 2, 3]> // 1
 */
export type Head<L extends unknown[]> = L extends [infer H, ...any] ? H : never

/**
 * @example
 * type P = Permutation<1 | 2 | 3>
 * // [1, 2, 3] | [1, 3, 2] | [2, 1, 3] | [2, 3, 1] | [3, 1, 2] | [3, 2, 1]
 * type P = Permutation<"a" | string> // [string] - gotcha
 */
export type Permutation<U, T = U> = [U] extends [never]
  ? []
  : T extends unknown
  ? [T, ...Permutation<Exclude<U, T>>]
  : never

/**
 * @example
 * type C = UnionCount<'a' | 'b' | 'c'>    // 3
 * type C = UnionCount<'a' | 'b' | string> // 1 - gotcha
 */
export type UnionCount<U> = Permutation<U>['length']

/**
 * @example
 * type C = KeyCount<{ x: 1, y: 2 }> // 2
 */
export type KeyCount<T> = UnionCount<keyof T>

/**
 * removes generic array properties from an array such as '.length' - returning only
 * the array elements
 * @example
 * type T = CleanArray<[ x: string, y: number ]> // { 0: string; 1: number;}
 */
export type CleanArray<T extends any[]> = Omit<T, keyof any[]>

/**
 * converts a tuple of type [string, any][] to an object
 * Yuck!  Why not able to use tuple names?
 * @example
 * type T = TupleToObject<["foo", string] | ["bar", boolean] >  //{ foo: string; bar: boolean; }
 */
export type TupleToObject<T extends [string, any]> = { [key in T[0]]: Extract<T, [key, any]>[1] }

/**
 * concatenates a tuple of tuples
 * @example
 * type T = ConcatTupleOfTuples<[[a: string, c: number], [c: `STRING`], [e: `BLOWER`]]>  // [a: string, c: number, c: "STRING", e: "BLOWER"]
 */
export type ConcatTupleOfTuples<
  Tuple extends unknown[],
  _ConcatedTuple extends unknown[] = [],
  _H extends unknown[] = Head<Tuple> extends unknown[] ? Head<Tuple> : never,
  _T extends unknown[] = Tail<Tuple>,
  _N extends unknown[] = [..._ConcatedTuple, ..._H],
> = _T extends [any, ...any] ? ConcatTupleOfTuples<_T, _N> : _N

type UnionToIntersection<U> = (U extends any ? (arg0: U) => void : never) extends (
  arg0: infer I,
) => void
  ? I
  : never

/**
 * test if type is a union - A|B|C
 * @example
 * type U = IsUnion<'a'|'b'|'c'>   // 'a'|'b'|'c'
 * type U = IsUnion<true | false>  // boolean - gotcha
 * type U = IsUnion<boolean>       // boolean - gotcha
 * type U = IsUnion<true>          // never
 * type U = IsUnion<'a'|string>    // never - gotcha
 */
export type IsUnion<T> = [T] extends [UnionToIntersection<T>] ? never : T

type Equals<X, Y> = (<T>() => T extends X ? 1 : 2) extends <T>() => T extends Y ? 1 : 2
  ? true
  : false

/**
 * compares two tuples, returning a tuple of 1s or 0s for matched elements
 * Gotcha: first tuple must be longest
 * @example
 * type T = TupleElementComparison<[1, 2, 3], [1, 2, 3]> // [1,1,1]
 * type T = TupleElementComparison<[1, 0, 3], [1, 2, 3]> // [1,0,1]
 * type T = TupleElementComparison<[], [1, 2, 3]> // []
 */
export type TupleElementComparison<T1 extends readonly unknown[], T2 extends readonly unknown[]> = {
  [K in keyof T1]: Equals<T1[K], T2[K & keyof T2]> extends true ? 1 : 0
}

type TupleToUnionBase<T extends readonly unknown[]> = T extends [infer First, ...infer Rest]
  ? First | TupleToUnionBase<Rest>
  : never

/**
 * Converts a tuple of types into a union of types
 * @example
 * type T = TupleToUnion< [a: string, b: number, c: void]> // string | number | void
 * type T = TupleToUnion< [a: string, b: number, c: any]> // any
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

type LastOf<T> = UnionToIntersection<T extends any ? () => T : never> extends () => infer R
  ? R
  : never

/**
 * Converts a union of types to a tuple - do not do this!
 * @example
 * type U = UnionToTuple<true | 1 | "a">  // [true, 1, "a"]
 * type U = UnionToTuple<true | "a" | 1 > // [true, 1, "a"]
 * type U = UnionToTuple<"a" | string>    // [string] - gotcha
 * type U = UnionToTuple<boolean>         // [false, true] - gotcha
 */
export type UnionToTuple<T, L = LastOf<T>, N = [T] extends [never] ? true : false> = true extends N
  ? []
  : Push<UnionToTuple<Exclude<T, L>>, L>

/**
 * Whether two function? types are equal -don't understand this
 * @example
 * type E = StrictEqual<string, string> // true
 * type E = StrictEqual<string, number> // false
 * type E = StrictEqual<string, any>    // false
 * type E = StrictEqual<string, any>    // false
 * type E = StrictEqual<{ a: unknown} & { a:string }, { a: string }> // false ????
 */
// export type StrictEqual<A1, A2> = (<A>() => A extends A2 ? true : false) extends <
//   A,
// >() => A extends A1 ? true : false
//   ? true
//   : false

/**
 * Assert than can both narrow and broaden - it requires reassignment to work.
 * const a:'a' = 'a'
 * const b = assert<string>(a) // type string
 * similar to doing:
 * const b = a as string
 * @param toBeAsserted variable to be assert
 * @returns toBeAsserted as type T
 */
export function assert<T>(toBeAsserted: any) {
  return toBeAsserted as unknown as T
}

/**
 * Assert than can narrow without reassignment:
 * const foo:'a'|'b' = 'a'
 * narrowingAssert<'a'>(foo) // foo's type is 'a' going forward
 * @param toBeAsserted variable to be assert
 * @returns toBeAsserted as type T
 */
export function narrowingAssert<T>(toBeAsserted: any): asserts toBeAsserted is T {
  return undefined
}

// type a = IsStrictAnyArray<[]>
// type b = IsStrictUnknownArray<unknown[]>
// type c = IsStrictUnknownArray<any>
// type c2 = IsStrictUnknownArray<any[]>
// type d = IsStrictUnknownArray<never>
// type e = IsStrictUnknownArray<void>
// type f = IsStrictUnknownArray<void[]>
// type g = IsStrictUnknownArray<(() => unknown)[]>
// type h = IsStrictUnknownArray<[unknown]>

// type IsAnyArray1 = unknown extends any[] ? true : false // false
// type IsAnyArray2 = any extends any[] ? true : false // boolean

// type za = IsStrictAnyArray<unknown>
// type zb = IsStrictAnyArray<unknown[]>
// type zc = IsStrictAnyArray<any>
// type zc2 = IsStrictAnyArray<any[]>
// type zc21 = IsStrictAnyArray<[any]>
// type zd = IsStrictAnyArray<never>
// type ze = IsStrictAnyArray<void>
// type zf = IsStrictAnyArray<void[]>
// type zg = IsStrictAnyArray<(() => unknown)[]>
// type zh = IsStrictAnyArray<[unknown]>

// type zzzz = unknown extends string ? true : false // true
// type zzzz1 = unknown extends unknown ? true : false // true
// type zzzz2 = any extends unknown ? true : false // true
// type zzzz3 = any extends string ? true : false // true

export type IsFinite<Tuple extends any[], Finite, Infinite> = {
  empty: Finite
  nonEmpty: ((..._: Tuple) => any) extends (_: any, ..._1: infer Rest) => any
    ? IsFinite<Rest, Finite, Infinite>
    : never
  infinite: Infinite
}[Tuple extends []
  ? 'empty'
  : Tuple extends (infer Element)[]
  ? Element[] extends Tuple
    ? 'infinite'
    : 'nonEmpty'
  : never]

export type Prepend<Tuple extends any[], NewHead extends any[]> = [
  ...newHead: NewHead,
  ...tail: Tuple,
]

export type Reverse<Tuple extends any[], Prefix extends any[] = []> = {
  empty: Prefix
  nonEmpty: Tuple extends [infer First, ...infer Next]
    ? Reverse<Next, Prepend<Prefix, [First]>>
    : never
  infinite: {
    ERROR: 'Cannot reverse an infinite tuple'
    CODENAME: 'InfiniteTuple'
  }
}[Tuple extends [any, ...any[]] ? IsFinite<Tuple, 'nonEmpty', 'infinite'> : 'empty']

export type Concat<Left extends any[], Right extends any[]> = {
  emptyLeft: Right
  singleLeft: Left extends [unknown] ? Prepend<Right, Left> : never
  multiLeft: Reverse<Left> extends [infer LeftLast, ...infer ReversedLeftRest]
    ? Concat<Reverse<ReversedLeftRest>, Prepend<Right, [LeftLast]>>
    : never
  infiniteLeft: {
    ERROR: 'Left is not finite'
    CODENAME: 'InfiniteLeft' & 'Infinite'
  }
}[Left extends []
  ? 'emptyLeft'
  : Left extends [any]
  ? 'singleLeft'
  : IsFinite<Left, 'multiLeft', 'infiniteLeft'>]

export type ConcatTuple<Tuple1 extends unknown[], Tuple2 extends unknown[]> = [...Tuple1, ...Tuple2]

// type CC = ConcatTuple<[a: string, c: number], [c: `STING`]>
