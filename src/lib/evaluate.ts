export class EvaluateError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'EvaluateError'
  }
}

interface Eval {
  value: number
  percent: boolean
}

function isDigit(c: string): boolean {
  return c >= '0' && c <= '9'
}

function isDanglingToken(ch: string): boolean {
  return ch !== undefined && '+-*/^(.'.includes(ch)
}

class Parser {
  private readonly src: string
  private pos = 0

  constructor(src: string) {
    this.src = src
  }

  parse(): number {
    const value = this.expr().value
    this.skipWs()
    if (this.pos < this.src.length) {
      throw new EvaluateError(`Unexpected token "${this.src[this.pos]}"`)
    }
    return value
  }

  private peek(): string {
    return this.src[this.pos] ?? ''
  }

  private skipWs(): void {
    while (this.pos < this.src.length && /\s/.test(this.src[this.pos])) this.pos++
  }

  private eat(expected: string): boolean {
    this.skipWs()
    if (this.src[this.pos] === expected) {
      this.pos++
      return true
    }
    return false
  }

  private expr(): Eval {
    const left = this.term()
    let value = left.value
    for (;;) {
      this.skipWs()
      const op = this.peek()
      if (op !== '+' && op !== '-') break
      this.pos++
      const rhs = this.term()
      if (rhs.percent) {
        value = op === '+' ? value + value * rhs.value : value - value * rhs.value
      } else {
        value = op === '+' ? value + rhs.value : value - rhs.value
      }
    }
    return { value, percent: false }
  }

  private term(): Eval {
    const current = this.factor()
    let value = current.value
    let hadPercent = current.percent
    for (;;) {
      this.skipWs()
      const op = this.peek()
      if (op !== '*' && op !== '/') break
      this.pos++
      const rhs = this.factor()
      if (op === '/') {
        if (rhs.value === 0) throw new EvaluateError('Cannot divide by zero')
        value /= rhs.value
      } else {
        value *= rhs.value
      }
      hadPercent = false
    }
    return { value, percent: hadPercent }
  }

  private factor(): Eval {
    this.skipWs()
    if (this.peek() === '-') {
      this.pos++
      const inner = this.factor()
      return { value: -inner.value, percent: inner.percent }
    }
    return this.power()
  }

  private power(): Eval {
    const base = this.postfix()
    this.skipWs()
    if (this.peek() === '^') {
      this.pos++
      const exponent = this.factor()
      return { value: Math.pow(base.value, exponent.value), percent: false }
    }
    return base
  }

  private postfix(): Eval {
    const atom = this.atom()
    this.skipWs()
    if (this.peek() === '%') {
      this.pos++
      return { value: atom.value / 100, percent: true }
    }
    return { value: atom.value, percent: false }
  }

  private atom(): Eval {
    this.skipWs()
    const c = this.peek()

    if (c === '(') {
      this.pos++
      const inner = this.expr()
      if (!this.eat(')')) throw new EvaluateError('Unmatched parenthesis')
      return { value: inner.value, percent: false }
    }

    if (isDigit(c) || c === '.') {
      return { value: this.number(), percent: false }
    }

    throw new EvaluateError(c ? `Unexpected token "${c}"` : 'Unexpected end of expression')
  }

  private number(): number {
    this.skipWs()
    const start = this.pos
    while (this.pos < this.src.length && (isDigit(this.src[this.pos]) || this.src[this.pos] === '.')) {
      this.pos++
    }
    return Number(this.src.slice(start, this.pos))
  }
}

export function evaluate(input: string): number {
  let sanitized = input.trim()

  while (sanitized.startsWith('+') || sanitized.startsWith('%')) {
    sanitized = sanitized.slice(1)
  }

  for (;;) {
    const len = sanitized.length
    if (len === 0) break
    const last = sanitized[len - 1]
    if (/\s/.test(last)) {
      sanitized = sanitized.slice(0, -1)
      continue
    }
    if (isDanglingToken(last)) {
      sanitized = sanitized.slice(0, -1)
      continue
    }
    if (last === '%') {
      let prevIndex = len - 2
      while (prevIndex >= 0 && /\s/.test(sanitized[prevIndex])) prevIndex--
      const prev = sanitized[prevIndex]
      if (prev === undefined || '+-*/^('.includes(prev)) {
        sanitized = sanitized.slice(0, -1)
        continue
      }
      break
    }
    break
  }

  let open = 0
  for (const ch of sanitized) {
    if (ch === '(') open++
    else if (ch === ')') open--
  }
  if (open > 0) sanitized += ')'.repeat(open)

  if (!sanitized.trim()) return 0

  const value = new Parser(sanitized).parse()
  if (isNaN(value) || !isFinite(value)) throw new EvaluateError('Result is undefined or NaN')
  return value
}

export function countOpenParens(expression: string): number {
  let open = 0
  for (const ch of expression) {
    if (ch === '(') open++
    else if (ch === ')') open--
  }
  return Math.max(0, open)
}