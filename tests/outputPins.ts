import { describe, it, expect } from 'vitest'
import { resultErrorOutputPins, resultNoneOutputPins } from '../src/index'

describe('outputPins', () => {
  it('basic usage - resultErrorOutputPins', () => {
    const fn = (error: boolean) => {
      const returnResult = resultErrorOutputPins<'RESULT', Error>()
      return error ? returnResult.error(new Error('error')) : returnResult('RESULT')
    }
    const results = fn(false)
    if (results.isError()) throw results.error
    console.log(results()) // 'RESULT'
  })
  it('basic usage - resultErrorOutputPins', () => {
    const fn = (none: boolean) => {
      const returnResult = resultNoneOutputPins<'RESULT', null>()
      return none ? returnResult.none(null) : returnResult('RESULT')
    }
    const results = fn(false)
    if (!results.isNone()) console.log(results()) // 'RESULT'
  })
  it('resultErrorOutputPins', () => {
    const re = resultErrorOutputPins<'RESULT', 'ERROR'>({
      onError: (_error) => expect(true).toBeFalsy(),
      onResult: (result) => {
        expect(result).toEqual('RESULT')
      },
    })

    const rv = re('RESULT')
    expect(() => re.result('RESULT')).toThrowError()
    expect(() => re.error('ERROR')).toThrowError()

    expect(rv()).toEqual('RESULT')
    expect(rv.result).toEqual('RESULT')
    expect(rv.value).toEqual('RESULT')
    expect(() => rv.error).toThrowError()

    expect(rv.isResult()).toBeTruthy()
    expect(rv.isError()).toBeFalsy()
    expect(rv.setPin).toEqual('result')
  })
  it('awaiters', () => {
    const re = resultErrorOutputPins<'RESULT', 'ERROR'>()

    const cb = re.awaiters

    cb.onResult((result) => {
      expect(result).toEqual('RESULT')
    })
    expect(() =>
      re.awaiters.onResult((_result) => {
        expect(true).toBeFalsy()
      }),
    ).toThrowError()
    re('RESULT')
  })
})
