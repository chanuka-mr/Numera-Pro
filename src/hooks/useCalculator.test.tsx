import { act, renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { toDisplayExpression, useCalculator } from './useCalculator'

function setup() {
  const onRecord = vi.fn()
  const { result } = renderHook(() => useCalculator(onRecord))
  const press = (key: string) => act(() => result.current.pressKey(key))
  const evaluate = () => act(() => result.current.runEvaluate())
  return { result, press, evaluate, onRecord }
}

describe('toDisplayExpression', () => {
  it('substitutes operator symbols', () => {
    expect(toDisplayExpression('2+3*4')).toBe('2+3×4')
    expect(toDisplayExpression('10/2')).toBe('10÷2')
    expect(toDisplayExpression('5--3')).toBe('5−−3')
    expect(toDisplayExpression('5^-2')).toBe('5^−2')
  })
})

describe('live result preview', () => {
  it('updates the result on every keystroke', () => {
    const { press, result } = setup()
    press('1')
    press('0')
    expect(result.current.result).toBe('10')
    press('+')
    expect(result.current.result).toBe('10')
    press('1')
    expect(result.current.result).toBe('11')
    expect(result.current.expression).toBe('10+1')
    press('0')
    expect(result.current.result).toBe('20')
    expect(result.current.expression).toBe('10+10')
  })

  it('keeps the full formula visible while previewing', () => {
    const { press, result } = setup()
    press('6')
    press('1')
    press('0')
    press('+')
    press('1')
    expect(result.current.expression).toBe('610+1')
    expect(result.current.result).toBe('611')
  })

  it('rounds results to 12 significant digits', () => {
    const { press, result } = setup()
    press('0')
    press('.')
    press('1')
    press('+')
    press('0')
    press('.')
    press('2')
    expect(result.current.result).toBe('0.3')
  })

  it('previews percent math against the running total', () => {
    const { press, result } = setup()
    press('5')
    press('0')
    press('0')
    press('0')
    press('+')
    press('1')
    press('5')
    press('%')
    expect(result.current.expression).toBe('5000+15%')
    expect(result.current.result).toBe('5,750')
  })

  it('previews powers', () => {
    const { press, result } = setup()
    press('2')
    press('^')
    press('1')
    press('0')
    expect(result.current.result).toBe('1,024')
  })
})

describe('equals', () => {
  it('records the final result to history', () => {
    const { press, evaluate, onRecord, result } = setup()
    press('1')
    press('0')
    press('+')
    press('1')
    press('0')
    evaluate()
    expect(onRecord).toHaveBeenCalledTimes(1)
    expect(onRecord).toHaveBeenLastCalledWith('10+10', '20')
    expect(result.current.result).toBe('20')
  })

  it('does nothing on an empty expression', () => {
    const { evaluate, onRecord, result } = setup()
    evaluate()
    expect(onRecord).not.toHaveBeenCalled()
    expect(result.current.result).toBe('0')
  })
})

describe('after equals', () => {
  it('starts a fresh entry on a digit', () => {
    const { press, evaluate, result } = setup()
    press('2')
    press('+')
    press('3')
    evaluate()
    expect(result.current.result).toBe('5')
    press('7')
    expect(result.current.expression).toBe('7')
  })

  it('continues from the answer on an operator', () => {
    const { press, evaluate, onRecord, result } = setup()
    press('2')
    press('+')
    press('3')
    evaluate()
    press('+')
    expect(result.current.expression).toBe('5+')
    press('4')
    evaluate()
    expect(result.current.result).toBe('9')
    expect(onRecord).toHaveBeenLastCalledWith('5+4', '9')
  })

  it('negates the answer with NEG', () => {
    const { press, evaluate, result } = setup()
    press('2')
    press('+')
    press('5')
    evaluate()
    press('NEG')
    expect(result.current.expression).toBe('-7')
  })

  it('ignores percent until a new number is entered', () => {
    const { press, evaluate, result } = setup()
    press('5')
    evaluate()
    press('%')
    expect(result.current.expression).toBe('5')
  })
})

describe('operator replacement', () => {
  it('collapses repeated operators', () => {
    const { press, result } = setup()
    press('5')
    press('+')
    press('+')
    expect(result.current.expression).toBe('5+')
    press('*')
    expect(result.current.expression).toBe('5*')
  })

  it('ignores operators after an open paren', () => {
    const { press, result } = setup()
    press('5')
    press('+')
    press('(')
    press('*')
    expect(result.current.expression).toBe('5+(')
  })

  it('allows a minus after an open paren', () => {
    const { press, result } = setup()
    press('(')
    press('-')
    expect(result.current.expression).toBe('(-')
  })
})

describe('entry rules', () => {
  it('treats a lone leading zero', () => {
    const { press, result } = setup()
    press('0')
    press('0')
    expect(result.current.expression).toBe('0')
    press('5')
    expect(result.current.expression).toBe('5')
  })

  it('starts decimals with 0. and blocks duplicates', () => {
    const { press, result } = setup()
    press('.')
    expect(result.current.expression).toBe('0.')
    press('.')
    expect(result.current.expression).toBe('0.')
    press('5')
    expect(result.current.expression).toBe('0.5')
    press('.')
    expect(result.current.expression).toBe('0.5')
  })

  it('caps the digits in a single entry', () => {
    const { press, result } = setup()
    for (let i = 0; i < 13; i++) press('9')
    expect(result.current.expression).toBe('9'.repeat(12))
  })

  it('only accepts percent after a number', () => {
    const { press, result } = setup()
    press('5')
    press('+')
    press('%')
    expect(result.current.expression).toBe('5+')
  })
})

describe('NEG on operands', () => {
  it('negates and toggles the trailing operand', () => {
    const { press, evaluate, result } = setup()
    press('5')
    press('+')
    press('3')
    press('NEG')
    expect(result.current.expression).toBe('5+-3')
    evaluate()
    expect(result.current.result).toBe('2')
  })

  it('negates a bare number', () => {
    const { press, result } = setup()
    press('5')
    press('NEG')
    expect(result.current.expression).toBe('-5')
    press('NEG')
    expect(result.current.expression).toBe('5')
  })
})

describe('error handling', () => {
  it('freezes the preview on a mid-typing divide by zero', () => {
    const { press, result } = setup()
    press('6')
    press('/')
    press('0')
    expect(result.current.result).toBe('6')
    expect(result.current.error).toBeNull()
  })

  it('shows the error banner after equals', () => {
    const { press, evaluate, onRecord, result } = setup()
    press('6')
    press('/')
    press('0')
    evaluate()
    expect(result.current.error?.message).toContain('Cannot divide by zero')
    expect(result.current.result).toBe('Error')
    expect(onRecord).not.toHaveBeenCalled()
  })

  it('auto-resets on the next digit entry', () => {
    const { press, evaluate, result } = setup()
    press('6')
    press('/')
    press('0')
    evaluate()
    press('2')
    expect(result.current.error).toBeNull()
    expect(result.current.expression).toBe('2')
  })

  it('ignores operators and equals while an error is active', () => {
    const { press, evaluate, onRecord, result } = setup()
    press('6')
    press('/')
    press('0')
    evaluate()
    press('+')
    expect(result.current.error).not.toBeNull()
    expect(result.current.expression).toBe('6/0')
    evaluate()
    expect(onRecord).not.toHaveBeenCalled()
  })

  it('recovers via AC and C', () => {
    const { press, evaluate, result } = setup()
    press('6')
    press('/')
    press('0')
    evaluate()
    press('AC')
    expect(result.current.error).toBeNull()
    expect(result.current.expression).toBe('')
    expect(result.current.result).toBe('0')
  })
})

describe('backspace', () => {
  it('recomputes the preview while removing characters', () => {
    const { press, result } = setup()
    press('5')
    press('+')
    press('3')
    press('BACKSPACE')
    expect(result.current.expression).toBe('5+')
    expect(result.current.result).toBe('5')
    press('BACKSPACE')
    expect(result.current.expression).toBe('5')
  })

  it('clears everything right after equals', () => {
    const { press, evaluate, result } = setup()
    press('2')
    press('+')
    press('3')
    evaluate()
    press('BACKSPACE')
    expect(result.current.expression).toBe('')
    expect(result.current.result).toBe('0')
  })
})

describe('ANS recall', () => {
  it('inserts the last live result', () => {
    const { press, result } = setup()
    press('5')
    press('+')
    press('3')
    press('AC')
    act(() => result.current.recallAnswer())
    expect(result.current.expression).toBe('8')
  })
})

describe('restore', () => {
  it('converts display symbols back to raw expression', () => {
    const { result } = setup()
    act(() => result.current.restore('12×3−4', '32'))
    expect(result.current.expression).toBe('12*3-4')
    expect(result.current.result).toBe('32')
  })
})