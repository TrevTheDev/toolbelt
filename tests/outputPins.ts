import { describe, it, expect } from 'vitest'
import { outputPins, resultError, resultNone } from '../src/index'

describe('outputPins', () => {
  it('basic usage - outputPins', () => {
    const exampleResultErrorGenerator = outputPins<
      { result: [result: 'RESULT']; error: [error: Error]; cancel: [cancelReason: unknown] },
      'result'
    >('result', 'error', 'cancel')
    const fn = (error: boolean) => {
      const returnResult = exampleResultErrorGenerator()
      // eslint-disable-next-line no-constant-condition
      if (false) returnResult.cancel('whatever')
      return error ? returnResult.error(new Error('error')) : returnResult('RESULT')
    }
    const results = fn(false)
    if (results.isError()) throw results.error
    if (results.isCancel()) throw results.cancel
    console.log(results()) // 'RESULT'
    console.log(results.result)
    console.log(results.error)
  })
  it('basic usage - resultError', () => {
    const fn = (error: boolean) => {
      const returnResult = resultError<'RESULT', Error>()
      return error ? returnResult.error(new Error('error')) : returnResult('RESULT')
    }
    const results = fn(false)
    if (results.isError()) throw results.error
    console.log(results()) // 'RESULT'
  })
  it('basic usage - resultNone', () => {
    const fn = (none: boolean) => {
      const returnResult = resultNone<'RESULT', null>()
      return none ? returnResult.none(null) : returnResult('RESULT')
    }
    const results = fn(false)
    if (!results.isNone()) console.log(results()) // 'RESULT'
  })
  it('resultErrorOutputPins', () => {
    const re = resultError<'RESULT', 'ERROR'>({
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
    expect('error' in rv).toBeFalsy()

    expect(rv.isResult()).toBeTruthy()
    expect(rv.isError()).toBeFalsy()
    expect(rv.setPin).toEqual('result')
  })
  it('awaiters', () => {
    const re = resultError<'RESULT', 'ERROR'>()

    const cb = re.awaiters

    cb.onResult((result) => {
      expect(result).toEqual('RESULT')
      re.awaiters.onResult((_result) => {
        expect(_result).toEqual('RESULT')
      })
    })
    re('RESULT')
  })
})
