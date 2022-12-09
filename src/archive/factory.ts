import { LMerge, UnknownObject } from './typescript utils'

type SubscriptionOptions = {
  type: 'default' | 'awaitNextOnReturn' | 'nextOnReturn'
}

type PartialSubscriptionOptions = Partial<SubscriptionOptions>

const defaultSubscriptionOptions = {
  type: 'default',
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

// type ConsumerUnknown<Options extends SubscriptionOptions> =
//   Options['type'] extends 'awaitNextOnReturn'
//     ? {
//         consumerInterface?: UnknownObject
//         next(outcome: any, producer?: UnknownObject): void
//       }
//     : {
//         consumerInterface?: UnknownObject
//         next(outcome: any, awaitNext: (producerInput: any) => void, producer?: UnknownObject): void
//       }

// type Consumer<
//   Options extends SubscriptionOptions,
//   Input,
//   Output,
//   ConsumerInterface extends UnknownObject,
//   ProducerInterface extends UnknownObject,
//   RT extends ConsumerUnknown<Options> = Options['type'] extends 'awaitNextOnReturn'
//     ? {
//         consumerInterface?: ConsumerInterface
//         next(outcome: Output, producer: ProducerInterface): void
//       }
//     : {
//         consumerInterface?: ConsumerInterface
//         next(
//           outcome: Output,
//           awaitNext: (producerInput: Input) => void,
//           producer: ProducerInterface,
//         ): void
//       },
// > = RT

// type ProducerUnknown<Options extends SubscriptionOptions> = Options['type'] extends 'nextOnReturn'
//   ? {
//       producerInterface?: UnknownObject
//       transformer(input: any, consumer?: UnknownObject): void
//     }
//   : {
//       producerInterface?: UnknownObject
//       transformer(input: any, next: (producerOutput: any) => void, consumer?: UnknownObject): void
//     }

// type Producer<
//   Options extends SubscriptionOptions,
//   Input,
//   Output,
//   ConsumerInterface extends UnknownObject,
//   ProducerInterface extends UnknownObject,
//   RT extends ProducerUnknown<Options> = Options['type'] extends 'nextOnReturn'
//     ? {
//         producerInterface?: ProducerInterface
//         transformer(input: Input, consumer: ConsumerInterface): void
//       }
//     : {
//         producerInterface?: ProducerInterface
//         transformer(
//           input: Input,
//           next: (producerOutput: Output) => void,
//           consumer: ConsumerInterface,
//         ): void
//       },
// > = RT

// const subscribe = <
//   Options extends SubscriptionOptions,
//   C extends ConsumerUnknown<Options>,
//   P extends ProducerUnknown<Options>,
// >(
//   consumerObj: C,
//   producerObj: P /* (
//     outcomeHandlerObject:  ProducerOutcomeHandler<Options, C>,
//   ) => (input: Parameters<C['next']>[0]) => void */,
//   options: Partial<SubscriptionOptions> = {},
// ) => {
//   const opts = { ...defaultSubscriptionOptions, ...options } as Options

//   //   let producerTransformer: (input: Parameters<C['next']>[0]) => void

//   //  next(outcome: any, awaitNext: (producerInput: any) => void, producer?: UnknownObject): void

//   let nextFn

//   const transformerFn = (input) =>
//     opts.type === 'nextOnReturn'
//       ? nextFn(
//           (
//             producerObj as {
//               producerInterface?: UnknownObject
//               transformer(arg: any, consumer?: UnknownObject): void
//             }
//           ).transformer(input, consumerObj.consumerInterface),
//         )
//       : producerObj.transformer(input, nextFn, consumerObj.consumerInterface)

//   nextFn =
//     opts.type === 'awaitNextOnReturn'
//       ? (output) =>
//           transformerFn(
//             (
//               consumerObj as {
//                 consumerInterface?: UnknownObject
//                 next(outcome: any, producer?: UnknownObject): void
//               }
//             ).next(output, producerObj.producerInterface),
//           )
//       : (output) =>
//           (
//             consumerObj as {
//               consumerInterface?: UnknownObject
//               next(
//                 outcome: any,
//                 awaitNext: (producerInput: any) => void,
//                 producer?: UnknownObject,
//               ): void
//             }
//           ).next(output, transformerFn, producerObj.producerInterface)

//   return transformerFn
// }

// export default function subscription<
//   Options extends PartialSubscriptionOptions,
//   Input,
//   Output,
//   ConsumerInterface extends UnknownObject,
//   ProducerInterface extends UnknownObject,
//   FO extends SubscriptionOptions = FinalOptions<Options>,
// >(
//   consumer: Consumer<FO, Input, Output, ConsumerInterface, ProducerInterface>,
//   producer: Producer<FO, Input, Output, ConsumerInterface, ProducerInterface>,
//   startInput: Parameters<
//     Producer<FO, Input, Output, ConsumerInterface, ProducerInterface>['transformer']
//   >[0],
//   options: Options,
// ) {
//   subscribe<
//     FO,
//     Consumer<FO, Input, Output, ConsumerInterface, ProducerInterface>,
//     Producer<FO, Input, Output, ConsumerInterface, ProducerInterface>
//   >(
//     consumer,
//     producer,
//     options,
//   )(startInput)
// }
// function subscription<
//   StartInput,
//   Input,
//   Output,
//   ProducerInterface extends UnknownObject,
//   ConsumerInterface extends UnknownObject,
//   SharedInterface extends UnknownObject,
//   AwaitNextReturnType,
//   NextReturnType,
//   Type extends 'default' | 'awaitNextOnReturn' | 'nextOnReturn',
// >(subscriptionDefinition: {
//   sharedInterface?: (startInput: StartInput) => [Input, SharedInterface]
//   producerInterface?: (sharedIface: SharedInterface) => ProducerInterface
//   consumerInterface?: (sharedIface: SharedInterface) => ConsumerInterface
//   next: Type extends 'awaitNextOnReturn'
//     ? (outcome: Output, producer: ProducerInterface) => Input
//     : (
//         outcome: Output,
//         awaitNext: (producerInput: Input) => AwaitNextReturnType,
//         producer: ProducerInterface,
//       ) => NextReturnType
//   transformer: Type extends 'nextOnReturn'
//     ? (input: Input, consumer: ConsumerInterface) => Output
//     : (
//         input: Input,
//         nextFn: (producerOutput: Output) => NextReturnType,
//         consumer: ConsumerInterface,
//       ) => AwaitNextReturnType
//   type?: Type
// })
function subscription<
  StartInput,
  Input,
  Output,
  ProducerInterface extends UnknownObject,
  ConsumerInterface extends UnknownObject,
  SharedInterface extends UnknownObject,
  NextReturnType,
>(subscriptionDefinition: {
  sharedInterface?: (startInput: StartInput) => [Input, SharedInterface]
  producerInterface?: (sharedIface: SharedInterface) => ProducerInterface
  consumerInterface?: (sharedIface: SharedInterface) => ConsumerInterface
  next: (
    outcome: Output,
    awaitNext: (producerInput: Input) => Output,
    producer: ProducerInterface,
  ) => NextReturnType
  transformer: (input: Input, consumer: ConsumerInterface) => Output
  type: 'nextOnReturn'
}): (startInput: StartInput) => Output | undefined
function subscription<
  StartInput,
  Input,
  Output,
  ProducerInterface extends UnknownObject,
  ConsumerInterface extends UnknownObject,
  SharedInterface extends UnknownObject,
  AwaitNextReturnType,
>(subscriptionDefinition: {
  sharedInterface?: (startInput: StartInput) => [Input, SharedInterface]
  producerInterface?: (sharedIface: SharedInterface) => ProducerInterface
  consumerInterface?: (sharedIface: SharedInterface) => ConsumerInterface
  next: (outcome: Output, producer: ProducerInterface) => Input
  transformer: (
    input: Input,
    nextFn: (producerOutput: Output) => Input,
    consumer: ConsumerInterface,
  ) => AwaitNextReturnType
  type: 'awaitNextOnReturn'
}): (startInput: StartInput) => Output | undefined
function subscription<
  StartInput,
  Input,
  Output,
  ProducerInterface extends UnknownObject,
  ConsumerInterface extends UnknownObject,
  SharedInterface extends UnknownObject,
  AwaitNextReturnType,
  NextReturnType,
>(subscriptionDefinition: {
  sharedInterface?: (startInput: StartInput) => [Input, SharedInterface]
  producerInterface?: (sharedIface: SharedInterface) => ProducerInterface
  consumerInterface?: (sharedIface: SharedInterface) => ConsumerInterface
  next: (
    outcome: Output,
    awaitNext: (producerInput: Input) => AwaitNextReturnType,
    producer: ProducerInterface,
  ) => NextReturnType
  transformer: (
    input: Input,
    nextFn: (producerOutput: Output) => NextReturnType,
    consumer: ConsumerInterface,
  ) => AwaitNextReturnType
  type?: 'default'
}): (startInput: StartInput) => Output | undefined
function subscription<
  StartInput,
  Input,
  Output,
  ProducerInterface extends UnknownObject,
  ConsumerInterface extends UnknownObject,
  SharedInterface extends UnknownObject,
  AwaitNextReturnType,
  NextReturnType,
  Type extends 'default' | 'awaitNextOnReturn' | 'nextOnReturn',
>(subscriptionDefinition: {
  sharedInterface?: (startInput: StartInput) => [Input, SharedInterface]
  producerInterface?: (sharedIface: SharedInterface) => ProducerInterface
  consumerInterface?: (sharedIface: SharedInterface) => ConsumerInterface
  next: Type extends 'awaitNextOnReturn'
    ? (outcome: Output, producer: ProducerInterface) => Input
    : (
        outcome: Output,
        awaitNext: (producerInput: Input) => AwaitNextReturnType,
        producer: ProducerInterface,
      ) => NextReturnType
  transformer: Type extends 'nextOnReturn'
    ? (input: Input, consumer: ConsumerInterface) => Output
    : (
        input: Input,
        nextFn: (producerOutput: Output) => NextReturnType,
        consumer: ConsumerInterface,
      ) => AwaitNextReturnType
  type?: Type
}): (startInput: StartInput) => Output | undefined {
  const type = subscriptionDefinition.type || 'default'
  return (startInput: StartInput) => {
    const [inputValue, sharedIface] = subscriptionDefinition.sharedInterface
      ? subscriptionDefinition.sharedInterface(startInput)
      : [startInput as unknown as Input, undefined as unknown as SharedInterface]
    const producerIface = subscriptionDefinition.producerInterface
      ? subscriptionDefinition.producerInterface(sharedIface)
      : (undefined as unknown as ProducerInterface)
    const consumerIface = subscriptionDefinition.consumerInterface
      ? subscriptionDefinition.consumerInterface(sharedIface)
      : (undefined as unknown as ConsumerInterface)

    let nextFn
    let lastOutput

    const transformerFn =
      type === 'nextOnReturn'
        ? (input) =>
            nextFn(
              (
                subscriptionDefinition.transformer as (
                  inputA: Input,
                  consumer: ConsumerInterface,
                ) => Output
              )(input, consumerIface),
            )
        : (input) => subscriptionDefinition.transformer(input, nextFn, consumerIface)

    nextFn =
      type === 'awaitNextOnReturn'
        ? (output) => {
            lastOutput = output
            transformerFn(
              (
                subscriptionDefinition.next as (
                  outcome: Output,
                  producer: ProducerInterface,
                ) => Input
              )(output, producerIface),
            )
          }
        : (output) => {
            lastOutput = output
            ;(
              subscriptionDefinition.next as (
                outcome: Output,
                awaitNext: (producerInput: Input) => AwaitNextReturnType,
                producer: ProducerInterface,
              ) => NextReturnType
            )(output, transformerFn, producerIface)
          }

    transformerFn(inputValue)
    return lastOutput
  }
}

export default subscription
