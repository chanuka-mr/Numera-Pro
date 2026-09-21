import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { HistoryPanel, type HistoryItem } from './HistoryPanel'

describe('HistoryPanel', () => {
  it('renders items with display symbols and restores on click', async () => {
    const onRestore = vi.fn()
    const user = userEvent.setup()
    const items: HistoryItem[] = [{ expr: '2*3', res: '6' }]
    render(
      <HistoryPanel items={items} onClear={vi.fn()} onClose={vi.fn()} onRestore={onRestore} open={true} />,
    )
    expect(screen.getByText('2×3')).toBeInTheDocument()
    expect(screen.getByText('= 6')).toBeInTheDocument()
    await user.click(screen.getByText('2×3'))
    expect(onRestore).toHaveBeenCalledWith('2*3', '6')
  })

  it('clears and closes via the header buttons', async () => {
    const onClear = vi.fn()
    const onClose = vi.fn()
    const user = userEvent.setup()
    render(
      <HistoryPanel items={[{ expr: '1+1', res: '2' }]} onClear={onClear} onClose={onClose} onRestore={vi.fn()} open={true} />,
    )
    await user.click(screen.getByRole('button', { name: 'Clear History' }))
    expect(onClear).toHaveBeenCalledTimes(1)
    await user.click(screen.getByRole('button', { name: 'Close Panel' }))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('shows an empty state', () => {
    render(<HistoryPanel items={[]} onClear={vi.fn()} onClose={vi.fn()} onRestore={vi.fn()} open={true} />)
    expect(screen.getByText('Ledger empty')).toBeInTheDocument()
  })
})