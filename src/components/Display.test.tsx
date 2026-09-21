import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import type { CalcErrorState } from '../hooks/useCalculator'
import { Display } from './Display'

describe('Display', () => {
  it('renders the expression and result', () => {
    render(
      <Display
        expression="10×5÷2−1"
        result="25.5"
        error={null}
        onCopy={vi.fn()}
        onRecallAnswer={vi.fn()}
      />,
    )
    expect(screen.getByText('10×5÷2−1')).toBeInTheDocument()
    expect(screen.getByText('25.5')).toBeInTheDocument()
  })

  it('shows a fallback zero for an empty expression', () => {
    render(
      <Display expression="" result="0" error={null} onCopy={vi.fn()} onRecallAnswer={vi.fn()} />,
    )
    expect(screen.getAllByText('0')).toHaveLength(2)
  })

  it('renders the error banner when present', () => {
    const error: CalcErrorState = { message: 'Error: Cannot divide by zero' }
    render(
      <Display expression="6/0" result="Error" error={error} onCopy={vi.fn()} onRecallAnswer={vi.fn()} />,
    )
    expect(screen.getByText('Error: Cannot divide by zero')).toBeInTheDocument()
  })

  it('calls COPY and ANS handlers', async () => {
    const onCopy = vi.fn()
    const onRecallAnswer = vi.fn()
    const user = userEvent.setup()
    render(
      <Display expression="2+3" result="5" error={null} onCopy={onCopy} onRecallAnswer={onRecallAnswer} />,
    )
    await user.click(screen.getByTitle('Copy result'))
    expect(onCopy).toHaveBeenCalledTimes(1)
    await user.click(screen.getByText('ANS'))
    expect(onRecallAnswer).toHaveBeenCalledTimes(1)
  })
})