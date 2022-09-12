/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable no-use-before-define */
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

import { Union, LMerge, RenameProperty } from './typescript utils.js'

type ResultResolver<Result, ResultResolverController> = (result: Result) => ResultResolverController
type ErrorResolver<Error, ErrorResolverController> = (error: Error) => ErrorResolverController
type ResultCb<T, ResultCbController> = (result: T) => ResultCbController
export type ErrorCb<Error, Output, ResultResolverController, ErrorCbController> = (
  error: Error,
  result: ResultResolver<Output, ResultResolverController>,
) => ErrorCbController

export type AwaitedChainNodeController<AccumulatedAsyncFnController> = {
  breakChain: boolean
  controller: AccumulatedAsyncFnController
}

type ChainNodeGenerics = {
  Error: unknown
  Output: unknown
  ResultResolverController: unknown
  ErrorResolverController: unknown
}

type ChainNodePossibleGenerics = Partial<ChainNodeGenerics>

type ChainNodeAccumulatedTypes = {
  AccumulatedOutputs: unknown
  AccumulatedErrors: unknown
  AccumulatedResultResolverControllers: unknown
  AccumulatedErrorResolverControllers: unknown
}

type ChainNodeGenericsWithInputOutput = Union<
  Omit<ChainNodeGenerics, 'Output'>,
  { InputOutput: unknown }
>
type NeverChainNodeGenerics = { [k in keyof ChainNodeGenericsWithInputOutput]: never }

export type PinsA<Error, Output, ResultResolverController, AccumulatedErrorResolverControllers> = {
  (result: Output): ResultResolverController
  result: ResultResolver<Output, ResultResolverController>
  error: ErrorResolver<Error, AccumulatedErrorResolverControllers>
}

export type Pins<
  Node extends {
    Error: unknown
    Output: unknown
    ResultResolverController: unknown
  },
  AccumulatedTypes extends {
    AccumulatedErrorResolverControllers: unknown
  },
> = PinsA<
  Node['Error'],
  Node['Output'],
  Node['ResultResolverController'],
  AccumulatedTypes['AccumulatedErrorResolverControllers']
>

type ChainNodeAsyncFn<
  ParentNode extends {
    Output: unknown
    ResultResolverController: unknown
    ErrorResolverController: unknown
  },
  Node extends ChainNodeGenerics,
  AccumulatedTypes extends {
    AccumulatedErrorResolverControllers: unknown
  },
> = (
  input: ParentNode['Output'],
  resolver: Pins<Node, AccumulatedTypes>,
) => ParentNode['ResultResolverController']

type ChainNodeResultCb<
  Node extends {
    Output: unknown
    ResultResolverController: unknown
  },
> = ResultCb<Node['Output'], Node['ResultResolverController']>

type ChainNodeErrorCb<Node extends ChainNodeGenerics> = ErrorCb<
  Node['Error'],
  Node['Output'],
  Node['ResultResolverController'],
  Node['ErrorResolverController']
>

type AccumulatedErrorCb<Node extends ChainNodeAccumulatedTypes> = ErrorCb<
  Node['AccumulatedErrors'],
  Node['AccumulatedOutputs'],
  Node['AccumulatedResultResolverControllers'],
  Node['AccumulatedErrorResolverControllers']
>

type ChainNodeController<Controller> = AwaitedChainNodeController<Controller>

type ChainNodeAwaitFn<StartInput, Node extends ChainNodeGenerics> = (
  input: StartInput,
  resultCb: ChainNodeResultCb<Node>,
  errorCb: ChainNodeErrorCb<Node>,
  controller: ChainNodeController<Node['ResultResolverController']>,
) => AwaitedChainNodeController<Node['ResultResolverController']>

type AccumulateChainNodeAwaitFn<
  StartInput,
  Node extends ChainNodeGenerics,
  AccumulatedTypes extends ChainNodeAccumulatedTypes,
> = (
  input: StartInput,
  resultCb: ChainNodeResultCb<Node>,
  errorCb: AccumulatedErrorCb<AccumulatedTypes>,
  controller: ChainNodeController<AccumulatedTypes['AccumulatedResultResolverControllers']>,
) => AwaitedChainNodeController<AccumulatedTypes['AccumulatedResultResolverControllers']>

// type DefaultFnCall<
//   StartInput,
//   Node extends ChainNodeGenerics,
//   Defaults extends ChainNodeGenerics,
//   AccumulatedTypes extends ChainNodeAccumulatedTypes,
//   S extends ChainNodePossibleGenerics = {},
//   NewDefaults extends ChainNodePossibleGenerics = {},
//   UpdatedDefaults extends ChainNodeGenerics = LMerge<
//     Defaults,
//     NewDefaults
//   > extends ChainNodeGenerics
//     ? LMerge<Defaults, NewDefaults>
//     : never,
//   Child extends ChainNodeGenerics = LMerge<UpdatedDefaults, S> extends ChainNodeGenerics
//     ? LMerge<UpdatedDefaults, S>
//     : never,
//   ChildAccumulatedTypes extends ChainNodeAccumulatedTypes = {
//     AccumulatedErrors: AccumulatedTypes['AccumulatedErrors'] | Child['Error']
//     AccumulatedOutputs: AccumulatedTypes['AccumulatedOutputs'] | Child['Output']
//     AccumulatedResultResolverControllers:
//       | AccumulatedTypes['AccumulatedResultResolverControllers']
//       | Child['ResultResolverController']
//     AccumulatedErrorResolverControllers:
//       | AccumulatedTypes['AccumulatedErrorResolverControllers']
//       | Child['ErrorResolverController']
//   },
// > = (
//   asyncFn: ChainNodeAsyncFn<Node, Child, ChildAccumulatedTypes>,
// ) => ChainNode<StartInput, Node, Child, ChildAccumulatedTypes, UpdatedDefaults>

export type ChainNode<
  StartInput,
  ParentNode extends ChainNodeGenerics,
  Node extends ChainNodeGenerics,
  AccumulatedTypes extends ChainNodeAccumulatedTypes,
  Defaults extends ChainNodeGenerics = ChainNodeGenerics,
> = {
  <
    NodeTypes extends ChainNodePossibleGenerics = {},
    UpdateDefaults extends ChainNodePossibleGenerics = {},
    UpdatedDefaults extends ChainNodeGenerics = LMerge<
      Defaults,
      UpdateDefaults
    > extends ChainNodeGenerics
      ? LMerge<Defaults, UpdateDefaults>
      : never,
    Child extends ChainNodeGenerics = LMerge<UpdatedDefaults, NodeTypes> extends ChainNodeGenerics
      ? LMerge<UpdatedDefaults, NodeTypes>
      : never,
    ChildAccumulatedTypes extends ChainNodeAccumulatedTypes = {
      AccumulatedErrors: AccumulatedTypes['AccumulatedErrors'] | Child['Error']
      AccumulatedOutputs: AccumulatedTypes['AccumulatedOutputs'] | Child['Output']
      AccumulatedResultResolverControllers:
        | AccumulatedTypes['AccumulatedResultResolverControllers']
        | Child['ResultResolverController']
      AccumulatedErrorResolverControllers:
        | AccumulatedTypes['AccumulatedErrorResolverControllers']
        | Child['ErrorResolverController']
    },
  >(
    asyncFn: ChainNodeAsyncFn<Node, Child, ChildAccumulatedTypes>,
  ): ChainNode<StartInput, Node, Child, ChildAccumulatedTypes, UpdatedDefaults>
  onError(
    callback: AccumulatedErrorCb<AccumulatedTypes>,
  ): ChainNode<StartInput, ParentNode, Node, AccumulatedTypes, Defaults>
  await(
    input: StartInput,
    resultCb: ChainNodeResultCb<Node>,
    errorCb: AccumulatedErrorCb<AccumulatedTypes>,
  ): AwaitedChainNodeController<AccumulatedTypes['AccumulatedResultResolverControllers']>
  s<
    NodeTypes extends ChainNodePossibleGenerics = {},
    UpdateDefaults extends ChainNodePossibleGenerics = {},
    UpdatedDefaults extends ChainNodeGenerics = LMerge<
      Defaults,
      UpdateDefaults
    > extends ChainNodeGenerics
      ? LMerge<Defaults, UpdateDefaults>
      : never,
    Child extends ChainNodeGenerics = LMerge<UpdatedDefaults, NodeTypes> extends ChainNodeGenerics
      ? LMerge<UpdatedDefaults, NodeTypes>
      : never,
    ChildAccumulatedTypes extends ChainNodeAccumulatedTypes = {
      AccumulatedErrors: AccumulatedTypes['AccumulatedErrors'] | Child['Error']
      AccumulatedOutputs: AccumulatedTypes['AccumulatedOutputs'] | Child['Output']
      AccumulatedResultResolverControllers:
        | AccumulatedTypes['AccumulatedResultResolverControllers']
        | Child['ResultResolverController']
      AccumulatedErrorResolverControllers:
        | AccumulatedTypes['AccumulatedErrorResolverControllers']
        | Child['ErrorResolverController']
    },
  >(
    syncFunction: (input: Node['Output']) => Child['Output'],
  ): ChainNode<StartInput, Node, Child, ChildAccumulatedTypes, UpdatedDefaults>
}

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

const functionAssign = <T extends object, S>(fn: T, obj: S) => Object.assign(fn, obj) as T & S

const addSharedProperties = <
  StartInput,
  ParentNode extends ChainNodeGenerics,
  Node extends ChainNodeGenerics,
  AccumulatedTypes extends ChainNodeAccumulatedTypes,
  Defaults extends ChainNodeGenerics,
>(
  fn: ChainNode<StartInput, ParentNode, Node, AccumulatedTypes, Defaults>,
  awaitFn: AccumulateChainNodeAwaitFn<StartInput, Node, AccumulatedTypes>,
  errorNodeFn: typeof errorNode<StartInput, ParentNode, Node, AccumulatedTypes, Defaults>,
) =>
  Object.assign(fn, {
    await(arg: StartInput, resultCb: ChainNodeResultCb<Node>, errorCb: ChainNodeErrorCb<Node>) {
      return awaitFn(arg, resultCb, errorCb, { breakChain: false, controller: undefined })
    },
    onError(errorCb: ChainNodeErrorCb<Node>) {
      return errorNodeFn(awaitFn, errorCb)
    },
    s<
      S extends ChainNodePossibleGenerics = {},
      NewDefaults extends ChainNodePossibleGenerics = {},
      UpdatedDefaults extends ChainNodeGenerics = LMerge<
        Defaults,
        NewDefaults
      > extends ChainNodeGenerics
        ? LMerge<Defaults, NewDefaults>
        : never,
      Child extends ChainNodeGenerics = LMerge<UpdatedDefaults, S> extends ChainNodeGenerics
        ? LMerge<UpdatedDefaults, S>
        : never,
      ChildAccumulatedTypes extends ChainNodeAccumulatedTypes = {
        AccumulatedErrors: AccumulatedTypes['AccumulatedErrors'] | Child['Error']
        AccumulatedOutputs: AccumulatedTypes['AccumulatedOutputs'] | Child['Output']
        AccumulatedResultResolverControllers:
          | AccumulatedTypes['AccumulatedResultResolverControllers']
          | Child['ResultResolverController']
        AccumulatedErrorResolverControllers:
          | AccumulatedTypes['AccumulatedErrorResolverControllers']
          | Child['ErrorResolverController']
      },
    >(syncFunction: (input: Node['Output']) => Child['Output']) {
      return fn<S, NewDefaults, UpdatedDefaults, Child, ChildAccumulatedTypes>((input, resolver) =>
        resolver.result(syncFunction(input)),
      )
    },
  }) as ChainNode<StartInput, ParentNode, Node, AccumulatedTypes, Defaults>

const errorNode = <
  StartInput,
  ParentNode extends ChainNodeGenerics,
  Node extends ChainNodeGenerics,
  AccumulatedTypes extends ChainNodeAccumulatedTypes,
  Defaults extends ChainNodeGenerics,
>(
  parentAwaitFn: ChainNodeAwaitFn<StartInput, Node>,
  upstreamErrorCb: ChainNodeErrorCb<Node>,
) => {
  const awaitFn: ChainNodeAwaitFn<StartInput, Node> = (arg, resultCb, _errorCb, controller) =>
    parentAwaitFn(arg, resultCb, upstreamErrorCb, controller)

  return addSharedProperties<StartInput, ParentNode, Node, AccumulatedTypes, Defaults>(
    function ChainFn<
      S extends ChainNodePossibleGenerics = {},
      NewDefaults extends ChainNodePossibleGenerics = {},
      UpdatedDefaults extends ChainNodeGenerics = LMerge<
        Defaults,
        NewDefaults
      > extends ChainNodeGenerics
        ? LMerge<Defaults, NewDefaults>
        : never,
      Child extends ChainNodeGenerics = LMerge<UpdatedDefaults, S> extends ChainNodeGenerics
        ? LMerge<UpdatedDefaults, S>
        : never,
      ChildAccumulatedTypes extends ChainNodeAccumulatedTypes = {
        AccumulatedErrors: AccumulatedTypes['AccumulatedErrors'] | Child['Error']
        AccumulatedOutputs: AccumulatedTypes['AccumulatedOutputs'] | Child['Output']
        AccumulatedResultResolverControllers:
          | AccumulatedTypes['AccumulatedResultResolverControllers']
          | Child['ResultResolverController']
        AccumulatedErrorResolverControllers:
          | AccumulatedTypes['AccumulatedErrorResolverControllers']
          | Child['ErrorResolverController']
      },
    >(asyncFunction: ChainNodeAsyncFn<Node, Child, ChildAccumulatedTypes>) {
      return newNode<StartInput, Node, Child, ChildAccumulatedTypes, UpdatedDefaults>(
        asyncFunction,
        (arg, resultCb, errorCb, controller) => awaitFn(arg, resultCb, errorCb, controller),
      )
    } as unknown as ChainNode<StartInput, ParentNode, Node, AccumulatedTypes, Defaults>,
    awaitFn,
    errorNode,
  )
}
function newNode<
  StartInput,
  ParentNode extends ChainNodeGenerics,
  Node extends ChainNodeGenerics,
  AccumulatedTypes extends ChainNodeAccumulatedTypes,
  Defaults extends ChainNodeGenerics,
>(
  asyncFn: ChainNodeAsyncFn<ParentNode, Node, AccumulatedTypes>,
  parentAwaitFn?: ChainNodeAwaitFn<StartInput, ParentNode>,
) {
  const awaitFn: ChainNodeAwaitFn<StartInput, Node> = (input, resultCb, errorCb, controller) => {
    const execute = (inputArg: StartInput | ParentNode['Output']) => {
      const pins = functionAssign(
        // eslint-disable-next-line prefer-arrow-callback
        function PinsFn(resultArg) {
          return pins.result(resultArg)
        } as unknown as Pins<Node, AccumulatedTypes>,
        {
          result(resultArg: Node['Output']) {
            controller.controller = undefined
            const res = resultCb(resultArg)
            controller.controller = res
            return res
          },
          error(errorArg: Node['Error']) {
            return errorCb(errorArg, pins.result)
          },
        },
      )
      return asyncFn(inputArg, pins)
    }
    controller.controller = undefined
    if (parentAwaitFn) return parentAwaitFn(input, execute, errorCb as any, controller as any)
    controller.controller = execute(input)
    return controller
  }

  return addSharedProperties<StartInput, ParentNode, Node, AccumulatedTypes, Defaults>(
    function ChainFn<
      S extends ChainNodePossibleGenerics = {},
      NewDefaults extends ChainNodePossibleGenerics = {},
      UpdatedDefaults extends ChainNodeGenerics = LMerge<
        Defaults,
        NewDefaults
      > extends ChainNodeGenerics
        ? LMerge<Defaults, NewDefaults>
        : never,
      Child extends ChainNodeGenerics = LMerge<UpdatedDefaults, S> extends ChainNodeGenerics
        ? LMerge<UpdatedDefaults, S>
        : never,
      ChildAccumulatedTypes extends ChainNodeAccumulatedTypes = {
        AccumulatedErrors: AccumulatedTypes['AccumulatedErrors'] | Child['Error']
        AccumulatedOutputs: AccumulatedTypes['AccumulatedOutputs'] | Child['Output']
        AccumulatedResultResolverControllers:
          | AccumulatedTypes['AccumulatedResultResolverControllers']
          | Child['ResultResolverController']
        AccumulatedErrorResolverControllers:
          | AccumulatedTypes['AccumulatedErrorResolverControllers']
          | Child['ErrorResolverController']
      },
    >(asyncFunction: ChainNodeAsyncFn<Node, Child, ChildAccumulatedTypes>) {
      return newNode<StartInput, Node, Child, ChildAccumulatedTypes, UpdatedDefaults>(
        asyncFunction,
        (arg, resultCb, errorCb, controller) =>
          awaitFn(arg, resultCb as any, errorCb as any, controller as any),
      )
    } as unknown as ChainNode<StartInput, ParentNode, Node, AccumulatedTypes, Defaults>,
    awaitFn,
    errorNode,
  )
}

// const chain = <
//   T extends {
//     Output?: unknown
//     Error?: unknown
//     ResultResolverController?: unknown
//     ErrorResolverController?: unknown
//     Input?: unknown
//   } = {},
//   Defaults extends Partial<ChainNodeGenericsWithInputOutput> = {},
//   NormalisedDefaults extends ChainNodeGenericsWithInputOutput = LMerge<
//     NeverChainNodeGenerics,
//     Defaults
//   >,
//   FinalDefaults extends ChainNodeGenericsWithInput = {
//     Input: NormalisedDefaults['InputOutput']
//     Error: NormalisedDefaults['Error']
//     Output: NormalisedDefaults['InputOutput']
//     ResultResolverController: NormalisedDefaults['ResultResolverController']
//     ErrorResolverController: NormalisedDefaults['ErrorResolverController']
//   },
//   Node extends ChainNodeGenericsWithInput = LMerge<
//     FinalDefaults,
//     T
//   > extends ChainNodeGenericsWithInput
//     ? LMerge<FinalDefaults, T>
//     : never,
//   AccumulatedTypes extends ChainNodeAccumulatedTypes = {
//     AccumulatedErrors: Node['Error']
//     AccumulatedOutputs: Node['Output']
//     AccumulatedResultResolverControllers: Node['ResultResolverController']
//     AccumulatedErrorResolverControllers: Node['ErrorResolverController']
//   },
// >(
//   options?: ChainOptions,
// ) => {
//   const opts: ChainOptions = {
//     asyncByDefault: true,
//     ...options,
//   }

//   function fn<
//     S extends ChainNodePossibleGenerics = {},
//     NewDefaults extends ChainNodePossibleGenerics = {},
//     UpdatedDefaults extends ChainNodeGenerics = LMerge<
//       FinalDefaults,
//       NewDefaults
//     > extends ChainNodeGenerics
//       ? LMerge<FinalDefaults, NewDefaults>
//       : never,
//     Child extends ChainNodeGenerics = LMerge<UpdatedDefaults, S> extends ChainNodeGenerics
//       ? LMerge<UpdatedDefaults, S>
//       : never,
//     ChildAccumulatedTypes extends ChainNodeAccumulatedTypes = {
//       AccumulatedErrors: AccumulatedTypes['AccumulatedErrors'] | Child['Error']
//       AccumulatedOutputs: AccumulatedTypes['AccumulatedOutputs'] | Child['Output']
//       AccumulatedResultResolverControllers:
//         | AccumulatedTypes['AccumulatedResultResolverControllers']
//         | Child['ResultResolverController']
//       AccumulatedErrorResolverControllers:
//         | AccumulatedTypes['AccumulatedErrorResolverControllers']
//         | Child['ErrorResolverController']
//     },
//   >(asyncFunction: ChainNodeAsyncFn<Node, Child, ChildAccumulatedTypes>) {
//     return newNode<Node['Input'], Node, Child, ChildAccumulatedTypes, UpdatedDefaults>(
//       asyncFunction,
//     )
//   }
//   return Object.assign(fn, {
//     breakChain: false,
//     controller: undefined,
//   })
// }

// type z = RenameProperty<{}, 'Input', 'Output'>

const chain = <
  RootNodeTypes extends {
    Input?: unknown
    ResultResolverController?: unknown
    ErrorResolverController?: unknown
  } = {},
  NodeTypes extends ChainNodePossibleGenerics = {},
  Defaults extends Partial<ChainNodeGenericsWithInputOutput> = {},
  FinalDefaults extends ChainNodeGenerics = RenameProperty<
    LMerge<NeverChainNodeGenerics, Defaults>,
    'InputOutput',
    'Output'
  >,
  FakeRootNode extends ChainNodeGenerics = LMerge<
    FinalDefaults,
    RenameProperty<RootNodeTypes, 'Input', 'Output'>
  > extends ChainNodeGenerics
    ? LMerge<FinalDefaults, RenameProperty<RootNodeTypes, 'Input', 'Output'>>
    : never,
  Node extends ChainNodeGenerics = LMerge<FinalDefaults, NodeTypes> extends ChainNodeGenerics
    ? LMerge<FinalDefaults, NodeTypes>
    : never,
  AccumulatedTypes extends ChainNodeAccumulatedTypes = {
    AccumulatedErrors: Node['Error']
    AccumulatedOutputs: Node['Output']
    AccumulatedResultResolverControllers:
      | FakeRootNode['ResultResolverController']
      | Node['ResultResolverController']
    AccumulatedErrorResolverControllers:
      | FakeRootNode['ErrorResolverController']
      | Node['ErrorResolverController']
  },
>(
  asyncFunction: ChainNodeAsyncFn<FakeRootNode, Node, AccumulatedTypes>,
) =>
  newNode<FakeRootNode['Output'], FakeRootNode, Node, AccumulatedTypes, FinalDefaults>(
    asyncFunction,
  )

// const chn1 = chain<
//   { Input: string; },
//   { Output: number },
//   { ResultResolverController: void }
// >('a' as any)

// function fn<
//   S extends ChainNodePossibleGenerics = {},
//   NewDefaults extends ChainNodePossibleGenerics = {},
//   UpdatedDefaults extends ChainNodeGenerics = LMerge<
//     FinalDefaults,
//     NewDefaults
//   > extends ChainNodeGenerics
//     ? LMerge<FinalDefaults, NewDefaults>
//     : never,
//   Child extends ChainNodeGenerics = LMerge<UpdatedDefaults, S> extends ChainNodeGenerics
//     ? LMerge<UpdatedDefaults, S>
//     : never,
//   ChildAccumulatedTypes extends ChainNodeAccumulatedTypes = {
//     AccumulatedErrors: AccumulatedTypes['AccumulatedErrors'] | Child['Error']
//     AccumulatedOutputs: AccumulatedTypes['AccumulatedOutputs'] | Child['Output']
//     AccumulatedResultResolverControllers:
//       | AccumulatedTypes['AccumulatedResultResolverControllers']
//       | Child['ResultResolverController']
//     AccumulatedErrorResolverControllers:
//       | AccumulatedTypes['AccumulatedErrorResolverControllers']
//       | Child['ErrorResolverController']
//   },
// >(asyncFunction: ChainNodeAsyncFn<Node, Child, ChildAccumulatedTypes>) {
//   return newNode<Node['Input'], Node, Child, ChildAccumulatedTypes, UpdatedDefaults>(
//     asyncFunction,
//   )
// }

// }

export default chain
