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

export type ResultResolver<Result, ResultResolverController> = (
  result: Result,
) => ResultResolverController
export type ErrorResolver<Error, ErrorResolverController> = (
  error: Error,
) => ErrorResolverController
export type ResultCb<T, ResultCbController> = (result: T) => ResultCbController
export type ErrorCb<Error, Output, ResultResolverController = void, ErrorCbController = void> = (
  error: Error,
  result: ResultResolver<Output, ResultResolverController>,
) => ErrorCbController

export type Pins<
  Output,
  Error = unknown,
  ResultResolverController = void,
  ErrorResolverController = void,
> = {
  (result: Output): ResultResolverController
  result: ResultResolver<Output, ResultResolverController>
  error: ErrorResolver<Error, ErrorResolverController>
}

export type AwaitedChainNode<AccumulatedAsyncFnController> = {
  controller: AccumulatedAsyncFnController
}

export type StartChainNode<Input, AsyncFnController, ErrorResolverController> = {
  addChild: <ChildAsyncFnController, ChildErrorResolverController>() => StartChainNode<
    Input,
    AsyncFnController | ChildAsyncFnController,
    ErrorResolverController | ChildErrorResolverController
  >
  startInput: Input
  asyncFnController: AsyncFnController
  errorResolverController: ErrorResolverController
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

export type ChainNode<
  StartInput,
  Input,
  AccumulateError,
  Output,
  AsyncFnController,
  ErrorResolverController,
  AccumulatedAsyncFnController,
> = {
  <
    ChildOut = Input,
    ChildError = AccumulateError,
    ChildAsyncFnController = AsyncFnController,
    ChildErrorResolverController = ErrorResolverController,
  >(
    asyncFn: ResultErrorAsyncMap<
      Output,
      ChildOut,
      ChildError,
      AsyncFnController,
      ChildAsyncFnController,
      ChildErrorResolverController
    >,
  ): ChainNode<
    StartInput,
    Output,
    AccumulateError | ChildError,
    ChildOut,
    ChildAsyncFnController,
    ChildErrorResolverController,
    AccumulatedAsyncFnController | ChildAsyncFnController
  >
  onError(
    callback: ErrorCb<AccumulateError, Output, AsyncFnController, ErrorResolverController>,
  ): ChainNode<
    StartInput,
    Input,
    never,
    Output,
    AsyncFnController,
    ErrorResolverController,
    AccumulatedAsyncFnController
  >
  await(
    input: StartInput,
    resultCb: ResultCb<Output, AsyncFnController>,
    errorCb: ErrorCb<AccumulateError, Output, AsyncFnController, ErrorResolverController>,
  ): AwaitedChainNode<AccumulatedAsyncFnController>
  s<
    ChildOut = Input,
    ChildError = AccumulateError,
    ChildAsyncFnController = AsyncFnController,
    ChildErrorResolverController = ErrorResolverController,
  >(
    syncFunction: (input: Output) => ChildOut,
  ): ChainNode<
    StartInput,
    Output,
    AccumulateError | ChildError,
    ChildOut,
    ChildAsyncFnController,
    ChildErrorResolverController,
    AccumulatedAsyncFnController | ChildAsyncFnController
  >
}

type ChainOptions = {
  asyncByDefault: boolean
}

const FunctionAssign = <T extends object, S>(fn: T, obj: S) => Object.assign(fn, obj) as T & S

const startChain = <
  DefaultInputOutput,
  DefaultError,
  DefaultAsyncFnController,
  DefaultErrorResolverController,
>() => {
  const addSharedProperties = <
    StartInput,
    Input,
    Error,
    Output,
    AsyncFnController,
    ErrorResolverController,
    AccumulatedAsyncFnController,
    T extends ChainNode<
      StartInput,
      Input,
      Error,
      Output,
      AsyncFnController,
      ErrorResolverController,
      AccumulatedAsyncFnController
    >,
  >(
    fn: T,
    awaitFn,
    errorNode,
  ) =>
    Object.assign(fn, {
      await(
        arg: StartInput,
        resultCb: ResultCb<Output, AsyncFnController>,
        errorCb: ErrorCb<Error, Output, AsyncFnController, ErrorResolverController>,
      ) {
        return awaitFn(arg, resultCb, errorCb, {})
      },
      onError(errorCb: ErrorCb<Error, Output, AsyncFnController, ErrorResolverController>) {
        return errorNode(awaitFn, errorCb)
      },
      s<
        ChildOut = DefaultInputOutput,
        ChildError = DefaultError,
        // ChildAsyncFnController = DefaultAsyncFnController,
        ChildErrorResolverController = DefaultErrorResolverController,
      >(syncFunction: (input: Output) => ChildOut) {
        return fn<ChildOut, ChildError, AsyncFnController, ChildErrorResolverController>(
          (input, resolver) => resolver.result(syncFunction(input)),
        )
      },
    }) as T

  const errorNode = <
    Input,
    Error,
    Output,
    AsyncFnController,
    ErrorResolverController,
    AccumulatedAsyncFnController,
    // Parent extends ChainNode<any, any, any, any, any, any, any>,
    StartInput,
  >(
    parentAwaitFn: <
      ParentOutput,
      ParentError,
      ParentAsyncFnController,
      ParentErrorResolverController,
    >(
      arg: StartInput,
      resultCb: ResultCb<ParentOutput, ParentAsyncFnController>,
      errorCb: ErrorCb<
        ParentError,
        ParentOutput,
        ParentAsyncFnController,
        ParentErrorResolverController
      >,
      controller: AwaitedChainNode<AccumulatedAsyncFnController>,
    ) => AwaitedChainNode<AccumulatedAsyncFnController>,
    upstreamErrorCb: ErrorCb<Error, Output, AsyncFnController, ErrorResolverController>,
  ) => {
    // debugger
    const awaitFn = (
      arg: StartInput,
      resultCb: ResultCb<Output, AsyncFnController>,
      errorCb: ErrorCb<Error, Output, AsyncFnController, ErrorResolverController>,
      controller: AwaitedChainNode<AccumulatedAsyncFnController>,
    ) => parentAwaitFn(arg, resultCb, upstreamErrorCb, controller)

    const fn = function ChainFn<
      ChildOut = DefaultInputOutput,
      ChildError = DefaultError,
      ChildAsyncFnController = DefaultAsyncFnController,
      ChildErrorResolverController = DefaultErrorResolverController,
    >(
      asyncFunction: (
        input: Output,
        resolver: Pins<ChildOut, ChildError, ChildAsyncFnController, ChildErrorResolverController>,
      ) => ChildAsyncFnController,
    ) {
      // addChild

      return newNode<
        Output,
        ChildError,
        ChildOut,
        ChildAsyncFnController,
        ChildErrorResolverController,
        AccumulatedAsyncFnController | ChildAsyncFnController,
        // typeof fn,
        StartInput
      >(asyncFunction, (arg, resultCb, errorCb, controller) =>
        awaitFn(
          arg,
          resultCb as unknown as ResultCb<Output, AsyncFnController>,
          errorCb as unknown as ErrorCb<Error, Output, AsyncFnController, ErrorResolverController>,
          controller as unknown as AwaitedChainNode<AccumulatedAsyncFnController>,
        ),
      )
    } as unknown as ChainNode<
      StartInput,
      Input,
      Error,
      Output,
      AsyncFnController,
      ErrorResolverController,
      AccumulatedAsyncFnController
    >
    // debugger
    return addSharedProperties<
      StartInput,
      Input,
      Error,
      Output,
      AsyncFnController,
      ErrorResolverController,
      AccumulatedAsyncFnController,
      ChainNode<
        StartInput,
        Input,
        Error,
        Output,
        AsyncFnController,
        ErrorResolverController,
        AccumulatedAsyncFnController
      >
    >(fn, awaitFn, errorNode)
  }

  const newNode = <
    Input,
    Error,
    Output,
    AsyncFnController,
    ErrorResolverController,
    AccumulatedAsyncFnController,
    // ParentAwaitFn, // extends ChainNode<any, any, any, any, any, any, any> | undefined,
    StartInput,
  >(
    asyncFn: (
      input: Input,
      resolver: Pins<Output, Error, AsyncFnController, ErrorResolverController>,
    ) => AsyncFnController,
    parentAwaitFn?: <
      ParentOutput,
      ParentError,
      ParentAsyncFnController,
      ParentErrorResolverController,
    >(
      arg: StartInput,
      resultCb: ResultCb<ParentOutput, ParentAsyncFnController>,
      errorCb: ErrorCb<
        ParentError,
        ParentOutput,
        ParentAsyncFnController,
        ParentErrorResolverController
      >,
      controller: AwaitedChainNode<AccumulatedAsyncFnController>,
    ) => AwaitedChainNode<AccumulatedAsyncFnController>,
  ) => {
    const awaitFn = (
      arg: StartInput,
      resultCb: ResultCb<Output, AsyncFnController>,
      errorCb: ErrorCb<Error, Output, AsyncFnController, ErrorResolverController>,
      controller: AwaitedChainNode<AccumulatedAsyncFnController>,
    ) => {
      const execute = (input) => {
        const pins = FunctionAssign(
          // eslint-disable-next-line prefer-arrow-callback
          function PinsFn(resultArg) {
            return pins.result(resultArg)
          }, // as Pins<Output, Error, AsyncFnController, ErrorResolverController>
          {
            result(resultArg) {
              const res = resultCb(resultArg)
              controller.controller = res as unknown as AccumulatedAsyncFnController
              return res
            },
            error(errorArg) {
              return errorCb(errorArg, pins.result)
            },
          },
        )
        return asyncFn(input, pins)
      }

      if (parentAwaitFn) return parentAwaitFn(arg, execute, errorCb, controller)
      controller.controller = execute(arg) as unknown as AccumulatedAsyncFnController
      return controller
    }

    const fn = function ChainFn<
      ChildOut = DefaultInputOutput,
      ChildError = DefaultError,
      ChildAsyncFnController = DefaultAsyncFnController,
      ChildErrorResolverController = DefaultErrorResolverController,
    >(
      asyncFunction: (
        input: Output,
        resolver: Pins<ChildOut, ChildError, ChildAsyncFnController, ChildErrorResolverController>,
      ) => ChildAsyncFnController,
    ) {
      // addChild
      return newNode<
        Output,
        ChildError,
        ChildOut,
        ChildAsyncFnController,
        ChildErrorResolverController,
        AccumulatedAsyncFnController | ChildAsyncFnController,
        // any,
        StartInput
      >(asyncFunction, (arg, resultCb, errorCb, controller) =>
        awaitFn(
          arg,
          resultCb as unknown as ResultCb<Output, AsyncFnController>,
          errorCb as unknown as ErrorCb<Error, Output, AsyncFnController, ErrorResolverController>,
          controller as unknown as AwaitedChainNode<AccumulatedAsyncFnController>,
        ),
      )
    } as unknown as ChainNode<
      StartInput,
      Input,
      Error,
      Output,
      AsyncFnController,
      ErrorResolverController,
      AccumulatedAsyncFnController
    >
    // debugger
    return addSharedProperties<
      StartInput,
      Input,
      Error,
      Output,
      AsyncFnController,
      ErrorResolverController,
      AccumulatedAsyncFnController,
      ChainNode<
        StartInput,
        Input,
        Error,
        Output,
        AsyncFnController,
        ErrorResolverController,
        AccumulatedAsyncFnController
      >
    >(fn, awaitFn, errorNode)
  }
  return newNode
}

const chain = <
  DefaultInputOutput = unknown,
  DefaultError = unknown,
  DefaultAsyncFnController = void,
  DefaultErrorResolverController = void,
  Input = DefaultInputOutput,
  Error = DefaultError,
  Output = DefaultInputOutput,
  AsyncFnController = DefaultAsyncFnController,
  ErrorResolverController = DefaultErrorResolverController,
>(
  options?: ChainOptions,
) => {
  const opts: ChainOptions = {
    asyncByDefault: true,
    ...options,
  }
  const nNode = startChain<
    DefaultInputOutput,
    DefaultError,
    DefaultAsyncFnController,
    DefaultErrorResolverController
  >()

  return <
    ChildOut = Output,
    ChildError = Error,
    ChildAsyncFnController = AsyncFnController,
    ChildErrorResolverController = ErrorResolverController,
  >(
    asyncFn: (
      input: Input,
      resolver: Pins<ChildOut, ChildError, ChildAsyncFnController, ChildErrorResolverController>,
    ) => AsyncFnController,
  ) =>
    nNode<
      Input,
      ChildError,
      ChildOut,
      ChildAsyncFnController,
      ChildErrorResolverController,
      AsyncFnController | ChildAsyncFnController,
      // undefined,
      Input
    >(
      asyncFn as unknown as (
        input: Input,
        resolver: Pins<ChildOut, ChildError, ChildAsyncFnController, ChildErrorResolverController>,
      ) => ChildAsyncFnController,
    )
}

export default chain

// const a = chain<string>()
// const b = a<number>((x, resolver) => {
//   console.log(x)
//   resolver(1)
// })
// const c = b<boolean, string>((x, resolver) => {
//   console.log(`2:${x}`)
//   const y = resolver(true)
//   console.log(y)
// })
// const cX = c.onError((err) => {
//   console.log(`c.onError:${err}`)
// })
// const d = cX<string, string>((x, resolver) => {
//   console.log(x ? '3: true' : '3: false')
//   resolver('final error1')
//   return 10
// })

// d.input(
//   'I',
//   (out) => {
//     console.log(out)
//   },
//   (err) => {
//     console.log(`err:${err}`)
//   },
// )

// const a1 = chain<string, string, string>()
// const b1 = a1((x, resolver) => {
//   console.log(`a1:${x}`)
//   resolver('a1')
// })
// const c1 = b1((x, resolver) => {
//   console.log(`b1:${x}`)
//   debugger
//   resolver('b1')
// })
// const d1 = c1((x, resolver) => {
//   console.log(`c2:${x}`)
//   debugger
//   resolver('c2')
// })
// debugger
// const d2 = d1.onError((err) => {
//   console.log(`d1.onError:${err}`)
// })
// const e1 = d2((x, resolver) => {
//   console.log(`d1:${x}`)
//   debugger
//   resolver('e1')
// })
// e1.input(
//   'I',
//   (out) => {
//     console.log(out)
//   },
//   //   (err) => {
//   //     console.log(`err:${err}`)
//   //   },
// )

// // this type is obviously wrong as it has the same generics at both the top and property levels - i.e. generics are being redefined
// // as more information is available - hence my original stackoverflow question.
// type Chain<Input, Error = unknown, Output = unknown, StartInput = Input, FinalOutput = Output> = {
//   <Out = Output, ErrorType = Error>(
//     callback: (input: Input, resolver: Pins<Out, Error | ErrorType>) => void,
//   ): Chain<Out, Error | ErrorType, Out, StartInput, Out>
//   onResult<Out, ErrorType = Error>(
//     callback: (input: Input, resolver: Pins<Out, ErrorType>) => void,
//   ): Chain<Out, Error | ErrorType, Out, StartInput, Out>
//   onError(callback: (error: Error) => void): Chain<Input, Error, Output, StartInput, FinalOutput>
//   input(startInput: StartInput, resultCb: ResultCb<FinalOutput>, errorCb: ErrorCb<Error>): void
//   pins: Pins<Output, Error>
// }

// const chain = <
//   Input,
//   Error = unknown,
//   Output = Input,
//   AsyncFnController = void,
//   ErrorResolverController = void,
//   AccumulatedAsyncFnController = AsyncFnController,
// >(
//   options?: ChainOptions,
// ) => {
//   const opts: ChainOptions = {
//     asyncByDefault: true,
//     ...options,
//   }
//   const chainController: { controller: AccumulatedAsyncFnController | undefined } = {
//     controller: undefined,
//   }

//   const chainI = <I, Err, Out, AFnController, EController, AccAFnController>(
//     parent?: ChainNode<I, Err, Out, AFnController, EController, AccAFnController>,
//   ): ChainNode<I, Err, Out, AFnController, EController, AccAFnController> => {
//     const fn = function ChainFn<
//       ChildOut,
//       ChildError = Err,
//       ChildAsyncFnController = AFnController,
//       ChildErrorResolverController = EController,
//     >(
//       asyncFunction: (
//         input: Out,
//         resolver: Pins<ChildOut, ChildError, ChildAsyncFnController, ChildErrorResolverController>,
//       ) => ChildAsyncFnController,
//     ) {
//       // addChild
//       debugger
//       // const actualParent = parent
//       Object.assign(fn, {
//         await(
//           input: Out,
//           resultCb: ResultCb<ChildOut, ChildAsyncFnController>,
//           errorCb: ErrorCb<
//             ChildError,
//             ChildOut,
//             ChildAsyncFnController,
//             ChildErrorResolverController
//           >,
//         ) {
//           const pins = function PinsFn(resultArg: ChildOut) {
//             return pins.result(resultArg)
//           } as Pins<ChildOut, ChildError, ChildAsyncFnController, ChildErrorResolverController>

//           Object.assign(pins, {
//             result(resultArg: ChildOut) {
//               const res = resultCb(resultArg)
//               chainController.controller = res as unknown as AccumulatedAsyncFnController
//               return res
//             },
//             error(errorArg: ChildError) {
//               return errorCb(errorArg, pins.result)
//             },
//           })
//           if (parent) {
//             return parent.await(
//               input as unknown as I,
//               ((result) => asyncFunction(result, pins)) as unknown as ResultCb<Out, AFnController>,
//               errorCb as unknown as ErrorCb<Err, Out, AFnController, EController>,
//             )
//           }
//           return asyncFunction(input, pins)
//         },
//       })
//       return chainI(fn)
//     } as unknown as ChainNode<I, Err, Out, AFnController, EController, AccAFnController>
//     debugger
//     Object.assign(fn, {
//       await(
//         arg: I,
//         resultCb: ResultCb<Out, AFnController>,
//         errorCb: ErrorCb<Err, Out, AFnController, EController>,
//       ) {
//         debugger
//         if (parent) {
//           parent.await(arg, resultCb, errorCb)
//           return chainController
//         }
//         throw new Error('chain is empty - nothing to await')
//       },
//       onError(errorCb: ErrorCb<Err, Out, AFnController, EController>) {
//         return fn((input, resolver) => resolver.result(input), errorCb)
//       },
//       s<
//         ChildOut,
//         ChildError = Err,
//         ChildAsyncFnController = AFnController,
//         ChildErrorResolverController = EController,
//       >(syncFunction: (input: Out) => ChildOut) {
//         return fn<ChildOut, ChildError, ChildAsyncFnController, ChildErrorResolverController>(
//           (
//             input: Out,
//             resolver: Pins<
//               ChildOut,
//               Err | ChildError,
//               ChildAsyncFnController,
//               ChildErrorResolverController
//             >,
//           ) => resolver.result(syncFunction(input)) as unknown as AFnController,
//         )
//       },
//     })

//     return fn
//   }
//   return chainI<
//     Input,
//     Error,
//     Output,
//     AsyncFnController,
//     ErrorResolverController,
//     AccumulatedAsyncFnController
//   >()
// }
