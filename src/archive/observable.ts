/* eslint-disable @typescript-eslint/ban-types */
import { RecursiveUnion, UnknownObject } from './typescript utils'

const SUBSCRIBER = Symbol('subscriber')

type SubscribeMinimumType = {
  next: (value?: any) => void
  error?: (errorArg?: any) => void
  complete?: (value?: any) => void
}

type Subscriber<
  T extends SubscribeMinimumType,
  Error extends UnknownObject = T extends { error: (errorArg?: any) => void }
    ? {
        error: Parameters<T['error']> extends [any]
          ? (error: Parameters<T['error']>[0]) => void
          : () => void
      }
    : {},
  Complete extends UnknownObject = T extends { complete: (value?: any) => void }
    ? {
        complete: Parameters<T['complete']> extends [any]
          ? (value: Parameters<T['complete']>[0]) => void
          : () => void
      }
    : {},
  Res = RecursiveUnion<
    [
      {
        next: Parameters<T['next']> extends [any]
          ? (value: Parameters<T['next']>[0]) => void
          : () => void
      },
      Error,
      Complete,
      {
        type: typeof SUBSCRIBER
      },
    ]
  >,
> = Res

export type SubscriberT<
  T extends { Next: unknown; Error?: unknown; Complete?: unknown },
  Error extends UnknownObject = T extends { Error: unknown }
    ? { error: (error: T['Error']) => void }
    : {},
  Complete extends UnknownObject = T extends { Complete: unknown }
    ? { complete: (value: T['Complete']) => void }
    : {},
  SubscribeMinimumT = RecursiveUnion<[{ next: (value: T['Next']) => void }, Error, Complete]>,
> = SubscribeMinimumT extends SubscribeMinimumType ? SubscribeMinimumT : never

const subscribe = <T extends SubscribeMinimumType>(subscriber: T) => {
  let isStopped = false

  const subscriberObject = {
    next(value?): void {
      if (isStopped) throw new Error('already stopped')
      subscriber.next(value)
    },
  }
  if (subscriber.error) {
    Object.defineProperty(subscriberObject, 'error', {
      value: (err?) => {
        if (isStopped) throw new Error('already stopped')
        isStopped = true
        ;(subscriber.error as any)(err)
      },
    })
  }
  if (subscriber.complete) {
    Object.defineProperty(subscriberObject, 'complete', {
      value: (value?) => {
        if (isStopped) throw new Error('already stopped')
        isStopped = true
        ;(subscriber.complete as any)(value)
      },
    })
  }

  return {
    unsubscribe: () => {
      isStopped = true
    },
    subscriber: subscriberObject as unknown as Subscriber<T>,
  }
}

const observable =
  <T extends SubscribeMinimumType>(subscriptionHandler: (subscriber: Subscriber<T>) => void) =>
  (subscriber: T) => {
    const subscriberObj = subscribe<T>(subscriber)
    subscriptionHandler(subscriberObj.subscriber)
    return subscriberObj.unsubscribe
  }

export default observable
