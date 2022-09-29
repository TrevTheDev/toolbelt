import chain from './chain'

import type {
  ChainNodePossibleGenerics,
  ChainGenerics,
  ChainNodeGenerics,
  ChainNodeGenericsWithInputOutput,
  NeverChainNodeGenerics,
  AsyncFn,
  chainNodeType,
  ResultCall,
} from './chain'

import { LMerge, RenameProperty } from './typescript utils'

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
  beforeNodeResult?: () => void
  afterNodeResult?: () => void
  beforeNodeError?: () => void
  afterNodeError?: () => void
  beforeChainResolved?: () => void
  afterChainResolved?: () => void
  onChainEmpty?: () => void
  onItemAddedToChain?: () => void
}

type EnhancedSharedProperties<Chain extends ChainGenerics, Node extends ChainNodeGenerics> = {
  type: typeof chainNodeType
  sync: ResultCall<Chain, Node, false>
  input(input: Chain['Input']): PromiseLike<Chain['Output']>
}

const errorTrappingChain = <T extends typeof chain>(chainer: T) => {
  const trapAsyncMap = (asyncMap) => chainer(asyncMap)
  return trapAsyncMap as unknown as T
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
  ) => {
    const base = chain<
      RootNodeTypes,
      NodeTypes,
      Defaults,
      FinalDefaults,
      FakeRootNode,
      Node,
      Chain
    >(asyncFunction)
    const eChain: typeof base & EnhancedSharedProperties<Chain, Node> = base as any
    Object.assign(eChain, {
      sync<
        NodeTypes_ extends ChainNodePossibleGenerics = {},
        UpdateDefaults extends ChainNodePossibleGenerics = {},
        UpdatedDefaults extends ChainNodeGenerics = LMerge<
          Chain['Defaults'],
          UpdateDefaults
        > extends ChainNodeGenerics
          ? LMerge<Chain['Defaults'], UpdateDefaults>
          : never,
        Child extends ChainNodeGenerics = LMerge<
          UpdatedDefaults,
          NodeTypes_
        > extends ChainNodeGenerics
          ? LMerge<UpdatedDefaults, NodeTypes_>
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
      >(syncFunction: (input: Node['Output']) => Child['Output']) {
        return eChain<NodeTypes_, UpdateDefaults, UpdatedDefaults, Child, UpdatedC>(
          (input, resolver) => resolver.result(syncFunction(input)),
        )
      },
      input(input: Chain['Input']) {
        return new Promise<Chain['Output']>((resolve, reject) => {
          eChain.await(input, resolve, reject)
        })
      },
    })
    return eChain
  }
}

export default enhancedChain
