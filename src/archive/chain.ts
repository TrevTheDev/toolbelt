/* eslint-disable prefer-arrow-callback */
/* eslint-disable @typescript-eslint/ban-types */
import { Union, LMerge, RenameProperty } from './typescript utils'

export const chainNodeType = Symbol('Chain Node')

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

type NeverChainNodeGenericsWithInputOutput = {
  [k in keyof ChainNodeGenericsWithInputOutput]: never
}

type NeverChainNodeGenerics = {
  [k in keyof ChainNodeGenerics]: never
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

type ResultResolver<
  Result,
  ResultResolverController,
  RT = (result: Result) => ResultResolverController,
> = RT

type ErrorResolver<
  Error,
  ErrorResolverController,
  RT = (error: Error) => ErrorResolverController,
> = RT

type ResultCb<T, ResultCbController, RT = (result: T) => ResultCbController> = RT
export type ErrorCb<
  Error,
  Output,
  ResultResolverController,
  ErrorCbController,
  RT = (
    error: Error,
    result: ResultResolver<Output, ResultResolverController>,
  ) => ErrorCbController,
> = RT

export type AwaitedChainController<AccumulatedAsyncFnController> = {
  controller: AccumulatedAsyncFnController
}

export type Resolver<
  Error,
  Output,
  ResultResolverController,
  AccumulatedErrorResolverControllers,
  RT = {
    (result: Output): ResultResolverController
    result: ResultResolver<Output, ResultResolverController>
    error: ErrorResolver<Error, AccumulatedErrorResolverControllers>
  },
> = RT

type ChainNodeController<Controller> = AwaitedChainController<Controller>

// export type Resolver<
//   Chain extends ChainGenerics,
//   Node extends ChainNodeGenerics,
//   RT = ResolverA<
//     Node['Error'],
//     Node['Output'],
//     Node['ResultResolverController'],
//     Chain['AccumulatedErrorResolverControllers']
//   >,
// > = RT

// export type AsyncFn<
//   Chain extends ChainGenerics,
//   ParentNode extends ChainNodeGenerics,
//   Node extends ChainNodeGenerics,
//   RT = (
//     input: ParentNode['Output'],
//     resolver: Resolver<Chain, Node>,
//   ) => ParentNode['ResultResolverController'],
// > = RT

// type ChainNodeResultCb<
//   Node extends {
//     Output: unknown
//     ResultResolverController: unknown
//   },
//   RT = ResultCb<Node['Output'], Node['ResultResolverController']>,
// > = RT

// type ChainNodeErrorCb<
//   Node extends ChainNodeGenerics,
//   RT = ErrorCb<
//     Node['Error'],
//     Node['Output'],
//     Node['ResultResolverController'],
//     Node['ErrorResolverController']
//   >,
// > = RT

// type AccumulatedErrorCb<
//   Chain extends ChainGenerics,
//   RT = ErrorCb<
//     Chain['AccumulatedErrors'],
//     Chain['AccumulatedOutputs'],
//     Chain['AccumulatedResultResolverControllers'],
//     Chain['AccumulatedErrorResolverControllers']
//   >,
// > = RT

// type ChainNodeAwaitFn<
//   Chain extends ChainGenerics,
//   Node extends ChainNodeGenerics,
//   RT = (
//     input: Chain['Input'],
//     resultCb: ChainNodeResultCb<Node>,
//     controller: ChainNodeController<Node['ResultResolverController']>,
//     errorCb?: ChainNodeErrorCb<Node>,
//   ) => AwaitedChainController<Node['ResultResolverController']>,
// > = RT

// type AccumulateChainNodeAwaitFn<
//   Chain extends ChainGenerics,
//   Node extends ChainNodeGenerics,
//   RT = (
//     input: Chain['Input'],
//     resultCb: ChainNodeResultCb<Node>,
//     controller: ChainNodeController<Chain['AccumulatedResultResolverControllers']>,
//     errorCb?: AccumulatedErrorCb<Chain>,
//   ) => AwaitedChainController<Chain['AccumulatedResultResolverControllers']>,
// > = RT

// export type ResultCall<
//   Chain extends ChainGenerics,
//   Node extends ChainNodeGenerics,
//   Async extends boolean = true,
//   RT = <
//     NodeTypes extends ChainNodePossibleGenerics = {},
//     UpdateDefaults extends ChainNodePossibleGenerics = {},
//     UpdatedDefaults extends ChainNodeGenerics = LMerge<
//       Chain['Defaults'],
//       UpdateDefaults
//     > extends ChainNodeGenerics
//       ? LMerge<Chain['Defaults'], UpdateDefaults>
//       : never,
//     Child extends ChainNodeGenerics = LMerge<UpdatedDefaults, NodeTypes> extends ChainNodeGenerics
//       ? LMerge<UpdatedDefaults, NodeTypes>
//       : never,
//     UpdatedC extends ChainGenerics = {
//       Input: Chain['Input']
//       Output: Child['Output']
//       AccumulatedErrors: Chain['AccumulatedErrors'] | Child['Error']
//       AccumulatedOutputs: Chain['AccumulatedOutputs'] | Child['Output']
//       AccumulatedResultResolverControllers:
//         | Chain['AccumulatedResultResolverControllers']
//         | Child['ResultResolverController']
//       AccumulatedErrorResolverControllers:
//         | Chain['AccumulatedErrorResolverControllers']
//         | Child['ErrorResolverController']
//       Defaults: UpdatedDefaults
//     },
//     // nextChainNode = ChainNode<UpdatedC, Node, Child>,
//   >(
//     ...arg: Async extends true
//       ? [asyncFunction: AsyncFn<UpdatedC, Node, Child>]
//       : [syncFunction: (input: Node['Output']) => Child['Output']]
//   ) => ChainNode<UpdatedC, Child>,
// > = RT

// type Splice<Chain extends ChainGenerics> = <
//   SubChain extends ChainGenerics,
//   SubChainFinalNode extends ChainNodeGenerics,
//   UpdatedChain extends ChainGenerics = LMerge<
//     Chain,
//     {
//       Output: SubChain['Output']
//       AccumulatedErrors: Chain['AccumulatedErrors'] | SubChain['AccumulatedErrors']
//       AccumulatedOutputs: Chain['AccumulatedOutputs'] | SubChain['AccumulatedOutputs']
//       AccumulatedResultResolverControllers:
//         | Chain['AccumulatedResultResolverControllers']
//         | SubChain['AccumulatedResultResolverControllers']
//       AccumulatedErrorResolverControllers:
//         | Chain['AccumulatedErrorResolverControllers']
//         | SubChain['AccumulatedErrorResolverControllers']
//     }
//   >,
//   ProxyNode extends ChainNodeGenerics = {
//     Error: UpdatedChain['AccumulatedErrors']
//     Output: UpdatedChain['Output']
//     ResultResolverController: UpdatedChain['AccumulatedResultResolverControllers']
//     ErrorResolverController: UpdatedChain['AccumulatedErrorResolverControllers']
//   },
// >(
//   subChain: ChainNode<SubChain, SubChainFinalNode>,
// ) => ChainNode<UpdatedChain, ProxyNode>

// export type SharedProperties<
//   Chain extends ChainGenerics,
//   Node extends ChainNodeGenerics,
//   RT = {
//     type: typeof chainNodeType
//     onError(callback: AccumulatedErrorCb<Chain>): ChainNode<Chain, Node>
//     await(
//       input: Chain['Input'],
//       resultCb: ChainNodeResultCb<Node>,
//       errorCb?: AccumulatedErrorCb<Chain>,
//     ): AwaitedChainController<Chain['AccumulatedResultResolverControllers']>
//     // sync: ResultCall<Chain, Node, false>
//     splice: Splice<Chain>
//     // input(input: Chain['Input']): PromiseLike<Chain['Output']>
//   },
// > = RT

// export type ChainNode<Chain extends ChainGenerics, Node extends ChainNodeGenerics> = ResultCall<
//   Chain,
//   Node
// > &
//   SharedProperties<Chain, Node>

export type ChainNode<
  Chain extends ChainGenerics,
  Node extends ChainNodeGenerics,
  ParentNode extends ChainNodeGenerics = never,
  Async extends boolean = true,
  RT extends {
    resultCall: unknown
    accumulatedErrorCb: unknown
    chainNodeResultCb: unknown
    splice: unknown
    resolver: unknown
    chainNodeErrorCb: unknown
  } = {
    resultCall: <
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
      UpdatedChain extends ChainGenerics = {
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
    >(
      ...arg: Async extends true
        ? [asyncFunction: ChainNode<UpdatedChain, Child, Node>['asyncFn']]
        : [syncFunction: (input: Node['Output']) => Child['Output']]
    ) => ChainNode<UpdatedChain, Child, Node>['type']
    splice: <
      SubChain extends ChainGenerics,
      SubChainFinalNode extends ChainNodeGenerics,
      UpdatedChain extends ChainGenerics = LMerge<
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
        Error: UpdatedChain['AccumulatedErrors']
        Output: UpdatedChain['Output']
        ResultResolverController: UpdatedChain['AccumulatedResultResolverControllers']
        ErrorResolverController: UpdatedChain['AccumulatedErrorResolverControllers']
      },
    >(
      subChain: ChainNode<SubChain, SubChainFinalNode>['type'],
    ) => ChainNode<UpdatedChain, ProxyNode, Node>['type']

    accumulatedErrorCb: ErrorCb<
      Chain['AccumulatedErrors'],
      Chain['AccumulatedOutputs'],
      Chain['AccumulatedResultResolverControllers'],
      Chain['AccumulatedErrorResolverControllers']
    >

    chainNodeErrorCb: ErrorCb<
      Node['Error'],
      Node['Output'],
      Node['ResultResolverController'],
      Node['ErrorResolverController']
    >

    chainNodeResultCb: ResultCb<Node['Output'], Node['ResultResolverController']>

    resolver: Resolver<
      Node['Error'],
      Node['Output'],
      Node['ResultResolverController'],
      Chain['AccumulatedErrorResolverControllers']
    >
  },
  ShareProp = {
    type: typeof chainNodeType
    onError(callback: RT['accumulatedErrorCb']): ChainNode<Chain, Node>['type']
    await(
      input: Chain['Input'],
      resultCb: RT['chainNodeResultCb'],
      errorCb?: RT['accumulatedErrorCb'],
    ): AwaitedChainController<Chain['AccumulatedResultResolverControllers']>
    splice: RT['splice']
    // sync: ResultCall<Chain, Node, false>
    // input(input: Chain['Input']): PromiseLike<Chain['Output']>
  },
  RT2 extends {
    chain: unknown
    node: unknown
    parentNode: unknown
    sharedProperties: unknown

    resultCall: unknown
    accumulatedErrorCb: unknown
    chainNodeResultCb: unknown
    splice: unknown
    resolver: unknown
    chainNodeErrorCb: unknown

    type: unknown
    parentChainNode: unknown
    accumulateChainNodeAwaitFn: unknown
    chainNodeAwaitFn: unknown
    asyncFn: unknown
  } = {
    chain: Chain
    node: Node
    parentNode: ParentNode
    resultCall: RT['resultCall']
    sharedProperties: ShareProp
    accumulatedErrorCb: RT['accumulatedErrorCb']
    chainNodeErrorCb: RT['chainNodeErrorCb']
    chainNodeResultCb: RT['chainNodeResultCb']
    splice: RT['splice']
    resolver: RT['resolver']
    type: RT['resultCall'] & ShareProp
    parentChainNode: [ParentNode] extends [never] ? never : ChainNode<Chain, ParentNode>

    accumulateChainNodeAwaitFn: (
      input: Chain['Input'],
      resultCb: RT['chainNodeResultCb'],
      controller: ChainNodeController<Chain['AccumulatedResultResolverControllers']>,
      errorCb?: RT['accumulatedErrorCb'],
    ) => AwaitedChainController<Chain['AccumulatedResultResolverControllers']>

    chainNodeAwaitFn: (
      input: Chain['Input'],
      resultCb: RT['chainNodeResultCb'],
      controller: ChainNodeController<Node['ResultResolverController']>,
      errorCb?: RT['chainNodeErrorCb'],
    ) => AwaitedChainController<Node['ResultResolverController']>

    asyncFn(
      input: ParentNode['Output'],
      resolver: RT['resolver'],
    ): ParentNode['ResultResolverController']
  },
> = RT2 extends infer O ? { [Key in keyof O]: O[Key] } : never

export type ChainFn = <
  FirstNodeTypes extends {
    Input?: unknown
    ResultResolverController?: unknown
    ErrorResolverController?: unknown
  } = {},
  NodeTypes extends ChainNodePossibleGenerics = {},
  Defaults extends Partial<ChainNodeGenericsWithInputOutput> = {},
  FinalDefaults extends ChainNodeGenerics = RenameProperty<
    LMerge<NeverChainNodeGenericsWithInputOutput, Defaults>,
    'InputOutput',
    'Output'
  >,
  ZeroNode extends ChainNodeGenerics = LMerge<
    FinalDefaults,
    RenameProperty<FirstNodeTypes, 'Input', 'Output'>
  > extends ChainNodeGenerics
    ? LMerge<FinalDefaults, RenameProperty<FirstNodeTypes, 'Input', 'Output'>>
    : never,
  Node extends ChainNodeGenerics = LMerge<FinalDefaults, NodeTypes> extends ChainNodeGenerics
    ? LMerge<FinalDefaults, NodeTypes>
    : never,
  Chain extends ChainGenerics = {
    Input: ZeroNode['Output']
    Output: Node['Output']
    AccumulatedErrors: Node['Error']
    AccumulatedOutputs: Node['Output']
    AccumulatedResultResolverControllers:
      | ZeroNode['ResultResolverController']
      | Node['ResultResolverController']
    AccumulatedErrorResolverControllers:
      | ZeroNode['ErrorResolverController']
      | Node['ErrorResolverController']
    Defaults: FinalDefaults
  },
>(
  asyncFunction: ChainNode<Chain, Node, ZeroNode>['asyncFn'],
) => ChainNode<Chain, Node, ZeroNode>['type']

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

// type ResultCallFn = <Chain extends ChainGenerics, Node extends ChainNodeGenerics>(
//   awaitFn: ChainNode<Chain, Node>['chainNodeAwaitFn'],
// ) => ChainNode<Chain, Node>['resultCall']

// type NewNodeFn = <
//   Chain extends ChainGenerics,
//   ParentNode extends ChainNodeGenerics,
//   Node extends ChainNodeGenerics,
// >(
//   asyncFn: ChainNode<Chain, Node, ParentNode>['asyncFn'],
//   parentAwaitFn?: ChainNode<Chain, ParentNode>['chainNodeAwaitFn'],
// ) => ChainNode<Chain, Node>['type']

// type ErrorNodeFn = <Chain extends ChainGenerics, Node extends ChainNodeGenerics>(
//   parentAwaitFn: ChainNode<Chain, Node>['chainNodeAwaitFn'],
//   upstreamErrorCb: ChainNode<Chain, Node>['chainNodeErrorCb'],
// ) => ChainNode<Chain, Node>['type']

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

let newNode: <T extends ChainNode<ChainGenerics, ChainNodeGenerics, ChainNodeGenerics>>(
  asyncFn: T['asyncFn'],
  parentAwaitFn?: T['parentChainNode']['chainNodeAwaitFn'],
) => T['type']

// parent not required
let errorNode: <T extends ChainNode<ChainGenerics, ChainNodeGenerics>>(
  parentAwaitFn: T['chainNodeAwaitFn'],
  upstreamErrorCb: T['chainNodeErrorCb'],
) => T['type']

// parent not required
const resultCall = <T extends ChainNode<ChainGenerics, ChainNodeGenerics, ChainNodeGenerics>>(
  awaitFn: T['chainNodeAwaitFn'],
) => {
  const dFn: T['resultCall'] = function chainFn(asyncFunction) {
    return newNode(asyncFunction, (arg, resultCb, errorCb, controller) =>
      awaitFn(arg, resultCb, errorCb, controller),
    )
  }
  return dFn
}

// parent not required
const addSharedProperties = <
  T extends ChainNode<ChainGenerics, ChainNodeGenerics, ChainNodeGenerics>,
>(
  fn: T['resultCall'],
  awaitFn: T['accumulateChainNodeAwaitFn'],
) => {
  const sharedProperties: T['sharedProperties'] = {
    type: chainNodeType,
    await(arg, resultCb, errorCb) {
      return awaitFn(arg, resultCb, { controller: undefined }, errorCb)
    },
    onError(errorCb) {
      return errorNode(awaitFn, errorCb)
    },
    splice(subChain) {
      return fn((input, resolver) =>
        subChain.await(
          input,
          (result) => resolver.result(result),
          (error) => resolver.error(error),
        ),
      )
    },
  }
  return Object.assign(fn, sharedProperties) as T['type']
}

// parent not required
errorNode = <T extends ChainNode<ChainGenerics, ChainNodeGenerics, ChainNodeGenerics>>(
  parentAwaitFn: T['chainNodeAwaitFn'],
  upstreamErrorCb: T['chainNodeErrorCb'],
) => {
  const awaitFn: T['chainNodeAwaitFn'] = (
    arg,
    resultCb,
    controller,
    _errorCb, // TODO: consider adding error bubbling
  ) => parentAwaitFn(arg, resultCb, controller, upstreamErrorCb)
  return addSharedProperties(resultCall(awaitFn), awaitFn)
}

newNode = function nNode<T extends ChainNode<ChainGenerics, ChainNodeGenerics, ChainNodeGenerics>>(
  asyncFn: T['asyncFn'],
  parentAwaitFn?: T['parentChainNode']['chainNodeAwaitFn'],
) {
  const awaitFn: T['chainNodeAwaitFn'] = (input, resultCb, controller, errorCb) => {
    const execute = (inputArg: T['chain']['Input'] & T['parentNode']['Output']) => {
      const pins = Object.assign(
        function PinsFn(resultArg: T['node']['Output']) {
          return pins.result(resultArg)
        },
        {
          result(resultArg: T['node']['Output']) {
            controller.controller = undefined
            const res = resultCb(resultArg)
            controller.controller = res
            return res
          },
          error(errorArg: T['node']['Error']) {
            if (errorCb) return errorCb(errorArg, pins.result)
            throw new Error('error callback not supplied')
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
        errorCb /* as ChainNode<Chain, ParentNode>['chainNodeErrorCb'] */,
      )
    }

    controller.controller = execute(input)
    return controller
  }
  return addSharedProperties<T>(resultCall<T>(awaitFn), awaitFn)
}

const chain: ChainFn = (asyncFunction) => newNode(asyncFunction)

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
