import { describe, it, expect } from 'vitest'
import { getResult, getMessage, getCode } from './baseResponse'

describe('baseResponse helpers', () => {
  it('getResult unwraps the result field', () => {
    expect(getResult({ code: 200, message: 'success', result: { uuid: 'x' } })).toEqual({ uuid: 'x' })
  })

  it('getResult falls back to the payload when not a BaseResponse', () => {
    const raw = { access_token: 'tok' } // login returns a raw token object
    expect(getResult(raw)).toBe(raw)
  })

  it('getMessage / getCode read their fields, null when absent', () => {
    expect(getMessage({ message: 'lỗi' })).toBe('lỗi')
    expect(getMessage({})).toBeNull()
    expect(getCode({ code: 400 })).toBe(400)
    expect(getCode(null)).toBeNull()
  })
})
