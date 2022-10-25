/* eslint-disable @typescript-eslint/ban-types */
import difference, { intersection } from './difference'
import { isFunction } from './smallUtils'
import type { Fn, Union, UnknownObject } from './typescript utils'

export const composedObjectsSuper = Symbol('super')
// type Super = typeof composedObjectsSuper

// debugger

// type ObjectComposeOptions = {
//   chainObjects: boolean
//   spreadReturnValues: boolean
//   attachSuper: boolean
//   useNewThis: boolean
// }

// const defaultObjectComposeOptions = {
//   chainObjects: false,
//   spreadReturnValues: false,
//   attachSuper: true,
//   useNewThis: true,
// } as const

// type DefaultObjectComposeOptions = typeof defaultObjectComposeOptions

// type ComposedFn<
//   T1 extends Fn,
//   T2 extends Fn,
//   Linked extends boolean = Parameters<T2> extends [ReturnType<T1>]
//     ? true
//     : [ReturnType<T1>] extends [void]
//     ? true
//     : false,
//   RV extends Fn = Linked extends true
//     ? (...args: Parameters<T1>) => ReturnType<T2>
//     : (...args: never) => never,
// > = RV

// type CaseCompose<T1, T2> = T1 extends Fn ? (T2 extends Fn ? ComposedFn<T1, T2> : never) : T2

// type ObjectUnion<
//   TTop extends UnknownObject,
//   TBottom extends UnknownObject,
//   R extends UnknownObject = {
//     [K in keyof TBottom | keyof TTop]: {
//       both: CaseCompose<TTop[K], TBottom[K]>
//       topOnly: TTop[K]
//       bottomOnly: TBottom[K]
//     }[K extends keyof TTop
//       ? K extends keyof TBottom
//         ? 'both'
//         : 'topOnly'
//       : K extends keyof TBottom
//       ? 'bottomOnly'
//       : never]
//   },
// > = R

// type ObjectCompose<
//   TTop extends UnknownObject,
//   TBottom extends UnknownObject,
//   AttachSuper extends Boolean,
//   Res extends UnknownObject = ObjectUnion<TTop, TBottom>,
// > = AttachSuper extends true ? Union<Res, { [composedObjectsSuper]: Super }> : Res

// type Z = ObjectCompose<
//   {
//     a(arg: 'a'): 'ra'
//     b(arg: 'b'): 'rb'
//     d(arg: 'd'): 'rd'
//     e(a1: 'eA1', a2: 'eA2'): ['rE1', 'rE2']
//     a1: 'a1'
//     b1: 'b1'
//     f(arg: 'a'): void
//   },
//   {
//     a(arg: 'ra'): 'ra2'
//     c(arg: 'c2'): 'rc2'
//     d(arg: 'd2'): 'rd2'
//     e(a: ['rE1', 'rE2']): 're2'
//     a1: 'a2'
//     a2: 'a2'
//     c2: 'c2'
//     f(arg: 'a'): void
//   },
//   false
// >

// export function objectCompose<TBottom extends UnknownObject, TTop extends UnknownObject>(
//   topObject: TTop,
//   bottomObject: TBottom,
//   //   manualSuper: boolean = false,
// ): ObjectCompose<TTop, TBottom, DefaultObjectComposeOptions['attachSuper']>
// export function objectCompose<
//   TBottom extends UnknownObject,
//   TTop extends UnknownObject,
//   O extends Partial<ObjectComposeOptions> = {},
//   F extends ObjectComposeOptions = Extends<
//     LMerge<DefaultObjectComposeOptions, O>,
//     ObjectComposeOptions
//   >,
// >(
//   topObject: TTop,
//   bottomObject: TBottom,
//   options: O,
// ): ObjectCompose<TTop, TBottom, F['attachSuper']>
// export function objectCompose<
//   TTop extends UnknownObject,
//   TBottom extends UnknownObject,
//   O extends Partial<ObjectComposeOptions> = {},
//   F extends ObjectComposeOptions = Extends<
//     LMerge<DefaultObjectComposeOptions, O>,
//     ObjectComposeOptions
//   >,
// >(topObject: TTop, bottomObject: TBottom, options?: O) {
//   const o = (options ?? {}) as O
//   const opt = { ...defaultObjectComposeOptions, ...o } as unknown as F
//   const bKeys = Object.keys(bottomObject) as (keyof TBottom)[]
//   const mKeys = Object.keys(topObject) as (keyof TTop)[]
//   const sharedKeys = intersection(bKeys, mKeys) as unknown as (keyof TBottom & keyof TTop)[]
//   const bOnly = difference(bKeys, mKeys) as (keyof TBottom)[]
//   const mOnly = difference(mKeys, bKeys) as (keyof TTop)[]
//   const obj = (opt.attachSuper ? { [composedObjectsSuper]: bottomObject } : {}) as any
//   const topObjectThis = opt.useNewThis ? obj : topObject
//   sharedKeys.forEach((key: AnyKey) => {
//     if (isFunction(topObject, key)) {
//       if (!isFunction(bottomObject, key)) throw new Error('not implemented')
//       const bottomFn = bottomObject[key] as Fn
//       const topFn = topObject[key] as Fn
//       if (opt.chainObjects) {
//         obj[key] = opt.spreadReturnValues
//           ? (...args: unknown[]) => bottomFn.apply(bottomObject, topFn.apply(topObjectThis, args))
//           : (...args: unknown[]) => bottomFn.apply(bottomObject, [topFn.apply(topObjectThis, args)])
//       } else obj[key] = topObject[key]
//     } else obj[key] = topObject[key]
//   })
//   const wrapFn = (key: AnyKey, objectToWrap: UnknownObject, thisToUse: UnknownObject) => {
//     obj[key] = isFunction(objectToWrap, key)
//       ? (...args: unknown[]) => (objectToWrap[key] as Fn).apply(thisToUse, args)
//       : objectToWrap[key]
//   }
//   bOnly.forEach((key) => wrapFn(key, bottomObject, bottomObject))
//   mOnly.forEach((key) => wrapFn(key, topObject, topObjectThis))
//   return obj as ObjectCompose<TBottom, TTop, F['attachSuper']> // FO Extend<B, M, FO['prefixHasFullControl']>
// }

type ManualShadowObjectUnion<
  TTop extends UnknownObject,
  TBottom extends UnknownObject,
  R extends UnknownObject = Union<TBottom, TTop>,
  R2 extends UnknownObject = Union<R, { [composedObjectsSuper]: TBottom }>,
> = R2 extends infer O ? { [K in keyof O]: O[K] } : never

export function addOnTop<TTop extends UnknownObject, TBottom extends UnknownObject>(
  topMixin: TTop,
  bottomObject: TBottom,
) {
  const cObject = {} as ManualShadowObjectUnion<TTop, TBottom>

  const bKeys = Object.keys(bottomObject)
  const mKeys = Object.keys(topMixin)
  const sharedKeys = intersection(bKeys, mKeys)
  const bOnly = difference(bKeys, mKeys)
  const tOnly = difference(mKeys, bKeys)

  cObject[composedObjectsSuper] = bottomObject

  sharedKeys.forEach((key) => {
    cObject[key] = topMixin[key]
  })

  tOnly.forEach((key) => {
    cObject[key] = topMixin[key]
  })

  bOnly.forEach((key) => {
    cObject[key] = isFunction(bottomObject, key)
      ? (...args: unknown[]) => (bottomObject[key] as Fn).apply(bottomObject, args)
      : bottomObject[key]
  })
  return cObject
}

const test2 = addOnTop(
  {} as {
    a(arg: 'a'): 'ra'
    b(arg: 'b'): 'rb'
    d(arg: 'd'): 'rd'
    e(a1: 'eA1', a2: 'eA2'): ['rE1', 'rE2']
    a1: 'a1'
    b1: 'b1'
    f(arg: 'a'): void
  },
  {} as {
    a(arg: 'ra'): 'ra2'
    c(arg: 'c2'): 'rc2'
    d(arg: 'd2'): 'rd2'
    e(a: ['rE1', 'rE2']): 're2'
    a1: 'a2'
    a2: 'a2'
    c2: 'c2'
    f(arg: 'a'): void
  },
)

type AutoComposedFn<
  T1 extends Fn,
  T2 extends Fn,
  Linked extends boolean = Parameters<T2> extends [ReturnType<T1>]
    ? true
    : [ReturnType<T1>] extends [void]
    ? true
    : false,
  RV extends Fn = Linked extends true
    ? (...args: Parameters<T1>) => ReturnType<T2>
    : (...typesDoNotAlign: never) => never,
> = RV

type AutoShadowCompose<T1, T2> = T1 extends Fn
  ? T2 extends Fn
    ? AutoComposedFn<T1, T2>
    : never
  : T2

type AutoShadowObjectUnion<
  TTop extends UnknownObject,
  TBottom extends UnknownObject,
  R extends UnknownObject = {
    [K in keyof TBottom | keyof TTop]: {
      both: AutoShadowCompose<TTop[K], TBottom[K]>
      topOnly: TTop[K]
      bottomOnly: TBottom[K]
    }[K extends keyof TTop
      ? K extends keyof TBottom
        ? 'both'
        : 'topOnly'
      : K extends keyof TBottom
      ? 'bottomOnly'
      : never]
  },
> = R extends infer O ? { [K in keyof O]: O[K] } : never

// type ValidBottom<TTop, TBottom> = [Exclude<keyof TBottom, keyof TTop>] extends [never]
//   ? TBottom
//   : never

// type VB = ValidBottom<
//   { a: string; b: (b: 'b') => void; c: (c: 'c') => 'c' },
//   { a: string; b: (b: 'b') => void; c: (c: 'c') => 'c' }
// >

export function addUnder<TTop extends UnknownObject, TBottom extends UnknownObject>(
  topObject: TTop,
  bottomMixin: TBottom,
) {
  // type RO = N extends [never] ? {} : N

  type FinalObject = AutoShadowObjectUnion<TTop, TBottom>
  const cObject = {} as FinalObject

  const bKeys = Object.keys(bottomMixin)
  const mKeys = Object.keys(topObject)
  const sharedKeys = intersection(bKeys, mKeys)
  // const bOnly = difference(bKeys, mKeys) as Keys[]
  const tOnly = difference(mKeys, bKeys)

  sharedKeys.forEach((key) => {
    if (!isFunction(bottomMixin, key) || !isFunction(topObject, key)) throw new Error('not a func')
    const bottomFn = bottomMixin[key] as Fn
    const topFn = topObject[key] as Fn
    cObject[key] = (...args: unknown[]) => bottomFn.call(bottomMixin, topFn.apply(topObject, args))
  })

  tOnly.forEach((key) => {
    cObject[key] = topObject[key]
  })

  // bOnly.forEach((key) => {
  //   cObject[key] = isFunction(bottomMixin, key)
  //     ? (...args: unknown[]) => (bottomMixin[key] as Fn).apply(cObject, args)
  //     : bottomMixin[key]
  // })
  return cObject
}

// const test = addUnder(
//   {} as {
//     a(arg: 'a'): 'ra'
//     b(arg: 'b'): 'rb'
//     d(arg: 'd'): 'rd'
//     e(a1: 'eA1', a2: 'eA2'): ['rE1', 'rE2']
//     a1: 'a1'
//     b1: 'b1'
//     f(arg: 'a'): void
//   },
//   {} as {
//     a(arg: 'ra'): 'ra2'
//     c(arg: 'c2'): 'rc2'
//     d(arg: 'd2'): 'rd2'
//     e(a: ['rE1', 'rE2']): 're2'
//     a1: 'a2'
//     a2: 'a2'
//     c2: 'c2'
//     f(arg: 'a'): void
//   },
// )

// type Base = {
//   a(a: string): string
//   shared(v: string): void
//   preA?: string
// }

// const baseA: Base = {
//   a(a: string) {
//     console.log(this.preA)
//     debugger
//     this.preA = 'b'
//     return `source:${a}`
//   },
//   shared(v: string) {
//     console.log(v)
//   },
// }

// const x = objectCompose(baseA, {
//   a(a: string) {
//     debugger
//     this.preA = 'a'
//     this.shared('hello')
//     return `pre:${a}`
//   },
// } as Base)
// debugger
// const y = x.a('test')
// console.log(y)
// console.log(`pre: ${x.preA}`)

// const x1 = objectCompose(
//   {
//     a(a: 'a') {
//       return `source1:${a}` as 'aR'
//     },
//   },
//   {
//     a(base: any, a: string) {
//       return base.a(`pre1:${a}`)
//     },
//   },
//   { prefixHasFullControl: true },
// )
// debugger
// const y1 = x1.a('test1')
// console.log(y1)

// type Obj<S extends UnknownObject> = S
