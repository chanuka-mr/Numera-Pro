import { describe, expect, it } from 'vitest'
import { EvaluateError, countOpenParens, evaluate } from './evaluate'

describe('evaluate precedence and operators', () => {
  it('follows standard precedence', () => {
    expect(evaluate('1+2*3')).toBe(7)
    expect(evaluate('10-4/2')).toBe(8)
    expect(evaluate('2*3+4^2')).toBe(22)
    expect(evaluate('2*3^2')).toBe(18)
  })

  it('supports right-associative powers', () => {
    expect(evaluate('2^10')).toBe(1024)
    expect(evaluate('2^3^2')).toBe(512)
    expect(evaluate('9^0.5')).toBe(3)
  })

  it('handles unary minus', () => {
    expect(evaluate('-5+3')).toBe(-2)
    expect(evaluate('5+-3')).toBe(2)
    expect(evaluate('--3')).toBe(3)
    expect(evaluate('-2^2')).toBe(-4)
    expect(evaluate('(-2)^2')).toBe(4)
  })
})

describe('evaluate parentheses', () => {
  it('evaluates grouped expressions', () => {
    expect(evaluate('(2+3)*4')).toBe(20)
    expect(evaluate('((1+2)*(3+4))')).toBe(21)
  })

  it('auto-closes open parentheses', () => {
    expect(evaluate('(2+3')).toBe(5)
    expect(evaluate('2+(3')).toBe(5)
    expect(evaluate('((5)')).toBe(5)
  })
})

describe('evaluate percent', () => {
  it('treats standalone percent as fraction', () => {
    expect(evaluate('15%')).toBe(0.15)
    expect(evaluate('50%')).toBe(0.5)
    expect(evaluate('50%*2')).toBe(1)
  })

  it('scales add/subtract percent against the running total', () => {
    expect(evaluate('5000+15%')).toBe(5750)
    expect(evaluate('5000-15%')).toBe(4250)
    expect(evaluate('100+50%+20')).toBe(170)
    expect(evaluate('5+3*50%')).toBe(6.5)
  })

  it('uses the fraction for multiply/divide', () => {
    expect(evaluate('200*5%')).toBe(10)
    expect(evaluate('200/5%')).toBe(4000)
  })
})

describe('evaluate sanitizes dangling input', () => {
  it('strips trailing operators and punctuation', () => {
    expect(evaluate('5+')).toBe(5)
    expect(evaluate('5+(')).toBe(5)
    expect(evaluate('5+%')).toBe(5)
    expect(evaluate('5+-')).toBe(5)
    expect(evaluate('5+4.5.')).toBe(9.5)
  })

  it('strips leading + and %', () => {
    expect(evaluate('+5')).toBe(5)
    expect(evaluate('%5')).toBe(5)
  })

  it('keeps trailing percent on a number', () => {
    expect(evaluate('50%')).toBe(0.5)
    expect(evaluate('2^')).toBe(2)
  })

  it('returns 0 for empty or sign-only input', () => {
    expect(evaluate('')).toBe(0)
    expect(evaluate(' ')).toBe(0)
    expect(evaluate('-')).toBe(0)
  })
})

describe('evaluate errors', () => {
  it('throws EvaluateError with a friendly message', () => {
    expect(() => evaluate('6/0')).toThrowError(EvaluateError)
    expect(() => evaluate('6/0')).toThrowError('Cannot divide by zero')
    expect(() => evaluate('0/0')).toThrowError('Cannot divide by zero')
  })

  it('rejects malformed tokens', () => {
    expect(() => evaluate('5+*3')).toThrowError('Unexpected token "*"')
    expect(() => evaluate('*5')).toThrowError()
    expect(() => evaluate('5*(+3)')).toThrowError()
  })

  it('rejects non-finite results', () => {
    expect(() => evaluate('0^-1')).toThrowError('Result is undefined or NaN')
  })
})

describe('countOpenParens', () => {
  it('counts unbalanced open parens', () => {
    expect(countOpenParens('(2+3')).toBe(1)
    expect(countOpenParens('((2+3)')).toBe(1)
    expect(countOpenParens('2+3')).toBe(0)
    expect(countOpenParens(')((')).toBe(1)
    expect(countOpenParens(')(')).toBe(0)
  })
})