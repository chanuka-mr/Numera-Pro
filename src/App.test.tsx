import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import App from './App'

const HISTORY_KEY = 'numera-pro:history'
const THEME_KEY = 'numera-pro:theme'

function storedHistory() {
  return JSON.parse(localStorage.getItem(HISTORY_KEY) ?? '[]')
}

async function typeText(user: ReturnType<typeof userEvent.setup>, text: string) {
  for (const ch of text) {
    await user.click(screen.getByRole('button', { name: ch }))
  }
}

describe('App', () => {
  beforeEach(() => {
    localStorage.clear()
    document.documentElement.className = 'dark'
  })

  it('records an evaluated expression to history and persists it', async () => {
    const user = userEvent.setup()
    render(<App />)

    await typeText(user, '2+3')
    await user.click(screen.getByRole('button', { name: /Evaluate/ }))

    expect(screen.getByText('= 5')).toBeInTheDocument()
    expect(storedHistory()).toEqual([{ expr: '2+3', res: '5' }])
  })

  it('restores persisted history on a fresh mount', async () => {
    const user = userEvent.setup()
    const first = render(<App />)
    await typeText(user, '2+3')
    await user.click(screen.getByRole('button', { name: /Evaluate/ }))
    first.unmount()

    render(<App />)
    expect(screen.getByText('= 5')).toBeInTheDocument()
  })

  it('restores an expression into the calculator and evaluates it', async () => {
    const user = userEvent.setup()
    const first = render(<App />)
    await typeText(user, '2+3')
    await user.click(screen.getByRole('button', { name: /Evaluate/ }))
    first.unmount()

    render(<App />)
    await user.click(screen.getByText('2+3'))
    await user.click(screen.getByRole('button', { name: /Evaluate/ }))
    expect(storedHistory()).toHaveLength(2)
  })

  it('clears history', async () => {
    const user = userEvent.setup()
    render(<App />)
    await typeText(user, '2+3')
    await user.click(screen.getByRole('button', { name: /Evaluate/ }))

    await user.click(screen.getByRole('button', { name: 'Clear History' }))
    expect(screen.getByText('Ledger empty')).toBeInTheDocument()
    expect(storedHistory()).toEqual([])
  })

  it('caps stored history at 50 entries', async () => {
    const seeded = Array.from({ length: 60 }, (_, i) => ({ expr: `${i}+1`, res: `${i + 1}` }))
    localStorage.setItem(HISTORY_KEY, JSON.stringify(seeded))
    render(<App />)
    await waitFor(() => expect(storedHistory()).toHaveLength(50))
  })

  it('ignores malformed stored history', () => {
    localStorage.setItem(HISTORY_KEY, 'not-json{')
    render(<App />)
    expect(screen.getByText('Ledger empty')).toBeInTheDocument()
    expect(storedHistory()).toEqual([])
  })

  it('defaults to dark theme and persists the choice', async () => {
    const user = userEvent.setup()
    render(<App />)
    expect(document.documentElement.classList.contains('dark')).toBe(true)

    await user.click(screen.getByRole('button', { name: 'Toggle Dark/Light Mode' }))
    expect(document.documentElement.classList.contains('light')).toBe(true)
    expect(localStorage.getItem(THEME_KEY)).toBe('light')
  })

  it('restores the persisted theme on a fresh mount', () => {
    localStorage.setItem(THEME_KEY, 'light')
    render(<App />)
    expect(document.documentElement.classList.contains('light')).toBe(true)
    expect(document.documentElement.classList.contains('dark')).toBe(false)
  })
})