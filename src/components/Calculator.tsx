import { useEffect } from 'react'
import type { CalculatorApi } from '../hooks/useCalculator'
import { Display } from './Display'
import { Keypad } from './Keypad'

interface CalculatorProps {
  calc: CalculatorApi
}

export function Calculator({ calc }: CalculatorProps) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault()
        calc.runEvaluate()
      } else if (e.key === 'Escape') {
        calc.resetAll()
      } else if (e.key === 'Backspace') {
        calc.backspace()
      } else if (/[0-9+\-*/().^%]/.test(e.key)) {
        calc.pressKey(e.key)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [calc])

  const handleCopy = () => {
    void navigator.clipboard.writeText(calc.result)
  }

  return (
    <div className="max-w-2xl w-full mx-auto flex flex-col gap-space-md">
      <Display
        expression={calc.displayExpression}
        error={calc.error}
        result={calc.result}
        onCopy={handleCopy}
        onRecallAnswer={calc.recallAnswer}
      />
      <Keypad
        onPress={(key) => {
          if (key === '=') calc.runEvaluate()
          else calc.pressKey(key)
        }}
      />
    </div>
  )
}