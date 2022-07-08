export { default as reverseForEach, globalReverseForEach } from './reverseForEach'
export { createUid, capitalise, runFunctionOnlyOnce, curriedRunFunctionOnlyOnce, isObjectAndHasExecutableProperty } from './smallUtils'
export { default as asyncMapChain2, awaitAsyncMapChain } from './asyncMapChain2'

// export { default as callbacksInParallel } from './callbacksInParallel'
// export { default as serialCallbackChain } from './serialCallbackChain'
// // export type {
// //   AsyncMap, ResultCb, ErrorCb, CancelCb,
// // } from './asyncMap'
export { default as asyncMapChain } from './asyncMapChain'
// export { default as asyncCoupler, asyncCoupler as customAsyncCoupler } from './asyncCoupler'
// export type { AsyncCoupler } from './asyncCoupler'
export { default as queueWithAsyncRemoveAll, queue } from './queue'
export type { Queue, QueueWithAsyncRemoveAll } from './queue'

export { wrapAsyncMapInPromise, promiseTestObject } from './archive/wrapAsyncMapInPromise'
