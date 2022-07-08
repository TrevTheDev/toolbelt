/* eslint-disable @typescript-eslint/no-explicit-any */
import type {
  IsStrictAny,
  IsStrictVoid,
  Lookup,
  IsStrictNever,
  IsStrictUnknown,
  IsStrictUnknownArray,
  IsStrictAnyArray,
  IsNotTuple,
} from './typescript utils'

export type ResultCb = (...resultArgs: any)=>void
export type ErrorCb = (...errorArgs)=>void
export type CancelCb = (...cancelArgs)=>void

// export type AsyncMap<
//   Input,
//   ResultCb extends ResultCbType = (result)=>void,
//   ErrorCb extends ErrorCbType = never,
//   CancelFn extends CancelFnType = never,
//   CFn = [CancelFn] extends [never] ? void:CancelFn
// > = [ErrorCb] extends [never] ?
//      (input: Input, result: ResultCb)=>CFn :
//      (input: Input, result: ResultCb, error: ErrorCb)=>CFn

// type ListenChannels2 = [ resultCb: (...resultArgs: unknown[])=>void, errorCb?: (...errorArgs: unknown[])=>void, ...listeners: ((...args: unknown[])=>void)[]]
// type Speakers2 = void | CancelFnType | [...speakers: ((...args: unknown[])=>void)[]]
// export type AsyncMap2 = (input: unknown, ...listenChannels: ListenChannels2)=> Speakers2

export type AsyncMap = ((input: any, result: ResultCb)=>void) | ((input: any, result: ResultCb, error: ErrorCb)=>void)

type InputTypeSignature = unknown[]|unknown
type ResultTypeSignature = unknown[]|unknown
type ErrorTypeSignature = unknown[]|void|unknown
type CancelTypeSignature = unknown[]|void|unknown

// export type ResultFn<ResultArguments extends unknown[]> = (...resultArgs: ResultArguments)=>void
type ResultCb2<ResultArguments extends ResultTypeSignature = unknown> = ResultArguments extends unknown[] ? (...resultArgs: ResultArguments)=>void : ResultArguments
// export type ErrorFn<ErrorArguments extends unknown[]> = (...errorArgs: ErrorArguments)=>void
type ErrorFn<ErrorArguments extends ErrorTypeSignature> = ErrorArguments extends unknown[] ? (...errorArgs: ErrorArguments)=>void : ErrorArguments
// export type CancelFn<CancelArguments extends unknown[]> = (...cancelArgs: CancelArguments)=>void
type CancelFn<CancelArguments extends CancelTypeSignature> = CancelArguments extends unknown[] ? (...cancelArgs: CancelArguments)=>void : CancelArguments

type AnyCb = (...args)=>void
type UnknownCb = (...args:unknown[])=>void
type NeverCb = (...args:never)=>never

type TypeSwitch<
  T,
  AnyCase=T,
  AnyArrayCase=T,
  UnknownCase=T,
  UnknownArrayCase=T,
  NeverCase=T,
  Else=T
> = IsStrictNever<T> extends true ? NeverCase :
  T extends IsStrictAny<T> ? AnyCase :
  T extends IsStrictAnyArray<T> ? AnyArrayCase :
  T extends IsStrictUnknown<T> ? UnknownCase :
  T extends IsStrictUnknownArray<T> ? UnknownArrayCase : Else

type TransformArrayItemToListener<
  T,
  T1 = T extends AnyCb|unknown ? T : never,
  T2 = TypeSwitch<T1, AnyCb, never, UnknownCb, never, NeverCb>
> = T2

type ForEachT_<
  T extends unknown[],
  PreviousResults extends unknown[] = [],
  Result = T extends [arg0: infer H, ...args:any] ? TransformArrayItemToListener<H> : never,
  RemainingItemsToForEach extends unknown[] = T extends [arg0: any, ...args:infer R] ? R : [],
  ResultsSoFar extends unknown[] = T extends [] ? [] : [...PreviousResults, Result]
> = RemainingItemsToForEach extends [] ? ResultsSoFar : ForEachT_<RemainingItemsToForEach, ResultsSoFar>

type ForEachT<T extends unknown[]> = T extends IsNotTuple<T> ? T : ForEachT_<T>

type DefaultUnknownListeners = [
  resultCb: (...resultArgs:unknown[])=>void,
  errorCb: (...errorArgs:unknown[])=>void
] | [ resultCb: (...resultArgs:unknown[])=>void ]

type DefaultAnyListeners = [
  resultCb: (...resultArgs)=>void,
  errorCb: (...errorArgs)=>void
] | [
  resultCb: (...resultArgs)=>void
]

type DefaultUnknownSpeakers = [ cancel: (...cancelArgs:unknown[])=>void ]

type AllowedCbTypes = (AnyCb|unknown)[]

type CallbackArguments<
  T extends AllowedCbTypes,
  DefaultNeverType = NeverCb[],
  DefaultAnyType = AnyCb[],
  DefaultUnknownType = UnknownCb[],
> = TypeSwitch<ForEachT<T>, DefaultAnyType, DefaultAnyType, DefaultUnknownType, DefaultUnknownType, DefaultNeverType>

type ReplaceStrictAnyArray<T, Replacement=any> = T extends IsStrictAnyArray<T> ? Replacement : T
type ReplaceStrictUnknownArray<T, Replacement=unknown> = T extends IsStrictUnknownArray<T> ? Replacement : T
type ReplaceAnyUnknown<T, AnyT, UnknownT> = T extends IsStrictAny<T> ? AnyT : T extends IsStrictUnknown<T> ? UnknownT : T

type AsyncMapParamArray<
  Arguments extends unknown[] = [input: any | any[], ...args: DefaultAnyListeners],
  T = ReplaceStrictUnknownArray<ReplaceStrictAnyArray<Arguments>>,
  Input = T extends IsStrictAny<T> ? any : T extends [arg0: infer A, ...args:any] ? A : never,
  Listeners extends unknown[] = T extends IsStrictAny<T> ? CallbackArguments<any> :
    T extends [arg0: any, arg1: any, ...args: any] ?
    T extends [arg0: any, ...args2: infer B] ?
    B extends [] ? UnknownCb[] : CallbackArguments<B> : never : never,
> = [input: Input, ...listeners: Listeners]

type AsyncMapSpeakerArray<
  Speakers extends AnyCb[] | void = any,
  Speakers2 = Speakers extends IsStrictAny<Speakers> ? void | AnyCb[] :
    Speakers extends IsStrictUnknown<Speakers> ? void | UnknownCb[] :
    Speakers extends unknown[] ? CallbackArguments<Speakers> : Speakers,
> = Speakers2

type zff = ForEachT<[any, unknown, (result:string)=>void]>
type zff2<T=[unknown[]]> = T extends [arg0: unknown, arg1: infer B] ? B : never
type x = zff2

type sdsds = [] extends [] ? true: false

type parms = AsyncMapParamArray
type parms2 = AsyncMapParamArray<never>
type parms3 = AsyncMapParamArray<any>
type parms5 = AsyncMapParamArray<any[]>
type parms51 = AsyncMapParamArray<[any, any]>
type parms531 = AsyncMapParamArray<[any]>
type parms52 = AsyncMapParamArray<[cancelCb: ()=>boolean]>
type parms53 = AsyncMapParamArray<[unknown]>
type parms54 = AsyncMapParamArray<unknown>
type parms56 = AsyncMapParamArray<void>
type parms4 = AsyncMapParamArray<unknown[]>
type parms6 = AsyncMapParamArray<[input: string, resultCb: (result:string)=>void]>
type parms62 = AsyncMapParamArray<[resultCb: (...results:unknown[])=>unknown]>
type parms61 = AsyncMapParamArray<[input: string, resultCb: (result:string)=>boolean]>
type parms7 = AsyncMapParamArray<[any, any]>
type parms8 = AsyncMapParamArray<[input: string, resultCb: (result:string)=>boolean, vdar: any]>

const testFn = (str) => console.log(str)
testFn('a')

type CommsChannel<Args extends unknown[] = [...resultArgs: unknown[]]> = (...args: Args)=>void
type z=CommsChannel

type AsyncMapFromArgs2<
  I extends InputTypeSignature = unknown,
  ResultArguments extends ResultTypeSignature = unknown[],
  ErrorArguments extends ErrorTypeSignature = unknown[],
  CancelArguments extends CancelTypeSignature = unknown[]|void,
  R = ResultFn<ResultArguments>,
  E = ErrorFn<ErrorArguments>,
  C = CancelFn<CancelArguments>
> = [E] extends [never] ? (input: I, result: R)=>C : (input: I, result: R, error: E)=> C

type z = AsyncMapFromArgs2

export type AsyncMapWithCancel = {
  (input: unknown, result: ResultCb):CancelCb
  (input: unknown, result: ResultCb, error: ErrorCb):CancelCb
}

// type AsyncMapObjIFace<
//   Input,
//   ResultCb extends ResultCbType,
//   ErrorCb extends ErrorCbType = never,
//   CancelFn extends CancelFnType = never,
//   CFn = [CancelFn] extends [never] ? null : {cancel: CancelFn},
//   ResultOnlyType = {
//     await: (input: Input, resultCb?: ResultCb) => AsyncMapObjIFace<Input, ResultCb, ErrorCb, CancelFn>,
//     onResult: (resultCb:ResultCb)=> AsyncMapObjIFace<Input, ResultCb, ErrorCb, CancelFn>,
//     then: (resultCb?: ResultCb) => AsyncMapObjIFace<Input, ResultCb, ErrorCb, CancelFn>,
//     resolve: (result?)=> AsyncMapObjIFace<Input, ResultCb, ErrorCb, CancelFn>
//   },
//   ErrorOnlyType = [ErrorCb] extends [never] ? null : {
//     await: (input: Input, resultCb?: ResultCb, errorCb?: ErrorCb) => AsyncMapObjIFace<Input, ResultCb, ErrorCb, CancelFn>,
//     onError: (errorCb:ErrorCb)=> AsyncMapObjIFace<Input, ResultCb, ErrorCb, CancelFn>,
//     then: (resultCb?: ResultCb, errorCb?:ErrorCb) => AsyncMapObjIFace<Input, ResultCb, ErrorCb, CancelFn>,
//     catch: (errorCb:ErrorCb) => AsyncMapObjIFace<Input, ResultCb, ErrorCb, CancelFn>,
//     reject: (reason?)=> AsyncMapObjIFace<Input, ResultCb, ErrorCb, CancelFn>
//   }
// > = Union<Union<ErrorOnlyType, ResultOnlyType>, CFn>

// type AsyncMapObjIFace2<
//   Input,
//   Listeners extends ((...args)=>void)[] = [result: (...resultArgs)=>void],
//   Speakers extends ((...args)=>void)[] = [],
//   CancelFn extends (...cancelArgs)=>void = never,
//   CFn = [CancelFn] extends [never] ? null : {cancel: CancelFn},
//   This = void,
//   ResultOnlyType = {
//     await: (input: Input, resultCb?: ResultCb) => This,
//     onResult: (resultCb:ResultCb)=> This,
//     then: (resultCb: ResultCb) => This
//   },
//   ErrorOnlyType = [ErrorCb] extends [never] ? null : {
//     await: (input: Input, resultCb?: ResultCb, errorCb?: ErrorCb) => This,
//     onError: (errorCb:ErrorCb)=> This,
//     then: (resultCb: ResultCb, errorCb:ErrorCb) => This,
//     catch: (errorCb:ErrorCb) => This
//   }
// > = Union<Union<ErrorOnlyType, ResultOnlyType>, CFn>

// export const asyncMapThenable = <
//   Input,
//   ResultCb extends (...resultArgs)=>void
// >(asyncMap: AsyncMap<Input, ResultCb>) : AsyncMapObjIFace<Input, ResultCb> => {
//   const resultCbArray: ResultCb[] = []
//   let asyncMapObjIFace
//   const execute = (input?, resCbArray = resultCbArray) => {
//     const rCb = (...args) => resCbArray.forEach((resCb) => resCb(...args))
//     asyncMap(input, rCb as ResultCb)
//     return asyncMapObjIFace
//   }
//   asyncMapObjIFace = {
//     await: (input: Input, resultCb?: ResultCb) => execute(input, resultCb ? [resultCb] : resultCbArray),
//     onResult: (resultCb: ResultCb) => { resultCbArray.push(resultCb); return asyncMapObjIFace },
//     then: (resultCb: ResultCb) => { asyncMapObjIFace.onResult(resultCb); execute() },
//   }
//   return asyncMapObjIFace
// }

// const x = asyncThenable<string, ((output: string)=>void)>((input, result) => {
//   setTimeout(() => result(input), 10)
// })
// x.await('a', (result) => console.log(result))

// type GetCb<T> = T extends { callback: any } ? T['callback'] : never
// type GetKey<T> = T extends { name: string } ? `on${Capitalize<T['name']>}`: 'bob'
// // type FilterNumbers<T extends PropertyKey> = T extends `${number}` ? T : never

// type Listeners<
//     ListenChannels extends unknown[],
// > = {
//     // ArrayContent: ArrayContent
//     [P in Exclude<keyof ListenChannels, keyof any[]> as GetKey<ListenChannels[P]>]: GetCb<ListenChannels[P]>
// };
// type ResultsCommsChannel = CommsChannel & {
//   name: 'results',
//   callback: (...resultArgs: string[]) => void,
// }

// type ErrorCommsChannel = {
//   name: 'error',
//   callback: (...errorArgs: number[]) => void,
// }

// type x = [ resultsCommsChannel: ResultsCommsChannel, errorCommsChannel: ErrorCommsChannel ]
// type X1 = x
// type X2 = Listeners<X1>

// type asyncMap<T, ListenChannels extends commsChannel[], speakChannels extends (commsChannel[]|void)> = {
// [Properties in keyof T]: T[Properties];
// // (input: any): this;
// // (input: any, ...listenChannels: ListenChannels): speakChannels;
// await?(...listenChannels: ListenChannels) : speakChannels;
// awaitWithInput?(input: any, ...listenChannels: ListenChannels): speakChannels;
// addInput: (input: any)=> this;

// // listenChannels
// onResult?: (result:any)=> this,
// onError?: (error:any)=> this,
// // speakChannels
// pause?(...pauseArgs: any):(...unpauseArgs: any)=>void
// cancel?(...cancelReasons:any):void
// }

// const STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg
// const ARGUMENT_NAMES = /([^\s,]+)/g
// const getParamNames = (func) => {
//   const fnStr = func.toString().replace(STRIP_COMMENTS, '')
//   let result = fnStr.slice(fnStr.indexOf('(') + 1, fnStr.indexOf(')')).match(ARGUMENT_NAMES)
//   if (result === null) result = []
//   return result
// }

// const isFunction = Symbol('isFunction')

// declare global {
//   // eslint-disable-next-line @typescript-eslint/no-unused-vars
//   interface Function { [isFunction]: true }
// }

// // eslint-disable-next-line no-extend-native
// Function.prototype[isFunction] = true

// type ListenFn = (...args: unknown[]) => void
// type SpeakFn = ListenFn

// const createAsyncMap = <
//   ListenChannelDefs extends CommsChannelTypeDef[],
//   SpeakChannelDefs extends CommsChannelTypeDef[],
// >(
//     listenChannelDefinitions : CommsChannelDefinitionArray<ListenChannelDefs>,
//     speakChannelDefinitions? : CommsChannelDefinitionArray<SpeakChannelDefs> | undefined,
//   ) => (asyncFn) => {
//     let status = 'init'
//     let inputArray: unknown[] = []
//     const throwOnUnhandledMessage = true
//     const speakFns: SpeakFn[] = []
//     const asyncMapType = {}
//     const validMsg = (
//       terminatedChannel: boolean,
//       channel: { name: string; terminateAsyncMap?: boolean; terminateChannel?: boolean },
//     ) : boolean => {
//       if (status !== 'awaiting') throw new Error(`AsyncMap status is '${status}' and not 'awaiting'`)
//       if (terminatedChannel) throw new Error(`channel '${channel.name}' has already terminated`)
//       if (channel.terminateChannel) terminatedChannel = true
//       if (channel.terminateAsyncMap) status = 'ended'
//       return terminatedChannel
//     }
//     const enhancedListenChannels = listenChannelDefinitions.map((listenChannel) => {
//       let terminatedChannel = false
//       const listeningFn: ListenFn[] = []
//       asyncMapType[`on${capitalise(listenChannel.name)}`] = (fn: ListenFn) => listeningFn.push(fn)
//       return (...args: unknown[]) => {
//         terminatedChannel = validMsg(terminatedChannel, listenChannel)
//         if (listeningFn.length === 0 && throwOnUnhandledMessage) throw new Error(`unhandled message received on channel ${listenChannel.name}`)
//         listeningFn.forEach((fn) => fn(...args))
//       }
//     })
//     const enhancedSpeakChannels = speakChannelDefinitions ? speakChannelDefinitions.map((speakChannel, index) => {
//       let terminatedChannel = false
//       return (...args: unknown[]) => {
//         terminatedChannel = validMsg(terminatedChannel, speakChannel);
//         (<SpeakFn>speakFns[index])(...args)
//       }
//     }) : []
//     const mapListenChannelsToDefs = (listenChannels) => {
//       if (
//         listenChannels.length !== listenChannelDefinitions.length
//       ) throw new Error(`AsyncFn requires : ${listenChannelDefinitions.length} listen channels, but only ${listenChannels.length} was provided`)
//       listenChannels.forEach(
//         (listenChannel, index) => asyncMapType[`on${capitalise(
//           (<CommsChannelTypeDef['object']>listenChannelDefinitions[index]).name,
//         )}`](listenChannel),
//       )
//     }
//     function execute(inputs?) {
//       if (arguments.length !== 0) inputArray = [...inputArray, ...inputs]
//       if (status !== 'init') throw new Error('asyncFn not in \'init\' status')
//       status = 'awaiting'
//       const retV = asyncFn(inputArray, ...enhancedListenChannels)
//       if (speakChannelDefinitions === undefined || speakChannelDefinitions.length === 0) {
//         if (retV !== undefined) throw new Error('AsyncFn returned a value when none was expected')
//         // no speakChannelDefinitions && no retV - good
//         return undefined
//       }
//       if (retV === undefined) throw new Error(`asyncFn didn't return an array when an array of ${speakChannelDefinitions.length} is required`)
//       // eslint-disable-next-line no-nested-ternary
//       const retArray = Array.isArray(retV) ? retV : retV[isFunction] ? [retV] : retV

//       if (retArray.length !== speakChannelDefinitions.length)
//         throw new Error(`asyncFn returned : ${retArray.length} item when an array of ${speakChannelDefinitions.length} is required`)

//       if (!Array.isArray(retArray)) throw new Error('AsyncMap must return either an array of functions or a single function')

//       retArray.forEach((speakFn, index) => {
//         if (!speakFn[isFunction]) throw new Error('AsyncMap return value must be a function')
//         speakFns[index] = speakFn
//         asyncMapType[(<CommsChannelTypeDef['object']>speakChannelDefinitions[index]).name] = speakFn
//       })
//       return enhancedSpeakChannels
//     }
//     Object.defineProperties(asyncMapType, {
//       await: {
//         value: (...listenChannels) => {
//           mapListenChannelsToDefs(listenChannels)
//           return execute()
//         },
//       },
//       awaitWithInput: {
//         value: (inputs, ...listenChannels) => {
//           mapListenChannelsToDefs(listenChannels)
//           return execute(inputs)
//         },
//       },
//       addInput: {
//         value: (...inputs) => {
//           inputArray = [...inputArray, ...inputs]
//           return asyncMapType
//         },
//       },
//     })

//     return asyncMapType
//   }

// const xdsdsd = [
//   { name: 'result', terminateAsyncMap: false, terminateChannel: false } as const,
//   { name: 'error', terminateAsyncMap: true, terminateChannel: true } as const,
// ]
// type y = typeof xdsdsd

// const asyncMap = createAsyncMap([
//   { name: 'result', terminateAsyncMap: false, terminateChannel: false },
//   { name: 'error', terminateAsyncMap: true, terminateChannel: true },
// ], [{ name: 'cancel', terminateAsyncMap: false, terminateChannel: false }])

// const basic2 = asyncMap((input, result, error) => {
//   setTimeout(() => {
//     result(input.map((letter) => capitalise(letter)))
//     setTimeout(() => error('hello'))
//   }, 100)
//   return (cancelReason) => console.log(`onCancel: ${cancelReason}`)
// })
// basic2.onResult((result) => console.log(`onResult: ${result}`))
// basic2.onError((error) => console.log(`onError: ${error}`))
// const [cancel] = basic2.awaitWithInput(['a', 'b'], (res) => console.log(res))
// cancel('cancelled')
// basic2.cancel('cancelled2')
// console.log(createAsyncMap[isFunction])

/*
  Generic ***********************************************************************************************************************************************
*/
// looks up K in Type T otherwise return Else
// type Lookup<T, K extends keyof any, Else = never> = K extends keyof T ? T[K] : Else
// type IsStrictAny<T> = 0 extends (1 & T) ? T : never;
// type IsVoid<T> = T extends void ? T : never
// type IsNotStrictAny<T> = T extends IsStrictAny<T> ? never : T
// type IsStrictVoid<T> = IsVoid<T> & IsNotStrictAny<T>
/*
  Generic ***********************************************************************************************************************************************
*/

/* Inference ***********************************************************************************************************************************************
*/

type InputTypeSignature = unknown[]|unknown
type ResultTypeSignature = unknown[]|unknown
type ErrorTypeSignature = unknown[]|void|unknown
type CancelTypeSignature = unknown[]|void|unknown

// export type ResultFn<ResultArguments extends unknown[]> = (...resultArgs: ResultArguments)=>void
type ResultFn<ResultArguments extends ResultTypeSignature> = ResultArguments extends unknown[] ? (...resultArgs: ResultArguments)=>void : ResultArguments
// export type ErrorFn<ErrorArguments extends unknown[]> = (...errorArgs: ErrorArguments)=>void
type ErrorFn<ErrorArguments extends ErrorTypeSignature> = ErrorArguments extends unknown[] ? (...errorArgs: ErrorArguments)=>void : ErrorArguments
// export type CancelFn<CancelArguments extends unknown[]> = (...cancelArgs: CancelArguments)=>void
type CancelFn<CancelArguments extends CancelTypeSignature> = CancelArguments extends unknown[] ? (...cancelArgs: CancelArguments)=>void : CancelArguments

type AsyncMapFromArgs<
  I extends InputTypeSignature = unknown[],
  ResultArguments extends ResultTypeSignature = unknown[],
  ErrorArguments extends ErrorTypeSignature = never,
  CancelArguments extends CancelTypeSignature = void,
  R = ResultFn<ResultArguments>,
  E = ErrorFn<ErrorArguments>,
  C = CancelFn<CancelArguments>
> = [E] extends [never] ? (input: I, result: R)=>C : (input: I, result: R, error: E)=> C

/** types that may be inferred to be AsyncMaps */
type GeneralAsyncMapAny = (input: any, resolve:any, error:any)=>any
 | ((input1: any, resolve1:any)=>any)
 | AsyncMapFromArgs<unknown, unknown, unknown, unknown>
 | AsyncMapFromArgs<any, any, any, any>
 | AsyncMapFromArgs<any, any>

/** stores destructured AsyncMap */
type AsyncMapCompSig = { input: InputTypeSignature, result: ResultTypeSignature, cancel: CancelTypeSignature, error: ErrorTypeSignature|never }

/** infers the error type from a function */
type GetError<
  T, P = T extends (...args: infer A) => any ? A extends [any, any, infer E] ? E : never : never,
> = P extends (...args: infer A) => void ? A : P

/** Infers an AsyncMap into its constituent parts */
type InferAsyncMapParts<
  T extends GeneralAsyncMapAny,
  I extends InputTypeSignature = T extends (Input: infer IN, Result: any, Error?: any) => any ? IN : never,
  R extends ResultTypeSignature = T extends (Input: any, Result: infer RE, Error?: any) => any ? RE extends (...args: infer R2) => void ? R2 : RE : never,
  E extends ErrorTypeSignature = GetError<T>,
  C extends CancelTypeSignature = T extends (...args: any[]) => infer Can ? Can extends (...args: infer CA)=>void ? CA : Can : never,
  HasOther extends boolean = T extends (Input: any, Result: any, Error?: any) => any ? true : false
  > = HasOther extends true ? { input: I, result: R, error: E, cancel: C } : never

/** takes an AsyncMapCompSig, the AsyncMapCompSig before it in the array, and the AsyncMapCompSig after it in the
 * array and constitutes it into an AsyncMap
*/
type PartsToAsyncMap<
  T extends AsyncMapCompSig,
  Previous extends AsyncMapCompSig,
  Next extends AsyncMapCompSig,
  Parent extends AsyncMapCompSig
>=AsyncMapFromArgs<
  Next['result'],
  Previous['input'],
  T['error'] extends never ? never : Parent['error'],
  IsStrictVoid<T['cancel']> extends never ? Parent['cancel'] : void
>

/** Infers an function or AsyncMap into an AsyncMap */
type InferAsyncMap<
  T extends GeneralAsyncMapAny,
  A extends AsyncMapCompSig = InferAsyncMapParts<T>
> = AsyncMapFromArgs<A['input'], A['result'], A['error'], A['cancel']>

/** Infers an array of functions or AsyncMaps into an array AsyncMaps */
type InferArrayOfAsyncMaps<T extends readonly GeneralAsyncMapAny[]> = [...{ [I in keyof T]: T[I] extends GeneralAsyncMapAny ? InferAsyncMap<T[I]> : never }];

// maps an array of functions, to an array of their arguments
type FuncArrayToAsyncMapPartsArray<T extends GeneralAsyncMapAny[]> = [...args: {
  [I in keyof T ]: T[I] extends GeneralAsyncMapAny ? InferAsyncMapParts<T[I]> : never
}]

type InferAsyncMapArrayParent<
  F extends AsyncMapCompSig,
  L extends AsyncMapCompSig,
  FirstInput extends InputTypeSignature = F['input'],
  FinalResolve extends ResultTypeSignature = L['result']
> = AsyncMapFromArgs<FirstInput, FinalResolve>

type AsyncMapArrayType<
  T extends readonly GeneralAsyncMapAny[],
  ParentAsyncMap extends GeneralAsyncMapAny = AsyncMapFromArgs<unknown, unknown, unknown, unknown>, // final result call
  ParentAsyncMapI extends AsyncMapCompSig = InferAsyncMapParts<ParentAsyncMap>,
  InverseParent extends AsyncMapFromArgs<any, any, any, any> = AsyncMapFromArgs<
    ParentAsyncMapI['result'], ParentAsyncMapI['input'], ParentAsyncMapI['error'], ParentAsyncMapI['cancel']
  >,
  ArrayOfAsyncMaps extends AsyncMapFromArgs<any, any, any, any>[] = InferArrayOfAsyncMaps<T>,
  L extends AsyncMapFromArgs<any, any, any, any>[] = [InverseParent, ...ArrayOfAsyncMaps, InverseParent],
  B extends AsyncMapCompSig[] = FuncArrayToAsyncMapPartsArray<L>,
  A extends AsyncMapCompSig[] = B extends [any, ...infer R] ? R extends AsyncMapCompSig[] ? R : never : never,
  C extends AsyncMapCompSig[] = B extends unknown[] ? [never, ...B] : never,
> = { [I in keyof C]:
  PartsToAsyncMap<
    Lookup<B, I> extends AsyncMapCompSig ? Lookup<B, I> : never,
    Lookup<A, I> extends AsyncMapCompSig ? Lookup<A, I> : never,
    C[I] extends AsyncMapCompSig ? C[I] : never,
    ParentAsyncMapI
  >
 } extends [arg0: any, ...args: infer R, arg1: any, arg2: any] ? R : never

/*
  Inference ***********************************************************************************************************************************************
*/

type AsyncMapArray<
  I extends InputTypeSignature = unknown[],
  ResultArguments extends ResultTypeSignature = unknown[],
  ErrorArguments extends ErrorTypeSignature = never,
  CancelArguments extends CancelTypeSignature = void
> = (AsyncMapFromArgs<I, ResultArguments, ErrorArguments, CancelArguments>)[]

type AwaitChainInSeriesInputArgs<
  T extends GeneralAsyncMapAny[],
  P extends AsyncMapCompSig,
  FirstAsyncChain extends AsyncMapCompSig = InferAsyncMapParts<T[0]>,
  UpdatedParent extends AsyncMapFromArgs<any, any, any, any> = AsyncMapFromArgs<FirstAsyncChain['input'], P['result'], P['error'], P['cancel']>
> = AsyncMapArrayType<T, UpdatedParent>

// type AwaitChainInSeries2<
// T extends GeneralAsyncMapAny,
// InferredT extends AsyncMapCompSig = InferAsyncMapParts<T>,
// Input extends GeneralAsyncMapAny[] = InferredT['input'] extends GeneralAsyncMapAny[] ? InferredT['input'] : never,
// I = AwaitChainInSeriesInputArgs<Input,InferredT>,
// Arr = AsyncMapArrayType<I['ArrayOfAsyncMaps']>,

// ResultArguments extends ResultTypeSignature = unknown[],
// ErrorArguments extends ErrorTypeSignature = never,
// CancelArguments extends CancelTypeSignature = void,
// R = ResultFn<ResultArguments>,
// E = ErrorFn<ErrorArguments>,
// C = CancelFn<CancelArguments>
// > = T extends (input: infer I, result: infer R, error?: E)=> C
