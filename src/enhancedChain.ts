/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable prefer-arrow-callback */
import chain, { ChainNode } from './chain'

import type {
  ChainNodePossibleGenerics,
  ChainGenerics,
  ChainNodeGenerics,
  ChainNodeGenericsWithInputOutput,
  NeverChainNodeGenericsWithInputOutput,
  AsyncFn,
  chainNodeType,
  ResultCall,
} from './chain'

import { LMerge, RenameProperty } from './typescript utils'
import { addOnTop } from './objectCompose'

type EnhanceChainOptions = {
  thrownErrorToErrorCb?: boolean
  enforceSingleResolution?: boolean
  wrapInSetImmediate?: boolean
  wrapInNextTick?: boolean
  resolveReturnedPromises?: boolean
  infinite?: boolean
  isThenable?: boolean
  handleSyncFunctions?: boolean
}

type LifecycleCallbacks = {
  beforeChainStart?: () => void
  beforeChainResult?: () => void
  afterChainResult?: () => void
  beforeChainError?: () => void
  afterChainError?: () => void

  beforeChainResolved?: () => void
  afterChainResolved?: () => void

  beforeNodeStart?: () => void
  beforeNodeResult?: () => void
  afterNodeResult?: () => void
  beforeNodeError?: () => void
  afterNodeError?: () => void

  onChainEmpty?: () => void
  onItemAddedToChain?: () => void
}

type EnhancedSharedProperties<Chain extends ChainGenerics, Node extends ChainNodeGenerics> = {
  type: typeof chainNodeType
  sync: ResultCall<Chain, Node, false>
  input(input: Chain['Input']): PromiseLike<Chain['Output']>
}

function errorTrappingChainNode<T extends ChainNode<ChainGenerics, ChainNodeGenerics>>(
  previousNode: T | typeof chain,
  asyncFn: AsyncFn<ChainGenerics, ChainNodeGenerics, ChainNodeGenerics>,
  traps: LifecycleCallbacks,
) {
  if (traps.onItemAddedToChain) traps.onItemAddedToChain()
  const nAsync = (input, resolver) => {
    if (traps.beforeNodeStart) traps.beforeNodeStart()
    const nResolver = Object.assign(
      function PinsFn(resultArg) {
        return nResolver.result(resultArg)
      },
      {
        result(resultArg) {
          if (traps.beforeNodeResult) traps.beforeNodeResult()
          const res = resolver.result(resultArg)
          if (traps.afterNodeResult) traps.afterNodeResult()
          return res
        },
        error(errorArg) {
          if (traps.beforeNodeError) traps.beforeNodeError()
          const res = resolver.error(errorArg)
          if (traps.afterNodeError) traps.afterNodeError()
          return res
        },
      },
    )
    return asyncFn(input, nResolver)
  }
  const nNode = previousNode(nAsync)

  const NNode = Object.assign(
    function NewNode(asyncFunc) {
      return errorTrappingChainNode(nNode, asyncFunc, traps)
    },
    {
      onError(errorCb) {
        nNode.onError((error) => {
          if (traps.beforeChainResolved) traps.beforeChainResolved()
          if (traps.beforeChainError) traps.beforeChainError()
          const res = errorCb(error)
          if (traps.afterChainError) traps.afterChainError()
          if (traps.afterChainResolved) traps.afterChainResolved()
          return res
        })
      },
      // splice(subChain) {
      //   const newNode = nNode.splice(subChain)
      //   return errorTrappingChainNode(newNode,asyncFn,traps)
      // },
      await(input, resultCb, errorCb) {
        if (traps.beforeChainStart) traps.beforeChainStart()
        return nNode.await(
          input,
          (result) => {
            if (traps.beforeChainResolved) traps.beforeChainResolved()
            if (traps.beforeChainResult) traps.beforeChainResult()
            const res = resultCb(result)
            if (traps.afterChainResult) traps.afterChainResult()
            if (traps.afterChainResolved) traps.afterChainResolved()
            return res
          },
          (error) => {
            if (traps.beforeChainResolved) traps.beforeChainResolved()
            if (traps.beforeChainError) traps.beforeChainError()
            const res = errorCb(error)
            if (traps.afterChainError) traps.afterChainError()
            if (traps.afterChainResolved) traps.afterChainResolved()
            return res
          },
        )
      },
    },
  ) as T
  return NNode
}

// const errorTrappingChainNode = <T extends ChainNode<ChainGenerics, ChainNodeGenerics>>(
//   asyncFn: T,
//   traps: LifecycleCallbacks,
// ) => {

// }

const errorTrappingChain = <T>(chainer: T, traps: LifecycleCallbacks) => {
  const NNode = ((asyncFunction: AsyncFn<ChainGenerics, ChainNodeGenerics, ChainNodeGenerics>) =>
    errorTrappingChainNode(chainer, asyncFunction, traps)) as T

  return NNode
}

const enhancedChain = (
  options: EnhanceChainOptions = {},
  lifecycleCallbacks: LifecycleCallbacks = {},
) => {
  const opts = {
    thrownErrorToErrorCb: true,
    enforceSingleResolution: true,
    wrapInSetImmediate: true,
    resolveReturnedPromises: true,
    infinite: false,
    isThenable: true,
    handleSyncFunctions: true,
    ...options,
  }

  return <
    RootNodeTypes extends {
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
    RootNode extends ChainNodeGenerics = LMerge<
      FinalDefaults,
      RenameProperty<RootNodeTypes, 'Input', 'Output'>
    > extends ChainNodeGenerics
      ? LMerge<FinalDefaults, RenameProperty<RootNodeTypes, 'Input', 'Output'>>
      : never,
    Node extends ChainNodeGenerics = LMerge<FinalDefaults, NodeTypes> extends ChainNodeGenerics
      ? LMerge<FinalDefaults, NodeTypes>
      : never,
    Chain extends ChainGenerics = {
      Input: RootNode['Output']
      Output: Node['Output']
      AccumulatedErrors: Node['Error']
      AccumulatedOutputs: Node['Output']
      AccumulatedResultResolverControllers:
        | RootNode['ResultResolverController']
        | Node['ResultResolverController']
      AccumulatedErrorResolverControllers:
        | RootNode['ErrorResolverController']
        | Node['ErrorResolverController']
      Defaults: FinalDefaults
    },
  >(
    asyncFunction: AsyncFn<Chain, RootNode, Node>,
  ) => {
    const base = chain<RootNodeTypes, NodeTypes, Defaults, FinalDefaults, RootNode, Node, Chain>
    const eChain = errorTrappingChain<typeof base>(base, lifecycleCallbacks)

    return eChain
  }
}

export default enhancedChain
