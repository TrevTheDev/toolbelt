/* eslint-disable prefer-arrow-callback */
/* eslint-disable no-use-before-define */
/* eslint-disable @typescript-eslint/ban-types */
import { Union, LMerge, RenameProperty } from './typescript utils.js'

export const chainNodeType = Symbol('Chain Node')

type ResultResolver<Result, ResultResolverController> = (result: Result) => ResultResolverController
type ErrorResolver<Error, ErrorResolverController> = (error: Error) => ErrorResolverController

type ResultCb<T, ResultCbController> = (result: T) => ResultCbController
export type ErrorCb<Error, Output, ResultResolverController, ErrorCbController> = (
  error: Error,
  result: ResultResolver<Output, ResultResolverController>,
) => ErrorCbController

export type AwaitedChainController<AccumulatedAsyncFnController> = {
  controller: AccumulatedAsyncFnController
}

export type ChainGenerics = {
  Input: unknown
  Output: unknown
  AccumulatedOutputs: unknown
  AccumulatedErrors: unknown
  AccumulatedResultResolverControllers: unknown
  AccumulatedErrorResolverControllers: unknown
  Defaults: ChainNodeGenerics
}

export type ChainNodeGenerics = {
  Error: unknown
  Output: unknown
  ResultResolverController: unknown
  ErrorResolverController: unknown
}

export type ChainNodePossibleGenerics = Partial<ChainNodeGenerics>

export type ChainNodeGenericsWithInputOutput = Union<
  Omit<ChainNodeGenerics, 'Output'>,
  { InputOutput: unknown }
>

export type NeverChainNodeGenerics = { [k in keyof ChainNodeGenericsWithInputOutput]: never }

export type ResolverA<
  Error,
  Output,
  ResultResolverController,
  AccumulatedErrorResolverControllers,
> = {
  (result: Output): ResultResolverController
  result: ResultResolver<Output, ResultResolverController>
  error: ErrorResolver<Error, AccumulatedErrorResolverControllers>
}

export type Resolver<C extends ChainGenerics, Node extends ChainNodeGenerics> = ResolverA<
  Node['Error'],
  Node['Output'],
  Node['ResultResolverController'],
  C['AccumulatedErrorResolverControllers']
>

export type AsyncFn<
  Chain extends ChainGenerics,
  ParentNode extends ChainNodeGenerics,
  Node extends ChainNodeGenerics,
> = (
  input: ParentNode['Output'],
  resolver: Resolver<Chain, Node>,
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

type AccumulatedErrorCb<Chain extends ChainGenerics> = ErrorCb<
  Chain['AccumulatedErrors'],
  Chain['AccumulatedOutputs'],
  Chain['AccumulatedResultResolverControllers'],
  Chain['AccumulatedErrorResolverControllers']
>

type ChainNodeController<Controller> = AwaitedChainController<Controller>

type ChainNodeAwaitFn<Chain extends ChainGenerics, Node extends ChainNodeGenerics> = (
  input: Chain['Input'],
  resultCb: ChainNodeResultCb<Node>,
  controller: ChainNodeController<Node['ResultResolverController']>,
  errorCb?: ChainNodeErrorCb<Node>,
) => AwaitedChainController<Node['ResultResolverController']>

type AccumulateChainNodeAwaitFn<C extends ChainGenerics, Node extends ChainNodeGenerics> = (
  input: C['Input'],
  resultCb: ChainNodeResultCb<Node>,
  controller: ChainNodeController<C['AccumulatedResultResolverControllers']>,
  errorCb?: AccumulatedErrorCb<C>,
) => AwaitedChainController<C['AccumulatedResultResolverControllers']>

export type ResultCall<
  Chain extends ChainGenerics,
  Node extends ChainNodeGenerics,
  Async extends boolean = true,
> = <
  NodeTypes extends ChainNodePossibleGenerics = {},
  UpdateDefaults extends ChainNodePossibleGenerics = {},
  UpdatedDefaults extends ChainNodeGenerics = LMerge<
    Chain['Defaults'],
    UpdateDefaults
  > extends ChainNodeGenerics
    ? LMerge<Chain['Defaults'], UpdateDefaults>
    : never,
  Child extends ChainNodeGenerics = LMerge<UpdatedDefaults, NodeTypes> extends ChainNodeGenerics
    ? LMerge<UpdatedDefaults, NodeTypes>
    : never,
  UpdatedC extends ChainGenerics = {
    Input: Chain['Input']
    Output: Child['Output']
    AccumulatedErrors: Chain['AccumulatedErrors'] | Child['Error']
    AccumulatedOutputs: Chain['AccumulatedOutputs'] | Child['Output']
    AccumulatedResultResolverControllers:
      | Chain['AccumulatedResultResolverControllers']
      | Child['ResultResolverController']
    AccumulatedErrorResolverControllers:
      | Chain['AccumulatedErrorResolverControllers']
      | Child['ErrorResolverController']
    Defaults: UpdatedDefaults
  },
  // nextChainNode = ChainNode<UpdatedC, Node, Child>,
>(
  ...arg: Async extends true
    ? [asyncFunction: AsyncFn<UpdatedC, Node, Child>]
    : [syncFunction: (input: Node['Output']) => Child['Output']]
) => ChainNode<UpdatedC, Child>

export type SharedProperties<Chain extends ChainGenerics, Node extends ChainNodeGenerics> = {
  type: typeof chainNodeType
  onError(callback: AccumulatedErrorCb<Chain>): ChainNode<Chain, Node>
  await(
    input: Chain['Input'],
    resultCb: ChainNodeResultCb<Node>,
    errorCb?: AccumulatedErrorCb<Chain>,
  ): AwaitedChainController<Chain['AccumulatedResultResolverControllers']>
  // sync: ResultCall<Chain, Node, false>
  splice<
    SubChain extends ChainGenerics,
    SubChainFinalNode extends ChainNodeGenerics,
    UpdatedC extends ChainGenerics = LMerge<
      Chain,
      {
        Output: SubChain['Output']
        AccumulatedErrors: Chain['AccumulatedErrors'] | SubChain['AccumulatedErrors']
        AccumulatedOutputs: Chain['AccumulatedOutputs'] | SubChain['AccumulatedOutputs']
        AccumulatedResultResolverControllers:
          | Chain['AccumulatedResultResolverControllers']
          | SubChain['AccumulatedResultResolverControllers']
        AccumulatedErrorResolverControllers:
          | Chain['AccumulatedErrorResolverControllers']
          | SubChain['AccumulatedErrorResolverControllers']
      }
    >,
    ProxyNode extends ChainNodeGenerics = {
      Error: UpdatedC['AccumulatedErrors']
      Output: UpdatedC['Output']
      ResultResolverController: UpdatedC['AccumulatedResultResolverControllers']
      ErrorResolverController: UpdatedC['AccumulatedErrorResolverControllers']
    },
  >(
    subChain: ChainNode<SubChain, SubChainFinalNode>,
  ): ChainNode<UpdatedC, ProxyNode>
  // input(input: Chain['Input']): PromiseLike<Chain['Output']>
}

export type ChainNode<
  Chain extends ChainGenerics,
  Node extends ChainNodeGenerics,
  ChnNode = ResultCall<Chain, Node> & SharedProperties<Chain, Node>,
> = ChnNode

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

const functionAssign = <T extends Function, S extends Object, R = T & S>(fn: T, obj: S) =>
  Object.assign(fn, obj) as R

const resultCall = <Chain extends ChainGenerics, Node extends ChainNodeGenerics>(
  awaitFn: ChainNodeAwaitFn<Chain, Node>,
) => {
  const dFn: ResultCall<Chain, Node, true> = function ChainFn<
    NodeTypes extends ChainNodePossibleGenerics = {},
    UpdateDefaults extends ChainNodePossibleGenerics = {},
    UpdatedDefaults extends ChainNodeGenerics = LMerge<
      Chain['Defaults'],
      UpdateDefaults
    > extends ChainNodeGenerics
      ? LMerge<Chain['Defaults'], UpdateDefaults>
      : never,
    Child extends ChainNodeGenerics = LMerge<UpdatedDefaults, NodeTypes> extends ChainNodeGenerics
      ? LMerge<UpdatedDefaults, NodeTypes>
      : never,
    UpdatedC extends ChainGenerics = {
      Input: Chain['Input']
      Output: Child['Output']
      AccumulatedErrors: Chain['AccumulatedErrors'] | Child['Error']
      AccumulatedOutputs: Chain['AccumulatedOutputs'] | Child['Output']
      AccumulatedResultResolverControllers:
        | Chain['AccumulatedResultResolverControllers']
        | Child['ResultResolverController']
      AccumulatedErrorResolverControllers:
        | Chain['AccumulatedErrorResolverControllers']
        | Child['ErrorResolverController']
      Defaults: UpdatedDefaults
    },
  >(asyncFunction: AsyncFn<UpdatedC, Node, Child>) {
    return newNode<UpdatedC, Node, Child>(asyncFunction, (arg, resultCb, errorCb, controller) =>
      awaitFn(arg, resultCb, errorCb, controller),
    )
  }
  return dFn
}

const addSharedProperties = <Chain extends ChainGenerics, Node extends ChainNodeGenerics>(
  fn: ResultCall<Chain, Node>,
  awaitFn: AccumulateChainNodeAwaitFn<Chain, Node>,
  errorNodeFn: typeof errorNode<Chain, Node>,
): ChainNode<Chain, Node> => {
  const sharedProperties: SharedProperties<Chain, Node> = {
    type: chainNodeType,
    await(arg, resultCb, errorCb) {
      return awaitFn(arg, resultCb, { controller: undefined }, errorCb)
    },
    onError(errorCb) {
      return errorNodeFn(awaitFn, errorCb)
    },
    splice<
      SubChain extends ChainGenerics,
      SubChainFinalNode extends ChainNodeGenerics,
      UpdatedC extends ChainGenerics = LMerge<
        Chain,
        {
          Output: SubChain['Output']
          AccumulatedErrors: Chain['AccumulatedErrors'] | SubChain['AccumulatedErrors']
          AccumulatedOutputs: Chain['AccumulatedOutputs'] | SubChain['AccumulatedOutputs']
          AccumulatedResultResolverControllers:
            | Chain['AccumulatedResultResolverControllers']
            | SubChain['AccumulatedResultResolverControllers']
          AccumulatedErrorResolverControllers:
            | Chain['AccumulatedErrorResolverControllers']
            | SubChain['AccumulatedErrorResolverControllers']
        }
      >,
      ProxyNode extends ChainNodeGenerics = {
        Error: UpdatedC['AccumulatedErrors']
        Output: UpdatedC['Output']
        ResultResolverController: UpdatedC['AccumulatedResultResolverControllers']
        ErrorResolverController: UpdatedC['AccumulatedErrorResolverControllers']
      },
    >(subChain: ChainNode<SubChain, SubChainFinalNode>) {
      return fn<{}, {}, ChainNodeGenerics, ProxyNode, UpdatedC>((input, resolver) => {
        subChain.await(
          input,
          (result) => resolver.result(result),
          (error) => resolver.error(error),
        )
      })
    },
  }
  return functionAssign(fn, sharedProperties)
}

const errorNode = <Chain extends ChainGenerics, Node extends ChainNodeGenerics>(
  parentAwaitFn: ChainNodeAwaitFn<Chain, Node>,
  upstreamErrorCb: ChainNodeErrorCb<Node>,
): ChainNode<Chain, Node> => {
  const awaitFn: ChainNodeAwaitFn<Chain, Node> = (
    arg,
    resultCb,
    controller,
    _errorCb, // TODO: consider adding error bubbling
  ) => parentAwaitFn(arg, resultCb, controller, upstreamErrorCb)
  return addSharedProperties<Chain, Node>(resultCall<Chain, Node>(awaitFn), awaitFn, errorNode)
}

function newNode<
  C extends ChainGenerics,
  ParentNode extends ChainNodeGenerics,
  Node extends ChainNodeGenerics,
>(asyncFn: AsyncFn<C, ParentNode, Node>, parentAwaitFn?: ChainNodeAwaitFn<C, ParentNode>) {
  const awaitFn: ChainNodeAwaitFn<C, Node> = (input, resultCb, controller, errorCb) => {
    const execute = (inputArg: C['Input'] | ParentNode['Output']) => {
      const pins = functionAssign(
        function PinsFn(resultArg: Node['Output']) {
          return pins.result(resultArg)
        },
        {
          result(resultArg: Node['Output']) {
            controller.controller = undefined
            const res = resultCb(resultArg)
            controller.controller = res
            return res
          },
          error(errorArg: Node['Error']) {
            return (errorCb as ChainNodeErrorCb<Node>)(errorArg, pins.result)
          },
        },
      )
      return asyncFn(inputArg, pins)
    }
    controller.controller = undefined
    if (parentAwaitFn) {
      return parentAwaitFn(
        input,
        execute,
        controller,
        errorCb as unknown as ChainNodeErrorCb<ParentNode>,
      )
    }
    controller.controller = execute(input)
    return controller
  }
  return addSharedProperties<C, Node>(resultCall<C, Node>(awaitFn), awaitFn, errorNode)
}

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
  Chain extends ChainGenerics = {
    Input: FakeRootNode['Output']
    Output: Node['Output']
    AccumulatedErrors: Node['Error']
    AccumulatedOutputs: Node['Output']
    AccumulatedResultResolverControllers:
      | FakeRootNode['ResultResolverController']
      | Node['ResultResolverController']
    AccumulatedErrorResolverControllers:
      | FakeRootNode['ErrorResolverController']
      | Node['ErrorResolverController']
    Defaults: FinalDefaults
  },
>(
  asyncFunction: AsyncFn<Chain, FakeRootNode, Node>,
) => newNode<Chain, FakeRootNode, Node>(asyncFunction)

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
