import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Header } from './Header'

function renderHeader(props: Partial<Parameters<typeof Header>[0]> = {}) {
  return render(
    <Header
      drawerOpen={true}
      historyCount={0}
      onToggleHistory={vi.fn()}
      onToggleTheme={vi.fn()}
      theme="dark"
      {...props}
    />,
  )
}

describe('Header', () => {
  it('hides the badge when history is empty', () => {
    renderHeader({ historyCount: 0 })
    expect(screen.queryByText('0')).not.toBeInTheDocument()
  })

  it('shows the history count badge', () => {
    renderHeader({ historyCount: 7 })
    expect(screen.getByText('7')).toBeInTheDocument()
  })

  it('reflects the drawer state and toggles it', async () => {
    const onToggleHistory = vi.fn()
    const user = userEvent.setup()
    renderHeader({ drawerOpen: false, onToggleHistory })
    const toggle = screen.getByRole('button', { name: 'Toggle History Panel' })
    expect(toggle).toHaveAttribute('aria-pressed', 'false')
    await user.click(toggle)
    expect(onToggleHistory).toHaveBeenCalledTimes(1)
  })

  it('shows the light icon and title in light mode', () => {
    renderHeader({ theme: 'light' })
    const toggle = screen.getByRole('button', { name: 'Toggle Dark/Light Mode' })
    expect(toggle).toHaveAttribute('title', 'Light Mode Active')
    expect(screen.getByText('light_mode')).toBeInTheDocument()
  })

  it('shows the dark icon and title in dark mode', () => {
    renderHeader({ theme: 'dark' })
    const toggle = screen.getByRole('button', { name: 'Toggle Dark/Light Mode' })
    expect(toggle).toHaveAttribute('title', 'Dark Mode Active')
    expect(screen.getByText('dark_mode')).toBeInTheDocument()
  })

  it('request the theme toggle on click', async () => {
    const onToggleTheme = vi.fn()
    const user = userEvent.setup()
    renderHeader({ onToggleTheme })
    const toggle = screen.getByRole('button', { name: 'Toggle Dark/Light Mode' })
    await user.click(toggle)
    expect(onToggleTheme).toHaveBeenCalledTimes(1)
  })
})