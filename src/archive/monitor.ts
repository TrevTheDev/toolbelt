/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { LMerge, RecursiveUnion, Union, UnknownObject } from './typescript utils'

type SubscriptionOptions = {
  ignoreUnexpectedOutcomesAfterCompleted: boolean
  resolutionType: 'default' | 'autoAwait' | 'autoNext'
}

type PartialSubscriptionOptions = Partial<SubscriptionOptions>

const defaultSubscriptionOptions = {
  ignoreUnexpectedOutcomesAfterCompleted: false,
  resolutionType: 'default',
} as const

type DefaultOptions = typeof defaultSubscriptionOptions extends infer O
  ? { -readonly [K in keyof O]: O[K] }
  : never

type FinalOptions<
  Options extends PartialSubscriptionOptions,
  RT extends SubscriptionOptions = LMerge<DefaultOptions, Options> extends SubscriptionOptions
    ? LMerge<DefaultOptions, Options>
    : never,
> = RT

type SharedOutcomes = {
  done?(valueArg?: any): void
  error?(errorArg?: any): void
  cancel?(valueArg?: any): void
}

type SharedCallbacks = {
  beforeStart?: (startInput: any, start: (input: any) => void) => void
  beforeDone?: (output: any, done: (finalOutput?: any) => void) => void
  onCancel?: (cancelledOutcome: any) => void
}

type ConsumerOutcome = {
  awaitNext(producerInput?: any): void
  cancel?(valueArg?: any): void
  done?(valueArg?: any): void
  error?(errorArg?: any): void
}

type ProducerOutcome = RecursiveUnion<[{ next: (output?: any) => void }, SharedOutcomes]>

type Consumer<Options extends SubscriptionOptions> = RecursiveUnion<
  [
    SharedOutcomes,
    SharedCallbacks,
    Options['resolutionType'] extends 'autoAwait'
      ? { next(value: any): void }
      : { next(value: string, outcome: ConsumerOutcome): void },
  ]
>

type Consumer2<
  StartInput,
  ProducerStartInput,
  ConsumerCancel,
  ProducerCancel,
  ConsumerError,
  ProducerError,
  ProducerInput = StartInput,
  ProducerOutput = ProducerInput,
  BeforeDoneOutput = ProducerOutput,
  DoneOutput = ProducerOutput,
> = {
  // beforeStart?(startInput: StartInput, start: (input: ProducerStartInput) => void): void
  onDone?(valueArg: DoneOutput): void
  onProducerError?(errorArg: ProducerError): void
  onProducerCancel?(cancelledOutcome: ProducerCancel): void
  next(
    value: ProducerOutput,
    outcome: {
      awaitNext(producerInput: ProducerInput): void
      cancel?(valueArg: ConsumerCancel): void
      done?(valueArg: BeforeDoneOutput): void
      error?(errorArg: ConsumerError): void
    },
  ): void
  //   next(value: Output): void
}

type Consumer3<Input, Output, ConsumerInterface extends {}, ProducerInterface extends {}> = {
  consumerInterface: ConsumerInterface
  next(value: Output, awaitNext: (producerInput: Input) => void, producer: ProducerInterface): void
  //   next(value: Output): void
}

type Producer3<Input, Output, ConsumerInterface extends {}, ProducerInterface extends {}> = {
  producerInterface: ProducerInterface
  transformer(
    input: Input,
    next: (producerOutput: Output) => void,
    consumer: ConsumerInterface,
  ): void
}

type Producer2<
  ProducerStartInput,
  ProducerCancel,
  ConsumerCancel,
  ProducerError,
  ConsumerError,
  ProducerInput = ProducerStartInput,
  ProducerOutput = ProducerInput,
  BeforeDoneOutput = ProducerOutput,
  DoneOutput = ProducerOutput,
> = {
  beforeStart?(startInput: ProducerStartInput, start: (input: ProducerInput) => void): void
  beforeDone?(output: BeforeDoneOutput, done: (finalOutput: DoneOutput) => void): void
  onConsumerError?(errorArg: ConsumerError): void
  onConsumerCancel?(cancelledOutcome: ConsumerCancel): void
  transformer(
    input: ProducerInput,
    outcome: {
      next(producerOutput: ProducerOutput): void
      cancel?(valueArg: ProducerCancel): void
      done?(valueArg: BeforeDoneOutput): void
      error?(errorArg: ProducerError): void
    },
  ): void
}

type Producer<
  Options extends SubscriptionOptions,
  RT = Union<
    SharedCallbacks,
    {
      transformer: Options['resolutionType'] extends 'autoNext'
        ? (inputArg: any) => void
        : (inputArg: any, outcome: ProducerOutcome) => void
    }
  >,
> = RT

type ProducerWithKnownConsumer<
  Options extends SubscriptionOptions,
  C extends Consumer<Options>,
  OCancel extends UnknownObject = C extends { cancel(arg: infer A): void }
    ? { onCancel?: (cancelledOutcome: A) => void }
    : {},
  ODone extends UnknownObject = C extends { done: infer D } ? { done: D } : {},
  OOCancel extends UnknownObject = C extends { cancel: infer S } ? { cancel: S } : {},
  OError extends UnknownObject = C extends { error: infer E } ? { error: E } : {},
  OPut = C extends { next: (outcome: infer A, ...args: any[]) => void } ? A : never,
  Response extends {} = C extends { next: (outcome: any, response: infer R extends {}) => void }
    ? R
    : never,
  Input = Response extends { awaitNext(input: infer I): void } ? I : never,
  BDone extends UnknownObject = C extends { done: unknown }
    ? { beforeDone?: (output: OPut, done: (finalOutput: OPut) => void) => void }
    : {},
  OCome extends UnknownObject = RecursiveUnion<
    [{ next: (result: OPut) => void }, ODone, OOCancel, OError]
  >,
  Transformer extends UnknownObject = {
    transformer: Options['resolutionType'] extends 'autoNext'
      ? (inputArg: Input) => void
      : (inputArg: Input, outcome: OCome) => void
  },
> = RecursiveUnion<
  [
    Transformer,
    BDone,
    OCancel,
    { beforeStart?: (startInput: Input, start: (input: Input) => void) => void },
  ]
>

type ConstrainedFn<Fn extends (...any) => any> = Parameters<Fn> extends [any, ...any]
  ? (value: Parameters<Fn>[0]) => void
  : () => void

type SharedOutcomeHandlers<
  T extends SharedOutcomes,
  Error extends UnknownObject = T extends { error: (errorArg?: any) => void }
    ? { error: ConstrainedFn<T['error']> }
    : {},
  Done extends UnknownObject = T extends { done: (value?: any) => void }
    ? { done: ConstrainedFn<T['done']> }
    : {},
  Cancel extends UnknownObject = T extends { cancel: (value?: any) => void }
    ? { cancel: ConstrainedFn<T['cancel']> }
    : {},
  Res = RecursiveUnion<[Error, Done, Cancel]>,
> = Res

type ProducerOutcomeHandler<
  Options extends SubscriptionOptions,
  T extends Consumer<Options>,
  Res = Union<{ next: T['next'] }, T extends SharedOutcomes ? SharedOutcomeHandlers<T> : {}>,
> = Res extends { next(output): void } ? Res : never

type ProducerOutcomeHandlerInternal<
  Options extends SubscriptionOptions,
  T extends Consumer<Options>,
  T1 extends { next: (...args) => void } = ProducerOutcomeHandler<Options, T>,
> = LMerge<T1, { next: ConstrainedFn<T1['next']> }>

type ConsumerOutcomeHandler<
  Options extends SubscriptionOptions,
  T extends Producer<Options>,
  Res = Union<
    { awaitNext: T['transformer'] },
    T extends SharedOutcomes ? SharedOutcomeHandlers<T> : {}
  >,
> = Res extends { awaitNext(input): void } ? Res : never

type ConsumerOutcomeHandlerInternal<
  Options extends SubscriptionOptions,
  T extends Producer<Options>,
  T1 extends { awaitNext: (...args) => void } = ConsumerOutcomeHandler<Options, T>,
> = LMerge<T1, { awaitNext: ConstrainedFn<T1['awaitNext']> }>

const subscribe = <
  Options extends SubscriptionOptions,
  C extends Consumer<Options>,
  P extends Producer<Options>,
>(
  consumerObj: C,
  producerObj: P /* (
    outcomeHandlerObject:  ProducerOutcomeHandler<Options, C>,
  ) => (input: Parameters<C['next']>[0]) => void */,
  options: Partial<SubscriptionOptions> = {},
) => {
  const opts: Options = { ...defaultSubscriptionOptions, ...options }
  let isStopped = false

  let producerTransformer: (input: Parameters<C['next']>[0]) => void

  const canProcessOutcome = () => {
    if (isStopped) {
      if (!opts.ignoreUnexpectedOutcomesAfterCompleted) throw new Error('already stopped')
      return false
    }
    return true
  }

  const customerOutcomeHandlerObject = {
    awaitNext(output) {
      producerTransformer(output)
    },
  }

  const nextFn =
    opts.resolutionType === 'autoAwait'
      ? (input) => producerTransformer((consumerObj.next as (value: any) => void)(input))
      : (input) => consumerObj.next(input, customerOutcomeHandlerObject)

  let doneFn =
    consumerObj.done ??
    (() => {
      throw new Error('done not handled')
    })

  if (consumerObj.beforeDone) {
    doneFn = (output) => {
      const previousDone = doneFn
      consumerObj.beforeDone(output, previousDone)
    }
  }
  if (producerObj.beforeDone) {
    doneFn = (output) => {
      const previousDone = doneFn
      producerObj.beforeDone(output, previousDone)
    }
  }
  let cancelFn =
    consumerObj.cancel ??
    (() => {
      throw new Error('done not handled')
    })
  if (consumerObj.onCancel) {
    cancelFn = (output) => {
      const previousCancelFn = cancelFn
      consumerObj.onCancel(output, previousCancelFn)
    }
  }
  if (producerObj.onCancel) {
    cancelFn = (output) => {
      const previousCancelFn = cancelFn
      producerObj.onCancel(output, previousCancelFn)
    }
  }

  const handlers: [name: string, handlerFn: (...args) => any][] = []
  if (consumerObj.error) handlers.push(['error', consumerObj.error])
  handlers.push(['done', doneFn])
  if (consumerObj.cancel) handlers.push(['cancel', consumerObj.cancel])

  const outcomeHandlerObject = {
    next: (input) => {
      if (canProcessOutcome()) nextFn(input)
    },
  } as unknown as ProducerOutcomeHandler<Options, C>

  handlers.forEach(([name, handlerFn]) => {
    outcomeHandlerObject[name] = (...args) => {
      if (canProcessOutcome()) {
        isStopped = true
        handlerFn(...args)
      }
    }
  })

  Object.assign(customerOutcomeHandlerObject, (({ next, ...o }) => o)(outcomeHandlerObject))

  return (firstInput: Parameters<C['next']>[0]) => {
    producerTransformer = (input) => producerObj.transformer(input, outcomeHandlerObject)
    let startFn = (input) => producerTransformer(input)
    if (producerObj.beforeStart) {
      startFn = (input) => {
        const previousStartFn = startFn
        producerObj.beforeStart(input, previousStartFn)
      }
    }
    if (consumerObj.beforeStart) {
      startFn = (input) => {
        const previousStartFn = startFn
        consumerObj.beforeStart(input, previousStartFn)
      }
    }
    startFn(firstInput)
  }
}

function subscription<
  Options extends PartialSubscriptionOptions,
  C extends Consumer<FinalOptions<Options>>,
  P extends ProducerWithKnownConsumer<FinalOptions<Options>, C>,
  AwaitType = Options['resolutionType'] extends 'autoAwait'
    ? ReturnType<C['next']>
    : Parameters<C['next']>[1] extends (arg: any) => void
    ? Parameters<Parameters<C['next']>[1]>[0]
    : never,
>(consumer: C, producer: P, startInput: AwaitType, options: Options) {
  const producerFn =
    options.resolutionType === 'autoNext'
      ? (
            outcomeHandlerObject: ProducerOutcomeHandler<
              LMerge<DefaultOptions, Options> extends SubscriptionOptions
                ? LMerge<DefaultOptions, Options>
                : never,
              C
            >,
          ) =>
          (input) => {
            const res = producer.transformer(input)
            const z = outcomeHandlerObject.next
            z(res)
          }
      : (
            outcomeHandlerObject: ProducerOutcomeHandler<
              LMerge<DefaultOptions, Options> extends SubscriptionOptions
                ? LMerge<DefaultOptions, Options>
                : never,
              C
            >,
          ) =>
          (input) =>
            producer.transformer(input, outcomeHandlerObject)
  subscribe<FinalOptions<Options>, C, P>(consumer, producerFn, options)(startInput)
}

type AsyncOutcomeHandler<
  T,
  RT = {
    next(value: T): void
    error?(error: unknown): void
    done(value: T): void
  },
> = RT

export function subscriptionAsyncFn<T, R = AsyncOutcomeHandler<T>>(
  producer: (inputArg: T, outcome: R) => void,
) {
  return (input: T, resultCb: (result: T) => void, errorCb: (error: unknown) => void) => {
    subscription<
      DefaultOptions,
      {
        next: (value: T, awaitNext: (producerInput: T) => void) => void
        done: (value: T) => void
        error: (errorArg: E) => void
      }
    >(
      {
        next(outcome, awaitNext) {
          awaitNext(outcome)
        },
        done(value) {
          resultCb(value)
        },
        error(value) {
          if (errorCb) errorCb(value)
          else throw new Error(`no errorCb provided, and error ${value} received`)
        },
      },
      producer,
      input,
      {},
    )
  }
}

export default subscription
