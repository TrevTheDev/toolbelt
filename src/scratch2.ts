type ResultResolver<Result, ResultResolverController> = (result: Result) => ResultResolverController
type ErrorResolver<Error, ErrorResolverController> = (error: Error) => ErrorResolverController
type ResultCb<T, ResultCbController> = (result: T) => ResultCbController
type ErrorCb<Error, Output, ResultResolverController = void, ErrorCbController = void> = (
  error: Error,
  result: ResultResolver<Output, ResultResolverController>,
) => ErrorCbController

type Pins<
  Output,
  Error = unknown,
  ResultResolverController = void,
  ErrorResolverController = void,
> = {
  (result: Output): ResultResolverController
  result: ResultResolver<Output, ResultResolverController>
  error: ErrorResolver<Error, ErrorResolverController>
}

type ResultErrorAsyncMap<
  Input,
  Output,
  Error,
  Controller,
  ChildController,
  ChildErrorResolverController,
> = (
  input: Input,
  resolver: Pins<Output, Error, ChildController, ChildErrorResolverController>,
) => Controller

type AwaitedChainNode<AccumulatedAsyncFnController> = {
  controller: AccumulatedAsyncFnController
}

type Union<T1, T2> = {
  [k in keyof T2 | keyof T1]: k extends keyof T2 ? T2[k] : k extends keyof T1 ? T1[k] : never
}

type ChainNode<
  T extends {
    StartInput?: unknown
    Input?: unknown
    AccumulateError?: unknown
    Output?: unknown
    AsyncFnController?: unknown
    ErrorResolverController?: unknown
    AccumulatedAsyncFnController?: unknown
  },
  Node extends {
    StartInput: unknown
    Input: unknown
    AccumulateError: unknown
    Output: unknown
    AsyncFnController: unknown
    ErrorResolverController: unknown
    AccumulatedAsyncFnController: unknown
  } = Union<
    {
      StartInput: unknown
      Input: unknown
      AccumulateError: unknown
      Output: unknown
      AsyncFnController: unknown
      ErrorResolverController: unknown
      AccumulatedAsyncFnController: unknown
    },
    T
  >,
> = {
  <
    S extends {
      ChildOut?: unknown
      ChildError?: unknown
      ChildAsyncFnController?: unknown
      ChildErrorResolverController?: unknown
    },
    Child extends {
      Output: unknown
      Error: unknown
      AsyncFnController: unknown
      ErrorResolverController: unknown
    } = Union<
      {
        Output: Node['Input']
        Error: Node['AccumulateError']
        AsyncFnController: Node['AsyncFnController']
        ErrorResolverController: Node['ErrorResolverController']
      },
      S
    >,
  >(
    asyncFn: ResultErrorAsyncMap<
      Node['Output'],
      Child['Output'],
      Child['Error'],
      Node['AsyncFnController'],
      Child['AsyncFnController'],
      Child['ErrorResolverController']
    >,
  ): ChainNode<{
    StartInput: Node['StartInput']
    Input: Node['Output']
    AccumulateError: Node['AccumulateError'] | Child['Error']
    Output: Child['Output']
    AsyncFnController: Child['AsyncFnController']
    ErrorResolverController: Child['ErrorResolverController']
    AccumulatedAsyncFnController: Node['AccumulatedAsyncFnController'] | Child['AsyncFnController']
  }>
  onError(
    callback: ErrorCb<
      Node['AccumulateError'],
      Node['Output'],
      Node['AsyncFnController'],
      Node['ErrorResolverController']
    >,
  ): ChainNode<Union<Node, { AccumulateError: never }>>
  await(
    input: Node['StartInput'],
    resultCb: ResultCb<Node['Output'], Node['AsyncFnController']>,
    errorCb: ErrorCb<
      Node['AccumulateError'],
      Node['Output'],
      Node['AsyncFnController'],
      Node['ErrorResolverController']
    >,
  ): AwaitedChainNode<Node['AccumulatedAsyncFnController']>
  s<
    S extends {
      ChildOut?: unknown
      ChildError?: unknown
      ChildAsyncFnController?: unknown
      ChildErrorResolverController?: unknown
    },
    Child extends {
      Output: unknown
      Error: unknown
      AsyncFnController: unknown
      ErrorResolverController: unknown
    } = Union<
      {
        Output: Node['Input']
        Error: Node['AccumulateError']
        AsyncFnController: Node['AsyncFnController']
        ErrorResolverController: Node['ErrorResolverController']
      },
      S
    >,
  >(
    syncFunction: (input: Node['Output']) => Child['Output'],
  ): ChainNode<{
    StartInput: Node['StartInput']
    Input: Node['Output']
    AccumulateError: Node['AccumulateError'] | Child['Error']
    Output: Child['Output']
    AsyncFnController: Child['AsyncFnController']
    ErrorResolverController: Child['ErrorResolverController']
    AccumulatedAsyncFnController: Node['AccumulatedAsyncFnController'] | Child['AsyncFnController']
  }>
}
