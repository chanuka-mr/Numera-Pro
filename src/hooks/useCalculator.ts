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
  const [justEvaluated, setJustEvaluated] = useState(false)
  const lastResultRef = useRef('0')

  const resetAll = useCallback(() => {
    setExpression('')
    setResult('0')
    setError(null)
    setJustEvaluated(false)
  }, [])

  const backspace = useCallback(() => {
    setError(null)
    if (justEvaluated) {
      setExpression('')
      setResult('0')
      setJustEvaluated(false)
      return
    }
    setExpression((prev) => prev.slice(0, -1))
  }, [justEvaluated])

  const pressKey = useCallback((key: string) => {
    setError(null)

    if (key === 'AC') {
      setExpression('')
      setResult('0')
      setJustEvaluated(false)
      return
    }

    if (key === 'C' || key === 'BACKSPACE') {
      setExpression((prev) => prev.slice(0, -1))
      setJustEvaluated(false)
      return
    }

    if (key === '=') {
      return
    }

    if (justEvaluated) {
      if (/[0-9.(]/.test(key)) {
        setJustEvaluated(false)
        setExpression(key)
        setResult('0')
        return
      }
      if (/[+\-*/^%]/.test(key)) {
        setJustEvaluated(false)
        setExpression(`${lastResultRef.current}${key}`)
        return
      }
      if (key === 'NEG') {
        setJustEvaluated(false)
        setExpression(`-(${lastResultRef.current})`)
        return
      }
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
  }, [justEvaluated])

  const runEvaluate = useCallback(() => {
    setError(null)
    if (!expression.trim()) {
      setResult('0')
      setJustEvaluated(false)
      return
    }
    try {
      const value = evaluate(expression)
      const formatted = formatNumber(value)
      lastResultRef.current = value.toString()
      setResult(formatted)
      setJustEvaluated(true)
      onRecord(expression, formatted)
    } catch (err) {
      const message = err instanceof EvaluateError ? err.message : 'Malformed expression'
      setResult('Error')
      setError({ message: `Error: ${message}` })
      setJustEvaluated(false)
    }
  }, [expression, onRecord])

  const recallAnswer = useCallback(() => {
    setError(null)
    setExpression((prev) => `${prev}${lastResultRef.current}`)
    setJustEvaluated(false)
  }, [])

  const restore = useCallback((expr: string, res: string) => {
    setError(null)
    const raw = expr.replace(/[×÷]/g, (ch) => (ch === '×' ? '*' : '/')).replace(/−/g, '-').replace(/,/g, '')
    setExpression(raw)
    setResult(res)
    setJustEvaluated(false)
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