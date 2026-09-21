export class EvaluateError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'EvaluateError'
  }
}

function isDigit(c: string): boolean {
  return c >= '0' && c <= '9'
}

class Parser {
  private readonly src: string
  private pos = 0

  constructor(src: string) {
    this.src = src
  }

  parse(): number {
    const value = this.expr()
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

  private expr(): number {
    let value = this.term()
    for (;;) {
      this.skipWs()
      const op = this.peek()
      if (op !== '+' && op !== '-') break
      this.pos++
      const rhs = this.term()
      value = op === '+' ? value + rhs : value - rhs
    }
    return value
  }

  private term(): number {
    let value = this.factor()
    for (;;) {
      this.skipWs()
      const op = this.peek()
      if (op !== '*' && op !== '/') break
      this.pos++
      const rhs = this.factor()
      if (op === '/') {
        if (rhs === 0) throw new EvaluateError('Cannot divide by zero')
        value /= rhs
      } else {
        value *= rhs
      }
    }
    return value
  }

  private factor(): number {
    this.skipWs()
    if (this.peek() === '-') {
      this.pos++
      return -this.factor()
    }
    return this.power()
  }

  private power(): number {
    const base = this.postfix()
    this.skipWs()
    if (this.peek() === '^') {
      this.pos++
      const exponent = this.factor()
      return Math.pow(base, exponent)
    }
    return base
  }

  private postfix(): number {
    const value = this.atom()
    this.skipWs()
    if (this.peek() === '%') {
      this.pos++
      return value / 100
    }
    return value
  }

  private atom(): number {
    this.skipWs()
    const c = this.peek()

    if (c === '(') {
      this.pos++
      const inner = this.expr()
      if (!this.eat(')')) throw new EvaluateError('Unmatched parenthesis')
      return inner
    }

    if (isDigit(c) || c === '.') {
      return this.number()
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
  let balanced = input
  let open = 0
  for (const ch of balanced) {
    if (ch === '(') open++
    else if (ch === ')') open--
  }
  if (open > 0) balanced += ')'.repeat(open)

  const value = new Parser(balanced).parse()
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