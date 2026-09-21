import { act, fireEvent, render } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { useCalculator } from '../hooks/useCalculator'
import { Calculator } from './Calculator'

function setup() {
  const onRecord = vi.fn()
  function Harness() {
    const calc = useCalculator(onRecord)
    return <Calculator calc={calc} />
  }
  render(<Harness />)
  const key = (k: string) => fireEvent.keyDown(window, { key: k })
  return { key, onRecord }
}

describe('Calculator keyboard support', () => {
  it('types digits and evaluates on Enter', () => {
    const { key, onRecord } = setup()
    key('2')
    key('3')
    key('Enter')
    expect(onRecord).toHaveBeenLastCalledWith('23', '23')
  })

  it('prevents the default Enter behavior', () => {
    const { key } = setup()
    key('1')
    const evt = new KeyboardEvent('keydown', { key: 'Enter', cancelable: true })
    act(() => window.dispatchEvent(evt))
    expect(evt.defaultPrevented).toBe(true)
  })

  it('resets the entry on Escape', () => {
    const { key, onRecord } = setup()
    key('5')
    key('Escape')
    key('Enter')
    expect(onRecord).not.toHaveBeenCalled()
  })

  it('removes characters with Backspace', () => {
    const { key, onRecord } = setup()
    key('5')
    key('6')
    key('Backspace')
    key('Enter')
    expect(onRecord).toHaveBeenLastCalledWith('5', '5')
  })

  it('ignores unsupported keys', () => {
    const { key, onRecord } = setup()
    key('a')
    key('Enter')
    expect(onRecord).not.toHaveBeenCalled()
  })
})