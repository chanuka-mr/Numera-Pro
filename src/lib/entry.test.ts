import { describe, expect, it } from 'vitest'
import { MAX_ENTRY_DIGITS, negateLast, planOperator, startEntry } from './entry'

describe('startEntry digit rules', () => {
  it('appends digits to an existing number', () => {
    expect(startEntry('', '5')).toBe('5')
    expect(startEntry('5', '5')).toBe('55')
    expect(startEntry('5+3.5', '2')).toBe('5+3.52')
  })

  it('handles a lone leading zero', () => {
    expect(startEntry('0', '0')).toBe('0')
    expect(startEntry('0', '5')).toBe('5')
    expect(startEntry('5+0', '7')).toBe('5+7')
    expect(startEntry('5+0', '0')).toBe('5+0')
  })

  it('caps entry length at the configured digit limit', () => {
    const twelve = '9'.repeat(MAX_ENTRY_DIGITS)
    const eleven = '9'.repeat(MAX_ENTRY_DIGITS - 1)
    expect(startEntry(eleven, '3')).toBe(`${eleven}3`)
    expect(startEntry(twelve, '3')).toBe(twelve)
  })
})

describe('startEntry decimal rules', () => {
  it('starts a new number with 0.', () => {
    expect(startEntry('', '.')).toBe('0.')
    expect(startEntry('5+', '.')).toBe('5+0.')
  })

  it('appends a decimal point to an existing number', () => {
    expect(startEntry('5+3', '.')).toBe('5+3.')
  })

  it('ignores duplicate decimal points', () => {
    expect(startEntry('5+3.', '.')).toBe('5+3.')
  })
})

describe('startEntry parentheses', () => {
  it('appends open parens', () => {
    expect(startEntry('', '(')).toBe('(')
    expect(startEntry('5+', '(')).toBe('5+(')
  })
})

describe('negateLast', () => {
  it('negates a bare result', () => {
    expect(negateLast('5')).toBe('-5')
    expect(negateLast('-5')).toBe('5')
  })

  it('negates only the trailing operand', () => {
    expect(negateLast('5+3')).toBe('5+-3')
    expect(negateLast('5+-3')).toBe('5+3')
    expect(negateLast('5*3')).toBe('5*-3')
    expect(negateLast('5*-3')).toBe('5*3')
  })

  it('leaves operator tails untouched', () => {
    expect(negateLast('5+')).toBe('5+')
  })
})

describe('planOperator', () => {
  it('replaces a trailing operator run', () => {
    expect(planOperator('5+', '+')).toEqual({ type: 'replace', expression: '5+' })
    expect(planOperator('5+', '*')).toEqual({ type: 'replace', expression: '5*' })
    expect(planOperator('5+', '-')).toEqual({ type: 'replace', expression: '5-' })
    expect(planOperator('5++', '+')).toEqual({ type: 'replace', expression: '5+' })
    expect(planOperator('5+-', '-')).toEqual({ type: 'replace', expression: '5-' })
  })

  it('ignores operators at the start or after an open paren', () => {
    expect(planOperator('', '+')).toEqual({ type: 'ignore' })
    expect(planOperator('(', '*')).toEqual({ type: 'ignore' })
    expect(planOperator('5+(', '*')).toEqual({ type: 'ignore' })
  })

  it('allows a leading unary minus', () => {
    expect(planOperator('', '-')).toEqual({ type: 'replace', expression: '-' })
    expect(planOperator('(', '-')).toEqual({ type: 'replace', expression: '(-' })
    expect(planOperator('5+(', '-')).toEqual({ type: 'replace', expression: '5+(-' })
  })

  it('chains when the expression is complete', () => {
    expect(planOperator('5', '*')).toEqual({ type: 'chain' })
    expect(planOperator('5+3', '+')).toEqual({ type: 'chain' })
    expect(planOperator('(5)', '*')).toEqual({ type: 'chain' })
    expect(planOperator('5%', '+')).toEqual({ type: 'chain' })
    expect(planOperator('5*-3', '+')).toEqual({ type: 'chain' })
  })
})