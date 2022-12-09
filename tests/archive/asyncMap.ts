import type { AnyAsyncMap, AnyAsyncMapWithError, AsyncMap, AsyncMapArray, ComposedSerialAsyncMap, FirstAsyncMap, LastAsyncMap, ParallelAsyncMapArrayResults } from '../src/asyncMap'

const t = (result: true) => console.log(result)
const f = (result: false) => console.log(result)
type TExtends<V, T1> = V extends T1 ? (V extends AnyAsyncMap ? true : false) : false
type TExtendsWithError<V, T1> = V extends T1 ? (V extends AnyAsyncMapWithError ? true : false) : false

type T1 = AsyncMap<'I', (result: 'R') => 'RR'>
const f1 = <T extends AnyAsyncMap>(asyncMap: T) => {
  console.log(asyncMap)
  asyncMap('dog', (...results) => console.log(results))
}
f1((input: 'I', resultCb: (result: string) => void) => resultCb(input))

t(
  false as TExtends<
    AsyncMap<'I', (result: 'R') => 'RR'>, //
    (input: 'I', resultCb: (result: 'R') => 'RR') => void
  >,
)
t(false as TExtends<AsyncMap<'I', (result: 'R') => 'RR', (error: 'E') => 'ER'>, (input: 'I', resultCb: (result: 'R') => 'RR', errorCb: (result: 'E') => 'ER') => void>)
t(
  false as TExtends<
    AsyncMap<'I', (result: 'R') => 'RR', (error: 'E') => 'ER', 'AR', [cancelMeFn: (arg: string) => void]>,
    (input: 'I', resultCb: (result: 'R') => 'RR', errorCb: (result: 'E') => 'ER', cancelMeFn: (arg: string) => void) => 'AR'
  >,
)
t(
  false as TExtends<
    AsyncMap<'I', (result: 'R') => 'RR', never, 'AR', [cancelMeFn: (arg: 'C') => 'CR']>,
    (input: 'I', resultCb: (result: 'R') => 'RR', undefined, cancelMeFn: (arg: 'C') => 'CR') => 'AR'
  >,
)
t(
  false as TExtends<
    AsyncMap<'I', (result: 'R'[]) => 'RR', (error: 'E'[]) => void | never, 'AR', [cancelMeFn: (...args: 'C'[]) => 'CR']>,
    (input: 'I', resultCb: (result: 'R'[]) => 'RR', errorCb: (error: 'E'[]) => never, cancelMeFn: (...args: 'C'[]) => 'CR') => 'AR'
  >,
)

t(
  false as TExtends<
    AsyncMap<'I', (result: 'R') => 'RR', never, 'AR', [cancelMeFn: (arg: 'C') => 'CR']>,
    (input: 'I', resultCb: (result: 'R') => 'RR', cancelMeFn: (arg: 'C') => 'CR') => 'AR'
  >,
)

type TT = AsyncMap<'I', (result: 'R') => 'RR', (error: 'E') => 'ER'>

t(false as TExtendsWithError<AsyncMap<'I', (result: 'R') => 'RR', (error: 'E') => 'ER'>, (input: 'I', resultCb: (result: 'R') => 'RR', errorCb: (error: 'E') => 'ER') => void>)
t(false as TExtendsWithError<AsyncMap<'I', (result: 'R') => 'RR'>, (input: 'I', resultCb: (result: 'R') => 'RR', errorCb: (result: 'E') => 'ER') => void>)

t(false as ((input: string, resultCb: (result: string) => void) => void) extends AnyAsyncMap ? true : false)
t(false as ((input: string, resultCb: (result: string) => { status: string }) => { status: string }) extends AnyAsyncMap ? true : false)
t(false as ((input: string, resultCb: (result1: string, result2: number) => void) => void) extends AnyAsyncMap ? true : false)
t(false as ((input: string, resultCb: () => void) => void) extends AnyAsyncMap ? true : false)
t(false as ((input: string, resultCb: () => never) => never) extends AnyAsyncMap ? true : false)
f(true as ((input: string, resultCb: string) => void) extends AnyAsyncMap ? true : false)

t(false as ((input: string, resultCb: () => void, errorCb: (err: string) => void) => void) extends AnyAsyncMap ? true : false)
t(false as ((input: string, resultCb: () => void, errorCb: (err: string) => never | void) => void) extends AnyAsyncMap ? true : false)
t(false as ((input: string, resultCb: () => void, errorCb?: (err: string) => never) => void) extends AnyAsyncMap ? true : false)
t(false as ((input: string, resultCb: () => void, errorCb: () => never) => void) extends AnyAsyncMap ? true : false)
f(true as ((input: string, resultCb: () => void, errorCb: string) => void) extends AnyAsyncMap ? true : false)

t(false as ((input: string, resultCb: () => void, errorCb: () => void, listener1: () => void) => void) extends AnyAsyncMap ? true : false)
t(false as ((input: string, resultCb: () => void, errorCb: () => void, listener1: () => void, listener2: () => void) => void) extends AnyAsyncMap ? true : false)
t(false as ((input: string, resultCb: () => void, undefined, listener1: () => void, listener2: () => void) => void) extends AnyAsyncMap ? true : false)
t(false as ((input: string, resultCb: () => void, x, listener1: () => void, y, listener2: () => void) => void) extends AnyAsyncMap ? true : false)
t(false as ((input: string, resultCb: () => void, errorCb: (err: string) => never | void) => void) extends AnyAsyncMap ? true : false)
t(false as ((input: string, resultCb: () => void, errorCb?: (err: string) => never) => void) extends AnyAsyncMap ? true : false)
f(true as ((input: string, resultCb: () => void, errorCb: () => never, listener1: string) => void) extends AnyAsyncMap ? true : false)

type asyncMapArray = AsyncMapArray<
  [
    (input1: string, resultCb: (result1: 'A') => void) => void,
    (input2: string, resultCb: (result2: 'B') => void) => void,
    (input3: number, resultCb: (result3: 'C') => void) => void,
  ]
>
type xxx = ParallelAsyncMapArrayResults<asyncMapArray>

t(false as FirstAsyncMap<asyncMapArray> extends (input1: string, resultCb: (result1: 'A') => void) => void ? true : false)
f(true as FirstAsyncMap<asyncMapArray> extends (input3: string, resultCb: (result3: 'C') => void) => void ? true : false)
t(false as LastAsyncMap<asyncMapArray> extends (input1: number, resultCb: (result1: 'C') => void) => void ? true : false)
f(true as LastAsyncMap<asyncMapArray> extends (input3: string, resultCb: (result3: 'A') => void) => void ? true : false)

t(false as ComposedSerialAsyncMap<asyncMapArray> extends (input1: string, resultCb: (result1: 'C') => void, ...args: never[]) => void ? true : false)
