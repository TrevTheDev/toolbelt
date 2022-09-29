# Chain Overview

A fast, simple, typed way to chain together asynchronous calls - with the output of each function acting as the input to the subsequent function.

It's similar to a `compose` function but for async functions.

If an error is returned by a node, that effectively ends any further processing of the chain.

An `await`ed chain returns an `AwaitedChainController` - which can be used to communicate with the currently executing async function, including for example implementing a cancel ability.

## Example Basic Usage

```typescript
import { chain } from '...'

const fooChain = chain<
	{ Input: 'start' },
  { Output: 'node 1' },
  { ResultResolverController: void }
>((x, resolve) => {
  expect(x).toEqual('start')
  resolve('node 1')
})<{ Output: 'node 2' }>((x, resolve) => {
  expect(x).toEqual('node 1')
  resolve('node 2')
})

fooChain.await('start', (result) => expect(result).toEqual('node 2'))
```



## chain

``` typescript
chain<{
  Input?: any                    // Start input of the chain
  ResultResolverController?: any // First node's return type
  ErrorResolverController?: any  // First node's ErrorCb return type
}, {
  Output?: any                   // Output type returned by first node
  Error?: any                    // Error type returned by first node
  ResultResolverController?: any // Second node's return type
  ErrorResolverController?: any  // Second node's ErrorCb return type  
}, { 
  // the following generics are defaults that apply to the entire chain. They  can be overridden or modified
  InputOutput?: any     
  Error?: any                                  
  ResultResolverController?: any 
  ErrorResolverController?: any  
}> ( asyncFunction: AsyncFn ) => ChainNode
```

## AsyncFn

Functions passed to the chain must have the following form:

``` typescript
( 
  input: any,           // input provided to the async function
  resolver: Resolver    // a Resolver object is provided to the function - see below
) => any                  // ResultResolverController
```

## Resolver

The `Resolver` is a function object passed to the `AsyncFn` and it's used to return either a `result` or an `error`:

```typescript
{
  (result: any):any
  result: (result: any)=>any
  error: (error: any)=>any
}
```

## ChainNode

Each AsyncFn added to the chain, creates a new `ChainNode`.  ChainNodes can have other AsyncFn's added, and can be awaited, or trap any downstream errors.  Other chains can also be spliced into the chain.

```typescript
# Chain Overview

A fast, simple, typed way to chain together asynchronous calls - with the output of each function acting as the input to the subsequent function.

It's similar to a `compose` function but for async functions.

If an error is returned by a node, that effectively ends any further processing of the chain.

An `await`ed chain returns an `AwaitedChainController` - which can be used to communicate with the currently executing async function, including for example implementing a cancel ability.

## Example Basic Usage

```typescript
import { chain } from '...'

const fooChain = chain<
 	{ Input: 'start' },
 	{ Output: 'node 1' },
 	{ ResultResolverController: void }
>((x, resolve) => {
  expect(x).toEqual('start')
  resolve('node 1')
})<{ Output: 'node 2' }>((x, resolve) => {
  expect(x).toEqual('node 1')
  resolve('node 2')
})

fooChain.await('start', (result) => expect(result).toEqual('node 2'))

```

## chain

``` typescript
chain<{
  Input?: any                    // Start input of the chain
  ResultResolverController?: any // First node's return type
  ErrorResolverController?: any  // First node's ErrorCb return type
}, {
  Output?: any                   // Output type returned by first node
  Error?: any                    // Error type returned by first node
  ResultResolverController?: any // Second node's return type
  ErrorResolverController?: any  // Second node's ErrorCb return type  
}, { 
  // the following generics are defaults that apply to the entire chain. They  can be overridden or modified
  InputOutput?: any     
  Error?: any                                  
  ResultResolverController?: any 
  ErrorResolverController?: any  
}> ( asyncFunction: AsyncFn ) => ChainNode
```

## AsyncFn

Functions passed to the chain must have the following form:

``` typescript
( input: any, resolver: Resolver ) => any
```

## Resolver

The `Resolver` is an function object passed to the `AsyncFn` and it's used to return either a `result` or an `error`:

```typescript
{
  (result: any):any
  result: (result: any)=>any
  error: (error: any)=>any
}
```

## ChainNode

Each AsyncFn added to the chain, creates a new `ChainNode`.  ChainNodes can have other AsyncFn's added, and can be awaited, or trap any downstream errors.  Other chains can also be spliced into the chain.

```typescript
{
  // function call to add additional ChainNodes
  <{
    Error?: any                    // Error type returned by node
    Output?: any                   // Output type returned by node
    ResultResolverController?: any // Subsequent node's return type
    ErrorResolverController?: any  // Subsequent node's ErrorCb return type  
  }, { 
    // the following generics are defaults that apply to any subsequent nodes. They can be overridden or modified
    Error?: any                    
    Output?: any                   
    ResultResolverController?: any 
    ErrorResolverController?: any  
  }>
  ( asyncFunction: AsyncFn ): ChainNode
  
  // Symbol('Chain Node')
  type: chainNodeType
  
  // captures all downstream Errors - prevents Error bubbling
  // trapping an error here, breaks the execution of the rest
  // of the chain.
  onError(callback: AccumulatedErrorCb): ChainNode
  
  // await chain
  await(
    input: any,
    resultCb: (finalResult: any)=>any,
    errorCb?: (finalError: any)=>any,
  ): AwaitedChainController
  
  // inject another chain into this chain
  splice(subChain:chain): ChainNode
}
```

## AwaitedChainController

An object that contains the `ResultResolverController` of the currently executing `ChainNode`.  `ResultResolverControllers` are mostly not used and set to `void`.  However they can be used to provide a mechanism to communicate with the currently executing `ChainNode` - for example one could implement cancel functionality.

```typescript
{
	controller: any
}
```

# Compose

## Example Usage

```typescript
import { compose } from '...'
const fn = compose(
  (a: string) => `${a}:A`,
  (a: string) => `${a}:B`,
)
console.log(fn('start')) //`start:A:B`
```
