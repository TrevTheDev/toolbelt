import type { RemoveReadOnlyFromArray, TupleToUnion, UnionToTuple } from './typescript utils'

type MergeInfiniteTuples<
  T extends unknown[],
  S extends unknown[],
  TT = T extends (infer I)[] ? I : never,
  SS = S extends (infer I)[] ? I : never,
  Res = (TT | SS)[],
> = Res

/**
 * Finds the set of all elements in the first array not
 * contained in the second array (i.e. non duplicated items).
 *
 * Note: typing is not battle tested and so unexpected edge cases may exist
 *
 * @param {Array} first The first list.
 * @param {Array} second The second list.
 * @return {Array} The elements in `first` that are not in `second`.
 * @example
 * const u1 = difference([1, 2, 3, 4] as const, [7, 6, 5, 4, 3] as const) //=> [1,2]
 * const u2 = difference([7, 6, 5, 4, 3] as const, [1, 2, 3, 4] as const); //=> [7,6,5]
 * const u3 = difference([7, 6, 5, 4, 3], [1, 2, 3, 4]) ; //=> [7,6,5] type: number[]
 */
export function difference<T extends unknown[], S extends unknown[]>(
  first: T,
  second: S,
): MergeInfiniteTuples<T, S>
export function difference<T extends unknown[], S extends readonly unknown[]>(
  first: T,
  second: S,
): MergeInfiniteTuples<T, TupleToUnion<RemoveReadOnlyFromArray<S>>[]>
export function difference<T extends readonly unknown[], S extends unknown[]>(
  first: T,
  second: S,
): MergeInfiniteTuples<TupleToUnion<RemoveReadOnlyFromArray<T>>[], S>
export function difference<T extends readonly unknown[], S extends readonly unknown[]>(
  first: T,
  second: S,
): Readonly<UnionToTuple<Exclude<T[number], S[number]>>>
export function difference(first, second) {
  return first.filter((value) => !second.includes(value))
}

/**
 * Given two arrays, intersection returns a set composed of the elements common to both arrays.
 *
 * Note: typing is not battle tested and so unexpected edge cases may exist
 *
 * @param {Array} first The first array.
 * @param {Array} second The second array.
 * @return {Array} The list of elements found in both `first` and `second`.
 * @example
 * const u1 = intersection([1, 2, 3, 4] as const, [7, 6, 5, 4, 3] as const) //=> [3,4]
 * const u2 = intersection([7, 6, 5, 4, 3] as const, [1, 2, 3, 4] as const) //=> [3,4]
 * const u3 = intersection([7, 6, 5, 4, 3] as const, [1, 2, 3, 4, 'a'] as const) //=> [3,4]
 * const u4 = intersection([7, 6, 5, 4, 3] as const, [1, 2, 3, 4]) //=> [3,4] type: number[]
 * const u5 = intersection([7, 6, 5, 4, 3] as const, [1, 2, 3, 4, 'a']) //=> [3,4] type: (string | number)[]
 * const u6 = intersection([7, 6, 5, 4, 3], [1, 2, 3, 4, 'a']) //=> [3,4] type: (string | number)[]
 */
export function intersection<T extends unknown[], S extends unknown[]>(
  first: T,
  second: S,
): MergeInfiniteTuples<T, S>
export function intersection<T extends readonly unknown[], S extends unknown[]>(
  first: T,
  second: S,
): MergeInfiniteTuples<TupleToUnion<RemoveReadOnlyFromArray<T>>[], S>
export function intersection<T extends unknown[], S extends readonly unknown[]>(
  first: T,
  second: S,
): MergeInfiniteTuples<T, TupleToUnion<RemoveReadOnlyFromArray<S>>[]>
export function intersection<T extends readonly unknown[], S extends readonly unknown[]>(
  first: T,
  second: S,
): UnionToTuple<Extract<T[number], S[number]>>
export function intersection(first, second) {
  const uniqueFirst = Array.from(new Set(first))
  return uniqueFirst.filter((value) => second.includes(value))
}
export default difference
