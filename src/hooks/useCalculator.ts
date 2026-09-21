import { useCallback, useRef, useState } from 'react'
import { EvaluateError, evaluate } from '../lib/evaluate'
import { formatNumber } from '../lib/format'

export interface CalcErrorState {
  message: string
}

export function toDisplayExpression(expression: string): string {
  return expression.replace(/\*/g, '×').replace(/\//g, '÷').replace(/-/g, '−')
}

export type CalculatorApi = ReturnType<typeof useCalculator>

export function useCalculator(onRecord: (expr: string, res: string) => void) {
  const [expression, setExpression] = useState('')
  const [result, setResult] = useState('0')
  const [error, setError] = useState<CalcErrorState | null>(null)
  const lastResultRef = useRef('0')

  const resetAll = useCallback(() => {
    setExpression('')
    setResult('0')
    setError(null)
  }, [])

  const backspace = useCallback(() => {
    setError(null)
    setExpression((prev) => prev.slice(0, -1))
  }, [])

  const pressKey = useCallback((key: string) => {
    setError(null)

    if (key === 'AC') {
      setExpression('')
      setResult('0')
      return
    }

    if (key === 'C' || key === 'BACKSPACE') {
      setExpression((prev) => prev.slice(0, -1))
      return
    }

    if (key === '=') {
      return
    }

    if (key === 'NEG') {
      setExpression((prev) => {
        if (prev.startsWith('-(') && prev.endsWith(')')) return prev.slice(2, -1)
        return `-(${prev})`
      })
      return
    }

    setExpression((prev) => {
      if (key === '.') {
        const tokens = prev.split(/[()+*/^-]/)
        const current = tokens[tokens.length - 1]
        if (current.includes('.')) return prev
      }
      return `${prev}${key}`
    })
  }, [])

  const runEvaluate = useCallback(() => {
    setError(null)
    if (!expression.trim()) {
      setResult('0')
      return
    }
    try {
      const value = evaluate(expression)
      const formatted = formatNumber(value)
      lastResultRef.current = value.toString()
      setResult(formatted)
      onRecord(toDisplayExpression(expression), formatted)
    } catch (err) {
      const message = err instanceof EvaluateError ? err.message : 'Malformed expression'
      setResult('Error')
      setError({ message: `Error: ${message}` })
    }
  }, [expression, onRecord])

  const recallAnswer = useCallback(() => {
    setError(null)
    setExpression((prev) => `${prev}${lastResultRef.current}`)
  }, [])

  const restore = useCallback((value: string) => {
    setError(null)
    setExpression(value.replace(/,/g, ''))
    setResult(value)
  }, [])

  return {
    expression,
    displayExpression: toDisplayExpression(expression),
    result,
    error,
    resetAll,
    backspace,
    pressKey,
    runEvaluate,
    recallAnswer,
    restore,
  }
}