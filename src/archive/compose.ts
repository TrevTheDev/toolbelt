import {
  AnyAsyncMapWithError,
  ErrorCbAny,
  FirstAsyncMap,
  GetErrorArg,
  GetInputArg,
  GetListenerArgs,
  GetResultArg,
  LastAsyncMap,
  ListenersAny,
  ResultCbAny,
  UnionOfAsyncMapArrayReturnTypes,
} from '../asyncMap'

const unhandledErrorCbDefault = <T>(error: T) => {
  throw new Error(
    `'errorCb' made, but no 'errorCb' provided to handle it. Error received: ${error}`,
  )
}

const asyncMapTryCatchToErrorCb =
  <
    Input,
    ResultCallback extends ResultCbAny,
    ErrorCallback extends ErrorCbAny,
    Listeners extends ListenersAny, //
    ReturnType,
  >(
    asyncMap: (
      input: Input,
      resultCb: ResultCallback,
      errorCb: ErrorCallback,
      ...listeners: Listeners
    ) => ReturnType,
  ) =>
  (input: Input, resultCb: ResultCallback, errorCb: ErrorCallback, ...listeners: Listeners) => {
    let alreadyCaught = false
    const handleError = (e): false => {
      if (!alreadyCaught) {
        alreadyCaught = true
        errorCb(e)
      }
      return false
    }
    const resCb = ((result) => {
      try {
        return resultCb(result)
      } catch (e) {
        return handleError(e)
      }
    }) as ResultCallback
    const errCb = ((error) => {
      try {
        return errorCb(error)
      } catch (e) {
        if (!alreadyCaught) {
          alreadyCaught = true
          throw new Error(`'errorCb' threw and error: ${e}`)
        }
        return undefined
      }
    }) as ErrorCallback
    try {
      return asyncMap(input, resCb, errCb, ...listeners)
    } catch (e) {
      return handleError(e)
    }
  }

const wrapInSetImmediate =
  <
    Input,
    Result,
    Error,
    Listeners extends ListenersAny, //
    ReturnType,
  >(
    asyncMap: (
      input: Input,
      resultCb: (result: Result) => void,
      errorCb: (error: Error) => void,
      ...listeners: Listeners
    ) => ReturnType,
  ) =>
  (
    input: Input,
    resultCb: (result: Result) => void,
    errorCb: (error: Error) => void = unhandledErrorCbDefault,
    ...listeners: Listeners
  ) => {
    const resCb = (result: Result) => setImmediate(() => resultCb(result))
    const errCb = (error: Error) => setImmediate(() => errorCb(error))
    return asyncMap(input, resCb, errCb, ...listeners)
  }

const mayBeThenable = (value) => value && (typeof value === 'object' || typeof value === 'function')

const resolveReturnedPromises =
  <
    Input,
    Result,
    Error,
    Listeners extends ListenersAny, //
    ReturnType,
  >(
    asyncMap: (
      input: Input,
      resultCb: (result: Result) => void,
      errorCb: (error: Error) => void,
      ...listeners: Listeners
    ) => ReturnType,
  ) =>
  (
    input: Input,
    resultCb: (result: Result) => void,
    errorCb: (error: Error) => void = unhandledErrorCbDefault,
    ...listeners: Listeners
  ) => {
    const resolver = (resolveFn) => (result) => {
      if (mayBeThenable(result)) {
        const { then } = result
        if (typeof then === 'function') then.call(result, resultCb, errorCb)
        else resolveFn(result)
      } else resolveFn(result)
    }
    return asyncMap(input, resolver(resultCb), resolver(errorCb), ...listeners)
  }

const enforceSingleResolution =
  <
    Input,
    ResultCallback extends ResultCbAny,
    ErrorCallback extends ErrorCbAny,
    Listeners extends ListenersAny,
    ReturnType,
  >(
    asyncMap: (
      input: Input,
      resultCb: ResultCallback,
      errorCb: ErrorCallback,
      ...listeners: Listeners
    ) => ReturnType,
  ) =>
  (input: Input, resultCb: ResultCallback, errorCb: ErrorCallback, ...listeners: Listeners) => {
    let resolvedFnName
    const resolveOnlyOnce = <T extends (result) => any>(
      resolutionFnName: string,
      resolutionFn: T,
    ) =>
      ((result) => {
        if (resolvedFnName) {
          throw new Error(
            resolvedFnName !== resolutionFnName
              ? `cannot call '${resolutionFnName}' after '${resolvedFnName}'`
              : `'${resolutionFnName}' may not be called more than once`,
          )
        } else {
          resolvedFnName = resolutionFnName
          return resolutionFn(result)
        }
      }) as T
    return asyncMap(
      input,
      resolveOnlyOnce('resultCb', resultCb),
      resolveOnlyOnce('errorCb', errorCb),
      ...listeners,
    )
  }

const trackCallbackEvents =
  <Arg, Result>(
    fn: (arg: Arg) => Result,
    beforeCalled?: () => void,
    afterCalled?: () => void,
  ): ((arg: Arg) => Result) =>
  (arg: Arg) => {
    // debugger
    beforeCalled?.()
    const result: Result = fn(arg)
    afterCalled?.()
    return result
  }

const trackAsyncMapEvents =
  <Input, ResultArg, ErrorArg, Listeners extends ListenersAny, ReturnType>(
    asyncMap: (
      input: Input,
      resultCb: (result: ResultArg) => void,
      errorCb: (error: ErrorArg) => void,
      ...listeners: Listeners
    ) => ReturnType,
    lifecycleCallbacks: {
      beforeAsyncMapCalledCb?: () => void
      beforeResultCb?: () => void
      afterResultCb?: () => void
      beforeErrorCb?: () => void
      afterErrorCb?: () => void
      resolvedCb?: () => void
    },
  ) =>
  (
    input: Input,
    resultCb: (result: ResultArg) => void,
    errorCb: (error: ErrorArg) => void = unhandledErrorCbDefault,
    ...listeners: Listeners
  ) => {
    lifecycleCallbacks.beforeAsyncMapCalledCb?.()
    let resCb = trackCallbackEvents(
      resultCb,
      lifecycleCallbacks.beforeResultCb,
      lifecycleCallbacks.afterResultCb,
    )
    let errCb = trackCallbackEvents(
      errorCb,
      lifecycleCallbacks.beforeErrorCb,
      lifecycleCallbacks.afterErrorCb,
    )
    if (lifecycleCallbacks.resolvedCb) {
      let resolved: (() => void) | undefined = lifecycleCallbacks.resolvedCb
      const resCb1 = resCb
      const errCb1 = errCb
      resCb = (result) => {
        // debugger
        const res = resCb1(result)
        if (resolved) resolved()
        resolved = undefined
        return res
      }
      errCb = (error) => {
        const res = errCb1(error)
        if (resolved) resolved()
        resolved = undefined
        return res
      }
    }
    // debugger
    return asyncMap(input, resCb, errCb, ...listeners)
  }

const wrapAsyncMap = <Input, Result, Error, Listeners extends ListenersAny, ReturnType>(
  asyncMap: (
    input: Input,
    resultCb: (result: Result) => void,
    errorCb: (error: Error) => void,
    ...listeners: Listeners
  ) => ReturnType,
  options?: {
    thrownErrorToErrorCb?: boolean
    enforceSingleResolution?: boolean
    wrapInSetImmediate?: boolean
    resolveReturnedPromises?: boolean
  },
  lifecycleCallbacks?: {
    beforeAsyncMapCalledCb?: () => void
    beforeResultCb?: () => void
    afterResultCb?: () => void
    beforeErrorCb?: () => void
    afterErrorCb?: () => void
    resolvedCb?: () => void
  },
) => {
  const opts = {
    thrownErrorToErrorCb: true,
    enforceSingleResolution: true,
    wrapInSetImmediate: false,
    resolveReturnedPromises: true,
    ...options,
  }
  let aMap: (
    input: Input,
    resultCb: (result: Result) => void,
    errorCb: (error: Error) => void,
    ...listeners: Listeners
  ) => false | ReturnType = asyncMap

  if (opts.enforceSingleResolution) aMap = enforceSingleResolution(aMap)
  if (opts.thrownErrorToErrorCb) aMap = asyncMapTryCatchToErrorCb(aMap)
  if (opts.thrownErrorToErrorCb) aMap = asyncMapTryCatchToErrorCb(aMap)
  if (opts.resolveReturnedPromises) aMap = resolveReturnedPromises(aMap)
  if (lifecycleCallbacks) aMap = trackAsyncMapEvents(aMap, lifecycleCallbacks)
  if (opts.wrapInSetImmediate) aMap = wrapInSetImmediate(aMap)

  return aMap
}

export const compose = <
  Input1,
  Input2,
  Output,
  ErrorArg,
  Listeners extends ListenersAny,
  ReturnType1,
  ReturnType2,
>(
  asyncMap1: (
    input: Input1,
    resultCb: (result: Input2) => void,
    errorCb: (errorArg: ErrorArg) => void | never,
    ...listeners: Listeners
  ) => ReturnType1,
  asyncMap2: (
    input: Input2,
    resultCb: (result: Output) => void,
    errorCb: (errorArg: ErrorArg) => void | never,
    ...listeners: Listeners
  ) => ReturnType2,
) => {
  const controller: {
    controller?: ReturnType1 | ReturnType2
  } = {}

  return (
    input: Input1,
    resultCb: (result: Output) => void,
    errorCb: (error: ErrorArg) => void = unhandledErrorCbDefault,
    ...listeners: Listeners
  ) => {
    const eCb = (errorArg: ErrorArg) => {
      delete controller.controller
      return errorCb(errorArg)
    }
    controller.controller = asyncMap1(
      input,
      (result) => {
        controller.controller = asyncMap2(
          result,
          (results) => {
            delete controller.controller
            resultCb(results)
          },
          eCb,
          ...listeners,
        )
      },
      eCb,
      ...listeners,
    )
    return controller
  }
}

export const compose3 = <T extends AnyAsyncMapWithError[]>(...asyncMaps: T) => {
  const controller: {
    controller?: UnionOfAsyncMapArrayReturnTypes<T>
  } = {}

  return (
    input: GetInputArg<FirstAsyncMap<T>>,
    resultCb: (result: GetResultArg<LastAsyncMap<T>>) => void,
    errorCb: (error: GetErrorArg<LastAsyncMap<T>>) => void = unhandledErrorCbDefault,
    ...listeners: GetListenerArgs<FirstAsyncMap<T>>
  ) => {
    let i = 0
    const max = asyncMaps.length

    const processAsyncMap = (result, asyncMap) => {
      let hasResolved = false
      const hasResolvedWrapper = (fn) => (arg) => {
        hasResolved = true
        delete controller.controller
        return fn(arg)
      }
      const resCb = (res) => {
        if (i >= max) return resultCb(res)
        const nextAsyncMap = asyncMaps[i]
        i += 1
        return processAsyncMap(res, nextAsyncMap)
      }
      const asyncMapController = asyncMap(
        result,
        hasResolvedWrapper(resCb),
        hasResolvedWrapper(errorCb),
        ...listeners,
      )
      /** if currentAsyncMap is not sync, then set asyncMapController */
      if (!hasResolved) controller.controller = asyncMapController
    }
    processAsyncMap(input, (res, resultsCb) => resultsCb(res))
    return controller
  }
}

export const compose2 = <T extends AnyAsyncMapWithError[]>(
  asyncMaps: T,
  options?: {
    thrownErrorToErrorCb?: boolean
    enforceSingleResolution?: boolean
    wrapInSetImmediate?: boolean
    resolveReturnedPromises?: boolean
  },
  lifecycleCallbacks?: {
    beforeAsyncMapCalledCb?: () => void
    beforeResultCb?: () => void
    afterResultCb?: () => void
    beforeErrorCb?: () => void
    afterErrorCb?: () => void
    resolvedCb?: () => void
  },
) => {
  const opts = {
    thrownErrorToErrorCb: true,
    enforceSingleResolution: true,
    wrapInSetImmediate: false,
    resolveReturnedPromises: true,
    ...options,
  }
  const mapOpts = {
    thrownErrorToErrorCb: opts.thrownErrorToErrorCb,
    enforceSingleResolution: opts.enforceSingleResolution,
    wrapInSetImmediate: opts.enforceSingleResolution,
    resolveReturnedPromises: opts.enforceSingleResolution,
  }
  const cMapOpts = {
    wrapInSetImmediate: opts.enforceSingleResolution,
  }
  const newAMaps = asyncMaps.map((asyncMap) => wrapAsyncMap(asyncMap, mapOpts))

  let cMap = compose3(...newAMaps)
  cMap = wrapAsyncMap(cMap, mapOpts, lifecycleCallbacks) as typeof cMap
  return cMap
}
