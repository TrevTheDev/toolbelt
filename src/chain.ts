/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable prefer-arrow-callback */
/* eslint-disable no-use-before-define */
/* eslint-disable @typescript-eslint/ban-types */
import { IsStrictAny, LMerge, Lookup, Union } from './typescript utils'

export const chainNodeType = Symbol('Chain Node')

type ResultCb<
  Result = any,
  ResultCbController = unknown,
  RT = (result: Result) => ResultCbController,
> = RT

type ErrorCb<
  Error = any,
  ErrorCbController = unknown,
  RT = (error: Error) => ErrorCbController,
> = RT

export type AwaitedChainController<AccumulatedAsyncFnController> = {
  controller: AccumulatedAsyncFnController | undefined
}

type ChainNodeGenerics = {
  Output: unknown
  Error: unknown
  ResultResolverController: unknown
}

// type ChainNodePossibleGenerics = Partial<ChainNodeGenerics>

// type ChainNodeGenericsWithInputOutput = Union<
//   Omit<ChainNodeGenerics, 'Output'>,
//   { InputOutput: unknown }
// >

// type NeverChainNodeGenerics = {
//   [k in keyof ChainNodeGenerics]: never
// }

// type NeverChainNodeGenericsWithInputOutput = {
//   [k in keyof ChainNodeGenericsWithInputOutput]: never
// }

type ChainGenerics = {
  Input: unknown
  ErrorResolverController: unknown
  // AccumulatedOutputs: unknown
  AccumulatedErrors: unknown
  AccumulatedResultResolverControllers: unknown
  // Defaults: ChainNodeGenerics
  LastNode: ChainNodeGenerics
}

export type Resolver<ResultFn extends ResultCb, ErrorFn extends ErrorCb = never> = [
  ErrorFn,
] extends [never]
  ? {
      (result: Parameters<ResultFn>[0]): ReturnType<ResultFn>
      result: ResultFn
    }
  : {
      (result: Parameters<ResultFn>[0]): ReturnType<ResultFn>
      result: ResultFn
      error: ErrorFn
    }

// export type ResolverBase<Output, ResultResolverController, Error, ErrorResolverController> =
//   Resolver<ResultCb<Output, ResultResolverController>, ErrorCb<Error, ErrorResolverController>>

// type ResolverWrapped<
//   Chain extends ChainGenerics,
//   RT = Resolver<
//     ResultCb<Chain['LastNode']['Output'], Chain['LastNode']['ResultResolverController']>,
//     ErrorCb<Chain['LastNode']['Error'], Chain['ErrorResolverController']>
//   >,
// > = RT

// export type AsyncFn2<Input, ResultCallback extends ResultCb, ErrorCallback extends ErrorCb, R> = (
//   input: Input,
//   resolver: Resolver<ResultCallback, ErrorCallback>,
// ) => R

type AsyncFn<PreviousChain extends ChainGenerics, Chain extends ChainGenerics> = [
  Chain['ErrorResolverController'],
] extends [never]
  ? (
      input: PreviousChain['LastNode']['Output'],
      resolver: Resolver<
        ResultCb<Chain['LastNode']['Output'], Chain['LastNode']['ResultResolverController']>
      >,
    ) => PreviousChain['LastNode']['ResultResolverController']
  : (
      input: PreviousChain['LastNode']['Output'],
      resolver: Resolver<
        ResultCb<Chain['LastNode']['Output'], Chain['LastNode']['ResultResolverController']>,
        ErrorCb<Chain['LastNode']['Error'], Chain['ErrorResolverController']>
      >,
    ) => PreviousChain['LastNode']['ResultResolverController']

type ChainNodeResultCb<
  Node extends {
    Output: unknown
    ResultResolverController: unknown
  },
> = ResultCb<Node['Output'], Node['ResultResolverController']>

type ChainNodeErrorCb<Chain extends ChainGenerics> = ErrorCb<
  Chain['LastNode']['Error'],
  Chain['ErrorResolverController']
>

type AccumulatedErrorCb<Chain extends ChainGenerics> = ErrorCb<
  Chain['AccumulatedErrors'],
  Chain['ErrorResolverController']
>

type ResultCall<Chain extends ChainGenerics> = {
  /* ****************************************************************************************************** */
  <
    T extends [ValidAsyncFn, ...ValidAsyncFn[]],
    ValidT extends {
      LastChain: ChainGenerics
      AsyncFns: [ValidAsyncFn, ...ValidAsyncFn[]]
    } = AsyncFunctionChainArray<T, Chain>,
  >(
    ...asyncFunctions: T & ValidT['AsyncFns']
  ): ChainNode<ValidT['LastChain']>

  /* ****************************************************************************************************** */
  // <
  //   NodeTypes extends ChainNodePossibleGenerics = {},
  //   UpdateDefaults extends ChainNodePossibleGenerics = {},
  //   UpdatedDefaults extends ChainNodeGenerics = LMerge<
  //     Chain['Defaults'],
  //     UpdateDefaults
  //   > extends ChainNodeGenerics
  //     ? LMerge<Chain['Defaults'], UpdateDefaults>
  //     : never,
  //   Child extends ChainNodeGenerics = LMerge<UpdatedDefaults, NodeTypes> extends ChainNodeGenerics
  //     ? LMerge<UpdatedDefaults, NodeTypes>
  //     : never,
  //   UpdatedChain extends ChainGenerics = {
  //     Input: Chain['Input']
  //     ResultResolverController: Child['ResultResolverController']
  //     ErrorResolverController: Chain['ErrorResolverController']
  //     AccumulatedErrors: Chain['AccumulatedErrors'] | Child['Error']
  //     AccumulatedOutputs: Chain['AccumulatedOutputs'] | Child['Output']
  //     AccumulatedResultResolverControllers:
  //       | Chain['AccumulatedResultResolverControllers']
  //       | Child['ResultResolverController']
  //     Defaults: UpdatedDefaults
  //     LastNode: Child
  //   },
  // >(
  //   ...arg: Async extends true
  //     ? [asyncFunction: AsyncFn<Chain, UpdatedChain>]
  //     : [syncFunction: (input: Chain['LastNode']['Output']) => Child['Output']]
  // ): ChainNode<UpdatedChain>

  // /* ****************************************************************************************************** */

  // <
  //   ResultResolver extends ResultCb,
  //   ErrorResolver extends ErrorCb,
  //   Output = Parameters<ResultResolver>[0],
  //   ResultResolverController = ReturnType<ResultResolver>,
  //   Error = Parameters<ErrorResolver>[0],
  //   ErrorResolverController = ReturnType<ErrorResolver>,
  //   Child extends ChainNodeGenerics = {
  //     Output: Output
  //     ResultResolverController: ResultResolverController
  //     Error: Error
  //   },
  //   UpdatedChain extends ChainGenerics = {
  //     Input: Chain['Input']
  //     ErrorResolverController: ErrorResolverController
  //     AccumulatedErrors: Chain['AccumulatedErrors'] | Error
  //     AccumulatedOutputs: Chain['AccumulatedOutputs'] | Output
  //     AccumulatedResultResolverControllers:
  //       | Chain['AccumulatedResultResolverControllers']
  //       | ResultResolverController
  //     Defaults: Chain['Defaults']
  //     LastNode: Child
  //   },
  // >(
  //   asyncFunction: (
  //     input: Chain['LastNode']['Output'],
  //     resolver: Resolver<ResultResolver, ErrorResolver>,
  //   ) => Chain['LastNode']['ResultResolverController'],
  // ): ChainNode<UpdatedChain>
}

type ValidAsyncFn =
  // | ((input: any, resolver: Resolver<ResultCb<any, any>, ErrorCb<any, any>>) => unknown)
  // | ((input: any, resolver: Resolver<ResultCb<any, any>, ErrorCb<any, never>>) => unknown)
  // | ((input: any, resolver: Resolver<ResultCb<any, any>, never>) => unknown)
  (input: any, resolver: any) => unknown

// type ValidAsyncFn2 = ((
//   input: any,
//   resolver: Resolver<ResultCb<any, any>, ErrorCb<any, any>>,
// ) => unknown) &
//   ((input: any, resolver: Resolver<ResultCb<any, any>, ErrorCb<any, never>>) => unknown) &
//   ((input: any, resolver: Resolver<ResultCb<any, any>, never>) => unknown) &
//   ((input: any, resolver: any) => unknown)

export type AsyncFunc<
  Input,
  ResultCallback extends ResultCb,
  ErrorCallback extends ErrorCb,
  Returned,
> = (input: Input, resolver: Resolver<ResultCallback, ErrorCallback>) => Returned

// type InferAsyncFn2<
//   T extends ValidAsyncFn,
//   Chain extends ChainGenerics = never,
//   Input = T extends (input: infer I, ...args) => any ? I : never,
//   TResolver = T extends (input: any, resolver: infer R) => any ? R : never,
//   ResultResolver extends ResultCb = TResolver extends { result: infer R extends ResultCb }
//     ? R
//     : never,
//   RType = ReturnType<T>,
//   Output = Parameters<ResultResolver>[0],
//   ResultResolverController = ReturnType<ResultResolver>,
//   ErrorResolver extends ErrorCb = TResolver extends {
//     error: infer E
//   }
//     ? E extends ErrorCb
//       ? E
//       : ErrorCb
//     : never,
//   Error = Parameters<ErrorResolver>[0],
//   ErrorResolverController = ReturnType<ErrorResolver>,
//   ReconstitutedAsyncFunc extends ValidAsyncFn = AsyncFunc<
//     Input,
//     ResultResolver,
//     ErrorResolver,
//     RType
//   >,
//   ConstrainedAsyncFunc extends ValidAsyncFn = AsyncFunc<
//     Chain['LastNode']['Output'],
//     ResultResolver,
//     [ErrorResolver] extends [never] ? never : ErrorCb<Error, Chain['ErrorResolverController']>,
//     Chain['LastNode']['ResultResolverController']
//   >,
//   ValidAsyncFunc extends ValidAsyncFn = [Chain] extends [never]
//     ? ReconstitutedAsyncFunc
//     : ReconstitutedAsyncFunc extends ConstrainedAsyncFunc
//     ? ConstrainedAsyncFunc extends ReconstitutedAsyncFunc
//       ? T
//       : never
//     : never,
//   NextChain extends ChainGenerics = [Chain] extends [never]
//     ? {
//         Input: Input
//         ErrorResolverController: ErrorResolverController
//         AccumulatedErrors: Error
//         // AccumulatedOutputs: Output
//         AccumulatedResultResolverControllers: RType | ResultResolverController
//         // Defaults: NeverChainNodeGenerics
//         LastNode: {
//           Output: Output
//           ResultResolverController: ResultResolverController
//           Error: Error
//         }
//       }
//     : {
//         Input: Chain['Input']
//         ErrorResolverController: Chain['ErrorResolverController']
//         // AccumulatedOutputs: Chain['AccumulatedOutputs'] | Output
//         AccumulatedErrors: Chain['AccumulatedErrors'] | Error
//         AccumulatedResultResolverControllers:
//           | Chain['AccumulatedResultResolverControllers']
//           | ResultResolverController
//         // Defaults: Chain['Defaults']
//         LastNode: {
//           Output: Output
//           ResultResolverController: ResultResolverController
//           Error: Error
//         }
//       },
// > = {
//   // input: Input
//   // resolver: TResolver
//   // resultResolver: ResultResolver
//   // output: Output
//   // resultResolverController: ResultResolverController
//   // errorResolver: ErrorResolver
//   // error: Error
//   // errorResolverController: ErrorResolverController
//   // returnType: RType
//   // reconstitutedAsyncFunc: ReconstitutedAsyncFunc
//   // constrainedAsyncFunc: ConstrainedAsyncFunc
//   validAsyncFunc: ValidAsyncFunc
//   chain: NextChain
// }

type InferAsyncFnBase = {
  Input: unknown
  ReturnType: unknown
  Resolver: unknown
  ResultCb: ResultCb
  Output: unknown
  ResultResolverController: unknown
  ErrorCb: ErrorCb
  Error: unknown
  ErrorResolverController: unknown
  AsyncFn: unknown
  ConstrainedAsyncFn: ValidAsyncFn
}

type InferAsyncFn<
  T extends ValidAsyncFn,
  TResolver = T extends (input: any, resolver: infer R) => any ? R : never,
  ResultResolver extends ResultCb = TResolver extends { result: infer R extends ResultCb }
    ? R
    : never,
  ErrorResolver extends ErrorCb = TResolver extends {
    error: infer E extends ErrorCb
  }
    ? E
    : never,
  Input = T extends (input: infer I, ...args) => any ? I : never,
  ConstrainedAsyncFn extends ValidAsyncFn = [IsStrictAny<TResolver>] extends [never]
    ? AsyncFunc<Input, ResultResolver, ErrorResolver, ReturnType<T>>
    : AsyncFunc<Input, ResultCb<any, any>, ErrorCb<any, any>, ReturnType<T>>,
> = {
  Input: Input
  ReturnType: ReturnType<T>
  Resolver: TResolver
  ResultCb: ResultResolver
  Output: Parameters<ResultResolver>[0]
  ResultResolverController: ReturnType<ResultResolver>
  ErrorCb: ErrorResolver
  Error: Parameters<ErrorResolver>[0]
  ErrorResolverController: ReturnType<ErrorResolver>
  ConstrainedAsyncFn: ConstrainedAsyncFn
  AsyncFn: T
}

// type ZZZZZ = InferAsyncFnS1<
//   (x: 'a0', resolver: Resolver<(result: 'a1') => 'r1', (err: 'e1') => 'er'>) => 'r0'
// >

type ConstrainAsyncFn<
  T extends InferAsyncFnBase,
  Input,
  ResultResolverController,
  ErrorResolverController,
  ConstrainedAsyncFn extends ValidAsyncFn = [IsStrictAny<T['Resolver']>] extends [never]
    ? AsyncFunc<
        Input,
        T['ResultCb'],
        [T['ErrorCb']] extends [never] ? never : ErrorCb<T['Error'], ErrorResolverController>,
        ResultResolverController
      >
    : AsyncFunc<Input, ResultCb<any, any>, ErrorCb<any, any>, ResultResolverController>,
> = IsStrictAny<T, Union<T, { ConstrainedAsyncFn: ConstrainedAsyncFn }>>

type ConstrainAsyncFnBaseOnFirstNode<T extends InferAsyncFnBase> = ConstrainAsyncFn<
  T,
  T['Input'],
  T['ReturnType'],
  T['ErrorResolverController']
>

type ConstrainAsyncFnBasedOnParent<
  T extends InferAsyncFnBase,
  ParentT extends InferAsyncFnBase,
  ErrorResolverController,
> = ConstrainAsyncFn<
  T,
  ParentT['Output'],
  ParentT['ResultResolverController'],
  ErrorResolverController
>

type InferAccumulatedChainTypes<
  T extends [InferAsyncFnBase, ...InferAsyncFnBase[]],
  ErrorsOnly = {
    [P in Exclude<keyof T, keyof any[]>]: T[P] extends InferAsyncFnBase ? T[P]['Error'] : never
  },
  ResolverZero = T[0]['ReturnType'],
  ResultResolversOnly = {
    [P in Exclude<keyof T, keyof any[]>]: T[P] extends InferAsyncFnBase
      ? T[P]['ResultResolverController']
      : never
  },
> = {
  AccumulatedErrors: ErrorsOnly[keyof ErrorsOnly]
  AccumulatedResultResolverControllers:
    | ResolverZero
    | ResultResolversOnly[keyof ResultResolversOnly]
}

// type Z00 = InferAsyncFnS1<never>
// type Z01 = InferAsyncFnS1<(input: string) => void>
// type Z02 = InferAsyncFnS1<(input: string, resolver: any) => void>
// type Z03 = InferAsyncFnS1<(input: string, resolver: Resolver<(a: number) => void>) => void>
// type Z04 = InferAsyncFnS1<
//   (input: string, resolver: Resolver<(a: number) => void, (a: number) => void>) => void
// >
// type Z05 = InferAsyncFnS1<any>

// type ZZ00 = ConstrainAsyncFnBaseOnFirstNode<Z00>
// type ZZ01 = ConstrainAsyncFnBaseOnFirstNode<Z01>
// type ZZ02 = ConstrainAsyncFnBaseOnFirstNode<Z02>
// type ZZ03 = ConstrainAsyncFnBaseOnFirstNode<Z03>
// type ZZ04 = ConstrainAsyncFnBaseOnFirstNode<Z04>
// type ZZ05 = ConstrainAsyncFnBaseOnFirstNode<Z05>
// type InferAsyncFn<
//   T extends ValidAsyncFn,
//   TParent extends ValidAsyncFn = never,
//   InferT extends InferAsyncFnBase = InferAsyncFnS1<T>,
//   InferTParent extends InferAsyncFnBase = InferAsyncFnS1<TParent>,
//   ConstrainedAsyncFunc extends ValidAsyncFn = AsyncFunc<
//     InferTParent['output'],
//     InferT['resultCb'],
//     [InferT['errorCb']] extends [never]
//       ? never
//       : ErrorCb<InferT['error'], InferTParent['errorResolverController']>,
//     InferTParent['resultResolverController']
//   >,
//   ValidAsyncFunc extends ValidAsyncFn = [TParent] extends [never]
//     ? InferT['reconstitutedFn']
//     : InferT['reconstitutedFn'] extends ConstrainedAsyncFunc
//     ? ConstrainedAsyncFunc extends InferT['reconstitutedFn']
//       ? T
//       : never
//     : never,
//   NextChain = [TParent] extends [never]
//     ? InferT['chain']
//     : {
//         Input: InferTParent['input']
//         ErrorResolverController: InferTParent['errorResolverController']
//         LastNode: {
//           Output: InferT['output']
//           ResultResolverController: InferT['resultResolverController']
//           Error: InferT['error']
//         }
//       },
// > = {
//   validAsyncFunc: ValidAsyncFunc
//   chain: NextChain
// }

// type AsyncFunctionChainArray2<
//   T extends [ValidAsyncFn, ...ValidAsyncFn[]],
//   Chain extends ChainGenerics = never,
//   Tail = T extends [any, ...infer R] ? R : never,
//   InferredHead extends { chain: ChainGenerics; validAsyncFunc: ValidAsyncFn } = InferAsyncFn<
//     T[0],
//     Chain
//   > extends infer O
//     ? { [k in keyof O]: O[k] }
//     : never,
// > = Tail extends [ValidAsyncFn, ...ValidAsyncFn[]]
//   ? [InferredHead, ...AsyncFunctionChainArray2<Tail, InferredHead['chain']>]
//   : [InferredHead]

type AsyncFunctionChainArray<
  T extends [ValidAsyncFn, ...ValidAsyncFn[]],
  Chain extends ChainGenerics = never,
  InferredT extends [InferAsyncFnBase, ...InferAsyncFnBase[]] = {
    [I in keyof T]: InferAsyncFn<T[I]>
  } extends [InferAsyncFnBase, ...InferAsyncFnBase[]]
    ? { [I in keyof T]: InferAsyncFn<T[I]> }
    : never,
  ConstrainedFirstNode extends InferAsyncFnBase = [Chain] extends [never]
    ? ConstrainAsyncFnBaseOnFirstNode<InferredT[0]>
    : ConstrainAsyncFn<
        InferredT[0],
        Chain['LastNode']['Output'],
        Chain['LastNode']['ResultResolverController'],
        Chain['ErrorResolverController']
      >,
  TailInferredT extends InferAsyncFnBase[] = InferredT extends [any, ...infer P] ? P : never,
  UpdatedInferredT extends [InferAsyncFnBase, ...InferAsyncFnBase[]] = [
    ConstrainedFirstNode,
    ...TailInferredT,
  ],
  AccumulatedTypes extends {
    AccumulatedErrors: unknown
    AccumulatedResultResolverControllers: unknown
  } = InferAccumulatedChainTypes<UpdatedInferredT>,
  ConstrainedTail extends InferAsyncFnBase[] = {
    [I in keyof TailInferredT]: ConstrainAsyncFnBasedOnParent<
      TailInferredT[I],
      Lookup<UpdatedInferredT, I>,
      ConstrainedFirstNode['ErrorResolverController']
    >
  },
  ConstrainedT extends [InferAsyncFnBase, ...InferAsyncFnBase[]] = [
    ConstrainedFirstNode,
    ...ConstrainedTail,
  ],
  Last extends InferAsyncFnBase = ConstrainedT extends [...any, infer L extends InferAsyncFnBase]
    ? L
    : never,
> = {
  AsyncFns: {
    [I in keyof ConstrainedT]: ConstrainedT[I]['ConstrainedAsyncFn'] extends ConstrainedT[I]['AsyncFn']
      ? ConstrainedT[I]['AsyncFn'] extends ConstrainedT[I]['ConstrainedAsyncFn']
        ? ConstrainedT[I]['AsyncFn']
        : ConstrainedT[I]['ConstrainedAsyncFn']
      : ConstrainedT[I]['ConstrainedAsyncFn']
  }
  LastChain: [Chain] extends [never]
    ? {
        Input: ConstrainedFirstNode['Input']
        ErrorResolverController: ConstrainedFirstNode['ErrorResolverController']
        AccumulatedErrors: AccumulatedTypes['AccumulatedErrors']
        AccumulatedResultResolverControllers: AccumulatedTypes['AccumulatedResultResolverControllers']
        LastNode: {
          Output: Last['Output']
          Error: Last['Error']
          ResultResolverController: Last['ResultResolverController']
        }
      }
    : {
        Input: Chain['Input']
        ErrorResolverController: Chain['ErrorResolverController']
        AccumulatedErrors: Chain['AccumulatedErrors'] | AccumulatedTypes['AccumulatedErrors']
        AccumulatedResultResolverControllers:
          | Chain['AccumulatedResultResolverControllers']
          | AccumulatedTypes['AccumulatedResultResolverControllers']
        LastNode: {
          Output: Last['Output']
          Error: Last['Error']
          ResultResolverController: Last['ResultResolverController']
        }
      }
  FirstChain: ConstrainedFirstNode extends { Chain: ChainGenerics }
    ? ConstrainedFirstNode['Chain']
    : never
}

// type AsyncFunctionChainArray<
//   T extends [ValidAsyncFn, ...ValidAsyncFn[]],
//   Chain extends ChainGenerics = never,
//   Computed1 = AsyncFunctionChainArray2<T, Chain> extends infer A ? { [I in keyof A]: A[I] } : never,
//   Computed extends {
//     chain: ChainGenerics
//     validAsyncFunc: ValidAsyncFn
//   }[] = Computed1 extends {
//     chain: ChainGenerics
//     validAsyncFunc: ValidAsyncFn
//   }[]
//     ? Computed1
//     : never,
//   AsyncFns = { [I in keyof Computed]: Computed[I]['validAsyncFunc'] },
//   Last extends { chain: ChainGenerics; validAsyncFunc: ValidAsyncFn } = Computed extends [
//     ...any,
//     infer L extends { chain: ChainGenerics; validAsyncFunc: ValidAsyncFn },
//   ]
//     ? L
//     : never,
//   AsyncFnArray extends [ValidAsyncFn, ...ValidAsyncFn[]] = AsyncFns extends [
//     ValidAsyncFn,
//     ...ValidAsyncFn[],
//   ]
//     ? AsyncFns
//     : never,
//   LastChain extends ChainGenerics = Last['chain'],
//   FirstChain extends ChainGenerics = Computed[0]['chain'],
// > = [Chain] extends [never]
//   ? {
//       asyncFns: AsyncFnArray
//       lastChain: LastChain
//       firstChain: FirstChain
//       // rootChain: {
//       //   Input: FirstChain['Input']
//       //   ErrorResolverController: 'aaab'
//       //   AccumulatedOutputs: never
//       //   AccumulatedErrors: never
//       //   AccumulatedResultResolverControllers: never
//       //   Defaults: FirstChain['Defaults']
//       //   LastNode: {
//       //     Output: FirstChain['Input']
//       //     ResultResolverController: void
//       //     Error: any
//       //   }
//       // }
//     }
//   : { asyncFns: AsyncFnArray; lastChain: LastChain; firstChain: Computed[0]['chain'] }

// type H01 = AsyncFunctionChainArray2<
//   [
//     (x: 'a0', resolver: Resolver<(result: 'a1') => 'r1', (err: 'e1') => 'er'>) => 'r0',
//     (x: 'a1', resolver: Resolver<(result: 'a2') => 'r2'>) => 'r1',
//     (x: 'a2', resolver: Resolver<(result: 'a3') => 'r3', (err: 'e3') => 'er'>) => 'r2',
//     (x: 'a3', resolver: Resolver<(result: 'a4') => 'r4', (err: 'e4') => 'er'>) => 'r3',
//   ],
//   {
//     Input: 'a0'
//     ErrorResolverController: 'er'
//     AccumulatedErrors: 'addder'
//     AccumulatedResultResolverControllers: 'addder'
//     LastNode: {
//       Output: 'a0'
//       ResultResolverController: 'r0'
//       Error: never
//     }
//   }
// >
// type H02 = AsyncFunctionChainArray2<
//   [
//     (x: 'a0', resolver: Resolver<(result: 'a1') => 'r1', (err: 'e1') => 'er'>) => 'r0',
//     (x: 'a1', resolver: Resolver<(result: 'a2') => 'r2', never>) => 'r1',
//     (x: 'a2', resolver: Resolver<(result: 'a3') => 'r3', (err: 'e3') => 'er'>) => 'r2',
//   ]
// >
// type H03 = AsyncFunctionChainArray2<
//   [
//     (x: 'a0', resolver: Resolver<(result: 'a1') => 'r1', (err: 'e1') => 'er'>) => 'r0',
//     (x: any, resolver: Resolver<(result: 'a2') => any, never>) => 'r1',
//     (x: 'a2', resolver: Resolver<(result: 'a3') => 'r3', (err: 'e3') => 'er'>) => 'r2',
//   ]
// >
// type H04 = AsyncFunctionChainArray2<
//   [
//     (x: 'a0', resolver: Resolver<(result: 'a1') => 'r1', (err: 'e1') => 'er'>) => 'r0',
//     (x: any) => 'r1',
//     (x: 'a2', resolver: Resolver<(result: 'a3') => 'r3', (err: 'e3') => 'er'>) => 'r2',
//   ]
// >
// type H05 = AsyncFunctionChainArray2<
//   [
//     (x: 'a0', resolver: Resolver<(result: 'a1') => 'r1', (err: 'e1') => 'er'>) => 'r0',
//     (x: any, resolver: any) => 'r1',
//     (x: 'a2', resolver: Resolver<(result: 'a3') => 'r3', (err: 'e3') => 'er'>) => 'r2',
//   ]
// >
// type H06 = AsyncFunctionChainArray2<
//   [
//     (x: 'a0', resolver: Resolver<(result: 'a1') => 'r1', (err: 'e1') => 'er'>) => 'r0',
//     (x: any, resolver: never) => 'r1',
//     (x: 'a2', resolver: Resolver<(result: 'a3') => 'r3', (err: 'e3') => 'er'>) => 'r2',
//   ]
// >

// type ZZZ121 = AsyncFunctionChainArray<
// [
//   (x: 'a0', resolver: Resolver<(result: 'a1') => 'r1', (err: 'e1') => 'er'>) => 'r0',
//   (x: 'a1', resolver: Resolver<(result: 'a2') => 'r2'>) => 'r1',
//   (x: 'a2', resolver: Resolver<(result: 'a3') => 'r3', (err: 'e3') => 'er'>) => 'r2',
//   (x: 'a3', resolver: Resolver<(result: 'a4') => 'r4', (err: 'e4') => 'er'>) => 'r3',
// ],
//   never
// >

type ChainLike<Input, ResultResolverController, ErrorResolverController> = {
  await: [ErrorResolverController] extends [never]
    ? (input: Input, resultCb: (result: any) => any) => ResultResolverController
    : (
        input: Input,
        resultCb: (result: any) => any,
        errorCb: (error: any) => ErrorResolverController,
      ) => ResultResolverController
}

type InferPartialChainGenericsFromChainLike<
  Input,
  ResultResolverController,
  ErrorResolverController,
  R,
  T extends ChainLike<
    Input,
    ResultResolverController,
    ErrorResolverController
  > = R extends ChainLike<Input, ResultResolverController, ErrorResolverController> ? R : never,
  AwaitF = T extends { await: infer A } ? A : never,
  // Input = AwaitF extends (input: infer I, ...args)=>never ? I : never,
  RCallback = AwaitF extends (input: any, resultCb: infer C) => any ? C : never,
  Output = RCallback extends (result: infer O) => any ? O : never,
  ECallback = AwaitF extends (
    input: any,
    resultCb: any,
    errorCb: infer E extends (arg) => any,
  ) => any
    ? E
    : never,
  AccumulatedErrors = ECallback extends (errors: infer E) => any ? E : never,
  AccumulatedResultResolverControllers = AwaitF extends (...args) => infer C
    ? C extends { controller: infer A }
      ? A
      : never
    : never,
  RT extends ChainGenerics = {
    Input: Input
    ErrorResolverController: ErrorResolverController
    // AccumulatedOutputs: unknown
    AccumulatedErrors: AccumulatedErrors
    AccumulatedResultResolverControllers: AccumulatedResultResolverControllers
    // Defaults: NeverChainNodeGenerics
    LastNode: {
      Output: Output
      Error: unknown
      ResultResolverController: ResultResolverController
    }
  },
> = RT

type Splice<
  Chain extends ChainGenerics,
  RT = <
    T extends ChainLike<
      Chain['LastNode']['Output'],
      Chain['LastNode']['ResultResolverController'],
      Chain['ErrorResolverController']
    >,
    SubChain extends ChainGenerics = InferPartialChainGenericsFromChainLike<
      Chain['LastNode']['Output'],
      Chain['LastNode']['ResultResolverController'],
      Chain['ErrorResolverController'],
      T
    >,
    UpdatedChain extends ChainGenerics = LMerge<
      Chain,
      {
        ErrorResolverController: SubChain['ErrorResolverController']
        AccumulatedErrors: Chain['AccumulatedErrors'] | SubChain['AccumulatedErrors']
        // AccumulatedOutputs: Chain['AccumulatedOutputs'] | SubChain['AccumulatedOutputs']
        AccumulatedResultResolverControllers:
          | Chain['AccumulatedResultResolverControllers']
          | SubChain['AccumulatedResultResolverControllers']
        LastNode: SubChain['LastNode']
      }
    >,
  >(
    subChain: T,
  ) => ChainNode<UpdatedChain>,
> = RT

type Await<
  Chain extends ChainGenerics,
  Type extends 'external' | 'internal',
  RT = {
    internal: (
      input: Chain['Input'],
      resultCb: ChainNodeResultCb<Chain['LastNode']>,
      errorCb: ChainNodeErrorCb<Chain>,
      controller: AwaitedChainController<Chain['LastNode']['ResultResolverController']>,
    ) => AwaitedChainController<Chain['LastNode']['ResultResolverController']>
    external: [Chain['ErrorResolverController']] extends [never]
      ? (
          input: Chain['Input'],
          resultCb: ChainNodeResultCb<Chain['LastNode']>,
        ) => AwaitedChainController<Chain['AccumulatedResultResolverControllers']>
      : (
          input: Chain['Input'],
          resultCb: ChainNodeResultCb<Chain['LastNode']>,
          errorCb: AccumulatedErrorCb<Chain>,
        ) => AwaitedChainController<Chain['AccumulatedResultResolverControllers']>
  }[Type],
> = RT

type SharedProperties<
  Chain extends ChainGenerics,
  RT = {
    type: typeof chainNodeType
    onError(callback: AccumulatedErrorCb<Chain>): ChainNode<Chain>
    await: Await<Chain, 'external'>
    splice: Splice<Chain>
    // sync: ResultCall<Chain, Node, false>
    // input(input: Chain['Input']): PromiseLike<Chain['Output']>
  },
> = RT

type ChainNode<Chain extends ChainGenerics, RT = ResultCall<Chain> & SharedProperties<Chain>> = RT

// type ChainFn = {
//   // /* ******************************************************************************** */
//   <
//     Defaults extends Partial<ChainNodeGenericsWithInputOutput> = {},
//     FirstNodeTypes extends {
//       Input?: unknown
//       ResultResolverController?: unknown
//       ErrorResolverController?: unknown
//     } = {},
//     NodeTypes extends ChainNodePossibleGenerics = {},
//     FinalDefaults extends ChainNodeGenerics = RenameProperty<
//       LMerge<NeverChainNodeGenericsWithInputOutput, Defaults>,
//       'InputOutput',
//       'Output'
//     >,
//     ZeroNode extends ChainNodeGenerics = LMerge<
//       FinalDefaults,
//       RenameProperty<FirstNodeTypes, 'Input', 'Output'>
//     > extends ChainNodeGenerics
//       ? LMerge<FinalDefaults, RenameProperty<FirstNodeTypes, 'Input', 'Output'>>
//       : never,
//     Node extends ChainNodeGenerics = LMerge<FinalDefaults, NodeTypes> extends ChainNodeGenerics
//       ? LMerge<FinalDefaults, NodeTypes>
//       : never,
//     ErrorResolverController = FirstNodeTypes extends { ErrorResolverController: unknown }
//       ? FirstNodeTypes['ErrorResolverController']
//       : never,
//     Chain extends ChainGenerics = {
//       Input: ZeroNode['Output']
//       Output: Node['Output']
//       ErrorResolverController: ErrorResolverController
//       AccumulatedErrors: Node['Error']
//       AccumulatedOutputs: Node['Output']
//       AccumulatedResultResolverControllers:
//         | ZeroNode['ResultResolverController']
//         | Node['ResultResolverController']
//       Defaults: FinalDefaults
//       LastNode: Node
//     },
//   >(
//     asyncFunction: AsyncFn<
//       {
//         Input: never
//         Output: ZeroNode['Output']
//         ErrorResolverController: never
//         AccumulatedErrors: never
//         AccumulatedOutputs: never
//         AccumulatedResultResolverControllers: never
//         Defaults: FinalDefaults
//         LastNode: ZeroNode
//       },
//       Chain
//     >,
//   ): ChainNode<Chain>
//   // /* ****************************************************************************************************** */
//   // <
//   //   Input,
//   //   NodeReturnType,
//   //   ResCb extends ResultCb,
//   //   ErrCb extends ErrorCb,
//   //   Output = Parameters<ResCb>[0],
//   //   ResultResolverController = ReturnType<ResCb>,
//   //   Error = Parameters<ErrCb>[0],
//   //   ErrorResolverController = ReturnType<ErrCb>,
//   // >(
//   //   asyncFunction: (input: Input, resolver: Resolver<ResCb, ErrCb>) => NodeReturnType,
//   // ): ChainNode<{
//   //   Input: Input
//   //   ErrorResolverController: ErrorResolverController
//   //   AccumulatedErrors: Error
//   //   AccumulatedOutputs: Output
//   //   AccumulatedResultResolverControllers: NodeReturnType | ResultResolverController
//   //   Defaults: {
//   //     Output: never
//   //     Error: never
//   //     ResultResolverController: never
//   //   }
//   //   LastNode: {
//   //     Output: Output
//   //     ResultResolverController: ResultResolverController
//   //     Error: Error
//   //   }
//   // }>

//   /* ****************************************************************************************************** */

//   <
//     T extends [ValidAsyncFn, ...ValidAsyncFn[]],
//     ValidT extends {
//       lastChain: ChainGenerics
//       asyncFns: [ValidAsyncFn, ...ValidAsyncFn[]]
//     } = AsyncFunctionChainArray<T, never>,
//   >(
//     ...asyncFunctions: T & ValidT['asyncFns']
//   ): ChainNode<ValidT['lastChain']>
// }

/* ***************************************************************************************************************************************************************
 *****************************************************************************************************************************************************************
 *****************************************************************************************************************************************************************
 *****************************************************************************************************************************************************************
 *****************************************************************************************************************************************************************
 *****************************************************************************************************************************************************************
 *****************************************************************************************************************************************************************
 *****************************************************************************************************************************************************************
 *****************************************************************************************************************************************************************
 */

// const functionAssign = <T extends Function, S extends Object, R = T & S>(fn: T, obj: S) =>
//   Object.assign(fn, obj) as R

// const resultCall = <Chain extends ChainGenerics>(awaitFn: Await<Chain, 'internal'>) => {
//   const dFn: ResultCall<Chain> = function resultCallFn(asyncFunction) {
//     return newNode(asyncFunction, (arg, resultCb, errorCb, controller) =>
//       awaitFn(arg, resultCb, errorCb as unknown as ChainNodeErrorCb<Chain>, controller),
//     )
//   }
//   return dFn
// }
function getResultCall<Chain extends ChainGenerics>(awaitFn: Await<Chain, 'internal'>) {
  const resultCall = function resultCallFn<
    T extends [ValidAsyncFn, ...ValidAsyncFn[]],
    ResultCallTypes extends {
      FirstChain: ChainGenerics
      LastChain: ChainGenerics
      AsyncFns: [ValidAsyncFn, ...ValidAsyncFn[]]
    } = AsyncFunctionChainArray<T, Chain>,
    NextChain extends ChainGenerics = ResultCallTypes['FirstChain'],
    FinalChain extends ChainGenerics = ResultCallTypes['LastChain'],
    FinalChainNode = ChainNode<FinalChain>,
  >(...asyncFunctions: T) {
    if (asyncFunctions.length === 0) throw new Error('async functions required')
    // const aFns = asyncFunctions as T extends [any, ...infer F]
    //   ? F extends [ValidAsyncFn, ...ValidAsyncFn[]]
    //     ? F
    //     : never
    //   : never
    const asyncFn = asyncFunctions.shift() as AsyncFn<Chain, NextChain>
    const nextNode = newNode<Chain, NextChain>(asyncFn, (arg, resultCb, errorCb, controller) =>
      awaitFn(arg, resultCb, errorCb, controller),
    )
    const rv = asyncFunctions.length === 0 ? nextNode : nextNode<T>(...(asyncFunctions as any))
    return rv as unknown as FinalChainNode
  }
  return resultCall as unknown as ResultCall<Chain>
}

const addSharedProperties = <Chain extends ChainGenerics>(
  fn: ResultCall<Chain>,
  awaitFn: Await<Chain, 'internal'>,
  errorNodeFn: typeof errorNode<Chain>,
): ChainNode<Chain> => {
  const sharedProperties: SharedProperties<Chain> = {
    type: chainNodeType,
    await(arg, resultCb, errorCb?) {
      return awaitFn(
        arg,
        resultCb,
        errorCb ||
          (() => {
            throw new Error('error callback made without an error handler being provided')
          }),
        { controller: undefined },
      )
    },
    onError(errorCb) {
      return errorNodeFn(awaitFn, errorCb)
    },
    splice(subChain) {
      return (fn as any)((input, resolver) => {
        subChain.await(
          input,
          (result) => resolver.result(result),
          (error) => resolver.error(error),
        )
      })
    },
  }
  const rv: ChainNode<Chain> = Object.assign(fn, sharedProperties as SharedProperties<Chain>)
  return rv
}

const errorNode = <Chain extends ChainGenerics>(
  parentAwaitFn: Await<Chain, 'internal'>,
  upstreamErrorCb: ChainNodeErrorCb<Chain>,
): ChainNode<Chain> => {
  const awaitFn: Await<Chain, 'internal'> = (
    arg,
    resultCb,
    _errorCb, // TODO: consider adding error bubbling
    controller,
  ) => parentAwaitFn(arg, resultCb, upstreamErrorCb, controller)
  return addSharedProperties<Chain>(getResultCall<Chain>(awaitFn), awaitFn, errorNode)
}

function newNode<PreviousChain extends ChainGenerics, Chain extends ChainGenerics>(
  asyncFn: AsyncFn<PreviousChain, Chain>,
  parentAwaitFn: Await<PreviousChain, 'internal'>,
) {
  const awaitFn: Await<Chain, 'internal'> = (input, resultCb, errorCb, controller) => {
    const execute = (inputArg: Chain['Input'] | PreviousChain['LastNode']['Output']) => {
      const pins = Object.assign(
        function PinsFn(resultArg: Chain['LastNode']['Output']) {
          return pins.result(resultArg)
        },
        {
          result(resultArg: Chain['LastNode']['Output']) {
            controller.controller = undefined
            const res = resultCb(resultArg)
            controller.controller = res
            return res
          },
          error(errorArg: Chain['LastNode']['Error']) {
            if (errorCb) return errorCb(errorArg)
            throw new Error('error called, but no ErrorCb was provided')
          },
        },
      )
      return asyncFn(inputArg, pins)
    }
    // controller.controller = undefined
    // if (parentAwaitFn) {
    return parentAwaitFn(
      input,
      execute,
      errorCb as unknown as ChainNodeErrorCb<PreviousChain>,
      controller,
    )
    // }
    // controller.controller = execute(input)
    // return controller
  }
  const x = getResultCall<Chain>(awaitFn)
  const xy = addSharedProperties<Chain>(x, awaitFn, errorNode)
  return xy
}

function chain<
  T extends [ValidAsyncFn, ...ValidAsyncFn[]],
  ValidT extends {
    LastChain: ChainGenerics
    AsyncFns: [ValidAsyncFn, ...ValidAsyncFn[]]
  } = AsyncFunctionChainArray<T, never>,
>(...asyncFunctions: T & ValidT['AsyncFns']) {
  const rCall = getResultCall((input, resolver) => resolver(input) as any)
  const rv = rCall<T>(...(asyncFunctions as any))
  return rv as ChainNode<ValidT['LastChain']>
}

// const x = [] as unknown as [
//   (x1: 'a0', resolver: Resolver<(result: 'a1') => 'r1', (err: 'e1') => 'er'>) => 'r0',
//   (x2: 'a1', resolver: Resolver<(result: 'a2') => 'r2'>) => 'r1',
//   (x3: 'a2', resolver: Resolver<(result: 'a3') => 'r3', (err: 'e3') => 'er'>) => 'r2',
//   // (x4: 'a3', resolver: Resolver<(result: 'a4') => 'r4', (err: 'e4') => 'er'>) => 'r3',
// ]
// const y = [] as unknown as [
//   (x4: 'a3', resolver: Resolver<(result: 'a4') => 'r4', (err: 'e4') => 'er'>) => 'r3',
//   (x5: 'a4', resolver: Resolver<(result: 'a5') => 'r5', (err: 'e5') => 'er'>) => 'r4',
// ]

// const chn = chain(...x)

// const chn2 = chn(...y)

export default chain

// const coupler = () => {
//   let resultCb: (...args) => any
//   let result: any
//   let counter = 0
//   let resolver
//   const len = 2
//   const obj = {
//     resultCb(
//       resCb: (input: any, resolver: { result: (result: any) => any }) => any,
//       resolver_: any,
//     ) {
//       resultCb = resCb
//       resolver = resolver_
//       counter += 1
//       obj.resultCb === undefined
//       if (counter === len) resultCb(result, resolver)
//       return resolver
//     },
//     result(res: any) {
//       result = res
//       counter += 1
//       if (counter === len) return resultCb(result, resolver)
//     },
//   }
//   return obj
// }
