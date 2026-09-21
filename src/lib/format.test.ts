import { describe, expect, it } from 'vitest'
import { formatNumber, roundResult } from './format'

describe('formatNumber', () => {
  it('groups integer digits with commas', () => {
    expect(formatNumber(0)).toBe('0')
    expect(formatNumber(1234)).toBe('1,234')
    expect(formatNumber(1000000)).toBe('1,000,000')
    expect(formatNumber(123456789)).toBe('123,456,789')
  })

  it('keeps the fractional part', () => {
    expect(formatNumber(1234.5)).toBe('1,234.5')
    expect(formatNumber(0.5)).toBe('0.5')
  })

  it('handles negatives', () => {
    expect(formatNumber(-2500)).toBe('-2,500')
  })
})

describe('roundResult', () => {
  it('cleans floating point noise', () => {
    expect(roundResult(0.1 + 0.2)).toBe(0.3)
  })

  it('rounds to 12 significant digits', () => {
    expect(roundResult(1 / 3)).toBe(0.333333333333)
    expect(roundResult(5782.5)).toBe(5782.5)
  })

  it('passes through zero and non-finite values', () => {
    expect(roundResult(0)).toBe(0)
    expect(roundResult(Infinity)).toBe(Infinity)
    expect(roundResult(NaN)).toBeNaN()
  })
})