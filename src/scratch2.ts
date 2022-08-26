// function functionClass<
//   ClassDef,
//   InstantiationArgs extends unknown[],
//   PrivateVariables extends unknown[],
// >(
//   ctor: (
//     this: ClassDef,
//     instantiatorArg: (...privateVariables: PrivateVariables) => ClassDef,
//     ...args0: InstantiationArgs
//   ) => ClassDef,
//   instantiator: (...privateVariables: PrivateVariables) => ClassDef,
//   callAction: string,
// ) {
//   const fn = function Ctor(...args: InstantiationArgs) {
//     const self = function CallSelf(...callArgs: any) {
//       return (self[callAction] as any)(...callArgs)
//     } as unknown as ClassDef

//     const instantiatorFn = (...args1: PrivateVariables) => {
//       console.log(instantiator)
//       const obj = instantiator(...args1)
//       Object.assign(self, obj)
//       console.log(self)
//       return self
//     }

//     const that = ctor.call(self, instantiatorFn, ...args)
//     console.log(that)
//     return that
//   }

//   return fn
// }

// const body = function Body(a: string, b: number) /* : {
//   c(): string
//   d(): number
//   d1(): string
//   d2: string
//   (): string
// } */ {
//   return {
//     c() {
//       return `${this.d()}:${a}`
//     },
//     d() {
//       b += 1
//       return b
//     },
//     d1() {
//       return this.d2
//     },
//   }
// }

// const a = functionClass<ReturnType<typeof body>, [a1: string, b1: number], Parameters<typeof body>>(
//   (instantiator, a1, b1) => {
//     // const that:{a: string, b:number } = this as unknown as {a: string, b:number }
//     console.log(this)
//     this.d2 = 'D2'
//     return instantiator(`cons:${a1}`, b1)
//   },
//   body,
//   'c',
// )

// const obj = a('test', 1)
// console.log(obj.c())
// console.log(obj.d())
// console.log(obj.d1())
// console.log(obj())

const errorNode = (parent, errorCb) => {
  return {
    addChild(aFn) {
      return newNode(this, aFn)
    },
    await(arg, resultCb, downstreamErrorCb) {
      return parent.await(arg, resultCb, errorCb)
    },
  }
}

const newNode = (asyncFn, parent?) => {
  const obj = {
    addChild(aFn) {
      return newNode(aFn, this)
    },
    await(arg, resultCb, errorCb) {
      const execute = (input) => {
        const pins = function PinsFn(resultArg) {
          return pins.result(resultArg)
        }

        Object.assign(pins, {
          result(resultArg) {
            const res = resultCb(resultArg)
            this.controller = res
            return res
          },
          error(errorArg) {
            return errorCb(errorArg, pins.result)
          },
        })
        return asyncFn(input, pins)
      }

      if (parent) return parent.await(arg, execute, errorCb)
      return execute(arg)
    },
    onError(errorCb) {
      return errorNode(this, errorCb)
    },
    s(syncFunction) {
      return this.addChild((input, resolver) => resolver.result(syncFunction(input)))
    },
  }
  return obj
}

const a = newNode((input, res) => res(`A:${input}`))
const b = a.addChild((input, res) => res(`B:${input}`))
const c = b.addChild((input, res) => res(`C:${input}`))
const d = c.await(1, (res) => {
  console.log(res)
})
const e = c.addChild((input, res) => res(`E:${input}`))
const f = e.await(1, (res) => {
  console.log(res)
})
const f2 = e.await(2, (res) => {
  console.log(res)
})
