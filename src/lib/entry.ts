export const OPERATOR_RE = /[+\-*/^]/
export const MAX_ENTRY_DIGITS = 12

export function startEntry(expression: string, key: string): string {
  if (key === '(') return `${expression}(`

  const tokens = expression.split(/[()+*/^-]/)
  const current = tokens[tokens.length - 1]

  if (key === '.') {
    if (current.includes('.')) return expression
    return current === '' ? `${expression}0.` : `${expression}.`
  }

  if (current === '0') {
    if (key === '0') return expression
    return `${expression.slice(0, -1)}${key}`
  }

  const digitCount = current.replace(/\./g, '').length
  if (digitCount >= MAX_ENTRY_DIGITS) return expression
  return `${expression}${key}`
}

export function negateLast(expression: string): string {
  const match = expression.match(/([0-9.]+)$/)
  if (!match) return expression
  const run = match[1]
  const runLen = run.length
  const before = expression[expression.length - runLen - 1]
  if (before === '-') {
    const beforeBefore = expression[expression.length - runLen - 2]
    const isSign = beforeBefore === undefined || /[()+*/^%-]/.test(beforeBefore)
    if (isSign) return expression.slice(0, -runLen - 1) + run
    return expression.slice(0, -runLen) + `-${run}`
  }
  return expression.slice(0, -runLen) + `-${run}`
}

export type OperatorAction =
  | { type: 'replace'; expression: string }
  | { type: 'ignore' }
  | { type: 'chain' }

export function planOperator(expression: string, key: string): OperatorAction {
  if (!expression) {
    return key === '-' ? { type: 'replace', expression: '-' } : { type: 'ignore' }
  }
  const last = expression[expression.length - 1]
  if (OPERATOR_RE.test(last) || last === '(') {
    const base = expression.replace(/[+\-*/^]+$/, '')
    if (base === '' || base.endsWith('(')) {
      return key === '-' ? { type: 'replace', expression: `${base}-` } : { type: 'ignore' }
    }
    return { type: 'replace', expression: `${base}${key}` }
  }
  return { type: 'chain' }
}
