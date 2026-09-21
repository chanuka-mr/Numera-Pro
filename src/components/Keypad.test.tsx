import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Keypad } from './Keypad'

const KEY_ORDER = [
  'AC', 'C', 'BACKSPACE', '%', '/',
  '(', '7', '8', '9', '*',
  ')', '4', '5', '6', '-',
  '^', '1', '2', '3', '+',
  'NEG', '0', '.', '=',
]

describe('Keypad', () => {
  it('renders every key in layout order', () => {
    render(<Keypad onPress={vi.fn()} />)
    const buttons = screen.getAllByRole('button')
    expect(buttons).toHaveLength(KEY_ORDER.length)
  })

  it('reports each press with its key, including equals', async () => {
    const onPress = vi.fn()
    const user = userEvent.setup()
    render(<Keypad onPress={onPress} />)
    const buttons = screen.getAllByRole('button')
    for (let i = 0; i < buttons.length; i++) {
      await user.click(buttons[i])
      expect(onPress).toHaveBeenLastCalledWith(KEY_ORDER[i])
    }
    expect(onPress).toHaveBeenCalledTimes(KEY_ORDER.length)
  })
})