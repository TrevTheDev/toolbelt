// type LMerge<T1, T2> = {
//   [k in keyof T1]: k extends keyof T2 ? T2[k] : T1[k]
// } extends infer O
//   ? { [K in keyof O]: O[K] }
//   : never

// type PossibleGenerics = {
//   Output?: unknown
//   Error?: unknown
//   ResultResolverController?: unknown
//   ErrorResolverController?: unknown
// }

// type Generics = Required<PossibleGenerics>

// type NodeItem<T extends Generics, Defaults extends Generics> = {
//   <
//     S extends PossibleGenerics = {},
//     NewDefaults extends PossibleGenerics = {},
//     UpdatedDefaults extends Generics = LMerge<Defaults, NewDefaults> extends Generics
//       ? LMerge<Defaults, NewDefaults>
//       : never,
//     Child extends Generics = LMerge<UpdatedDefaults, S> extends Generics,
//   >(): NodeItem<Child, UpdatedDefaults>
//   NodeItem: T
// }

// const example = {} as NodeItem<
//   {
//     Output: string
//     Error: string
//     ResultResolverController: string
//     ErrorResolverController: string
//   },
//   Generics
// >
// const exampleUsage1 = example<{ Output: number }, { Error: Error }>()
// const exampleUsage2 = exampleUsage1<{ Output: number }>()
