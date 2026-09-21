import { useCallback, useRef, useState } from 'react'
import { OPERATOR_RE, negateLast, planOperator, startEntry } from '../lib/entry'
import { EvaluateError, evaluate } from '../lib/evaluate'
import { formatNumber, roundResult } from '../lib/format'

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

  const evaluateLive = useCallback((expr: string) => {
    if (!expr.trim()) {
      setResult('0')
      return
    }
    try {
      const value = roundResult(evaluate(expr))
      lastResultRef.current = value.toString()
      setResult(formatNumber(value))
    } catch {
      // keep the previous result while typing
    }
  }, [])

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
    const next = expression.slice(0, -1)
    setExpression(next)
    evaluateLive(next)
  }, [justEvaluated, expression, evaluateLive])

  const pressKey = useCallback(
    (key: string) => {
      const apply = (next: string) => {
        setExpression(next)
        evaluateLive(next)
      }

      if (error) {
        if (key === 'AC') {
          resetAll()
          return
        }
        if (key === 'C' || key === 'BACKSPACE') {
          setError(null)
          setExpression('')
          setResult('0')
          setJustEvaluated(false)
          return
        }
        if (/[0-9.(]/.test(key)) {
          setError(null)
          setJustEvaluated(false)
          apply(startEntry('', key))
        }
        return
      }

      setError(null)

      if (key === 'AC') {
        resetAll()
        return
      }

      if (key === 'C' || key === 'BACKSPACE') {
        backspace()
        return
      }

      if (key === '=') {
        return
      }

      if (key === 'NEG') {
        if (justEvaluated) {
          setJustEvaluated(false)
          const raw = lastResultRef.current
          apply(raw.startsWith('-') ? raw.slice(1) : `-${raw}`)
          return
        }
        apply(negateLast(expression))
        return
      }

      if (OPERATOR_RE.test(key)) {
        if (justEvaluated) {
          setJustEvaluated(false)
          apply(`${lastResultRef.current}${key}`)
          return
        }
        const action = planOperator(expression, key)
        if (action.type === 'ignore') return
        if (action.type === 'replace') {
          apply(action.expression)
          return
        }
        apply(`${expression}${key}`)
        return
      }

      if (key === '%') {
        if (justEvaluated) return
        if (!(expression && /[0-9)]$/.test(expression))) return
        apply(`${expression}%`)
        return
      }

      if (justEvaluated) {
        setJustEvaluated(false)
        apply(startEntry('', key))
        return
      }

      apply(startEntry(expression, key))
    },
    [error, expression, justEvaluated, resetAll, backspace, evaluateLive],
  )

  const runEvaluate = useCallback(() => {
    if (error) return
    setError(null)
    if (!expression.trim()) {
      setResult('0')
      setJustEvaluated(false)
      return
    }
    try {
      const rounded = roundResult(evaluate(expression))
      const formatted = formatNumber(rounded)
      lastResultRef.current = rounded.toString()
      setResult(formatted)
      setJustEvaluated(true)
      onRecord(expression, formatted)
    } catch (err) {
      const message = err instanceof EvaluateError ? err.message : 'Malformed expression'
      setResult('Error')
      setError({ message: `Error: ${message}` })
      setJustEvaluated(false)
    }
  }, [error, expression, onRecord])

  const recallAnswer = useCallback(() => {
    setError(null)
    setJustEvaluated(false)
    const next = `${expression}${lastResultRef.current}`
    setExpression(next)
    evaluateLive(next)
  }, [expression, evaluateLive])

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
