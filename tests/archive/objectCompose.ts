import { describe, it, expect } from 'vitest'
import { addOnTop, addUnder, composedObjectsSuper, capitalise } from '../src/index'

describe('object compose', () => {
  it('addOnTop', () => {
    const bottom = {
      _a: undefined as undefined | string,
      setA(msg: string) {
        this._a = `bottom: ${msg}`
      },
      getA(expectedValue) {
        if (expectedValue) expect(this._a).toEqual(expectedValue)
        return this._a
      },
      _b: undefined as undefined | 'b',
      setB(msg: 'b') {
        this._b = msg
      },
      getB(expectedValue) {
        if (expectedValue) expect(this._b).toEqual(expectedValue)
        return this._b
      },
      _d: undefined as undefined | string,
      setD(msg: string) {
        this._d = `bottom:${msg}`
      },
      getD(expectedValue) {
        if (expectedValue) expect(this._d).toEqual(expectedValue)
        return this._d
      },
    }

    const top = {
      _a: undefined as undefined | string,
      setA(msg: string) {
        this._a = `top: ${msg}`
      },
      getA(expectedValue) {
        if (expectedValue) expect(this._a).toEqual(expectedValue)
        return this._a
      },
      _c: undefined as undefined | 'c',
      setC(msg: 'c') {
        this._c = msg
      },
      getC(expectedValue) {
        if (expectedValue) expect(this._c).toEqual(expectedValue)
        return this._c
      },
      _d: undefined as undefined | string,
      setD(msg: string) {
        this[composedObjectsSuper].setD(`top:${msg}`)
      },
      getD(expectedValue) {
        return this[composedObjectsSuper].getD(expectedValue)
      },
    }
    const newObj = addOnTop(top, bottom)
    newObj.setA('a')
    newObj.getA('top: a')
    newObj.setB('b')
    newObj.getB('b')
    newObj.setC('c')
    newObj.getC('c')
    newObj.setD('d')
    newObj.getD('bottom:top:d')
    expect(newObj._a).toEqual('top: a')
    expect(newObj._b).toEqual(undefined)
    expect(newObj._c).toEqual('c')
    expect(newObj._d).toEqual(undefined)
    expect(bottom._a).toEqual(undefined)
    expect(bottom._b).toEqual('b')
    expect(bottom._c).toEqual(undefined)
    expect(bottom._d).toEqual('bottom:top:d')
    expect(top._a).toEqual(undefined)
    expect(top._b).toEqual(undefined)
    expect(top._c).toEqual(undefined)
    expect(top._d).toEqual(undefined)
  })
  it.only('bottom', () => {
    const bottom = {
      // _a: undefined as undefined | string,
      // setA(msg: string) {
      //   this._a = `bottom: ${msg}`
      // },
      getA(value) {
        return `bottom: ${value}`
      },
      // _b: undefined as undefined | 'b',
      // setB(msg: 'b') {
      //   this._b = msg
      // },
      // getB(expectedValue) {
      //   if (expectedValue) expect(this._b).toEqual(expectedValue)
      //   return this._b
      // },
      // // _d: undefined as undefined | string,
      // setD(msg: string) {
      //   this._d = `bottom:${msg}`
      // },
      // getD(expectedValue) {
      //   if (expectedValue) expect(this._d).toEqual(expectedValue)
      //   return this._d
      // },
    }

    const top = {
      _a: undefined as undefined | string,
      setA(msg: string) {
        debugger
        this._a = `top: ${msg}`
      },
      getA() {
        debugger
        return this._a
      },
      _c: undefined as undefined | 'c',
      setC(msg: 'c') {
        this._c = msg
      },
      getC(expectedValue) {
        if (expectedValue) expect(this._c).toEqual(expectedValue)
        return this._c
      },
      _d: undefined as undefined | string,
      setD(msg: string) {
        this[composedObjectsSuper].setD(`top:${msg}`)
      },
      getD(expectedValue) {
        return this[composedObjectsSuper].getD(expectedValue)
      },
    }

    const newObj = addUnder(top, bottom)
    debugger
    newObj.setA('a')
    debugger
    const x = newObj.getA()
    debugger
    // newObj.setB('b')
    // newObj.getB('b')
    // newObj.setC('c')
    // newObj.getC('c')
    // newObj.setD('d')
    // newObj.getD('bottom:top:d')
    // expect(newObj._a).toEqual('top: a')
    // expect(newObj._b).toEqual(undefined)
    // expect(newObj._c).toEqual('c')
    // expect(newObj._d).toEqual(undefined)
    // expect(bottom._a).toEqual(undefined)
    // expect(bottom._b).toEqual('b')
    // expect(bottom._c).toEqual(undefined)
    // expect(bottom._d).toEqual('bottom:top:d')
    // expect(top._a).toEqual(undefined)
    // expect(top._b).toEqual(undefined)
    // expect(top._c).toEqual(undefined)
    // expect(top._d).toEqual(undefined)
  })
  it.skip('bottom', () => {})
})
