import type { ReactNode } from 'react'
import { Icon } from './Icon'

interface KeyDef {
  key: string
  label?: ReactNode
  title?: string
  className?: string
  span?: boolean
}

const KEY_SHADOW =
  'shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_2px_0_#0b1326,0_3px_6px_rgba(0,0,0,0.35)]'
const KEY_ACTIVE =
  'active:translate-y-[2px] active:shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_0px_0_#0b1326,0_1px_3px_rgba(0,0,0,0.35)]'

const BASE_KEY = `py-3.5 rounded-md flex items-center justify-center transition-all select-none ${KEY_SHADOW} ${KEY_ACTIVE}`

const KEY_OPERATOR = 'bg-primary-container hover:brightness-110 text-on-primary-container font-keycap-primary text-keycap-primary'
const KEY_FUNCTION = 'bg-surface-container-high hover:bg-surface-bright text-primary font-keycap-primary text-keycap-primary'
const KEY_CHAR = 'bg-surface-variant hover:bg-surface-bright text-on-surface font-keycap-primary text-keycap-primary'
const KEY_SMALL = 'bg-surface-container-high hover:bg-surface-bright font-keycap-secondary text-keycap-secondary'

const ROWS: KeyDef[][] = [
  [
    {
      key: 'AC',
      className: 'bg-tertiary-container hover:brightness-110 text-on-tertiary-container font-keycap-secondary text-keycap-secondary uppercase tracking-wider font-bold',
    },
    {
      key: 'C',
      className: 'bg-surface-container-high hover:bg-surface-bright text-error font-keycap-secondary text-keycap-secondary uppercase tracking-wider font-bold',
    },
    {
      key: 'BACKSPACE',
      title: 'Backspace',
      className: `${KEY_FUNCTION} text-on-surface font-normal`,
      label: <Icon className="text-[20px]" name="backspace" />,
    },
    { key: '%', className: KEY_FUNCTION },
    { key: '/', className: KEY_OPERATOR, label: '÷' },
  ],
  [
    { key: '(', className: KEY_FUNCTION },
    { key: '7', className: KEY_CHAR },
    { key: '8', className: KEY_CHAR },
    { key: '9', className: KEY_CHAR },
    { key: '*', className: KEY_OPERATOR, label: '×' },
  ],
  [
    { key: ')', className: KEY_FUNCTION },
    { key: '4', className: KEY_CHAR },
    { key: '5', className: KEY_CHAR },
    { key: '6', className: KEY_CHAR },
    { key: '-', className: KEY_OPERATOR, label: '−' },
  ],
  [
    {
      key: '^',
      title: 'Power',
      className: `${KEY_SMALL} font-semibold text-primary`,
      label: (
        <span>
          x<sup>y</sup>
        </span>
      ),
    },
    { key: '1', className: KEY_CHAR },
    { key: '2', className: KEY_CHAR },
    { key: '3', className: KEY_CHAR },
    { key: '+', className: KEY_OPERATOR },
  ],
  [
    {
      key: 'NEG',
      className: `${KEY_SMALL} text-on-surface font-semibold`,
      label: '±',
    },
    { key: '0', className: KEY_CHAR },
    { key: '.', className: `${KEY_CHAR} font-bold` },
    {
      key: '=',
      span: true,
      className: 'col-span-2 bg-gradient-to-r from-secondary-container to-secondary text-on-secondary font-keycap-primary text-keycap-primary font-bold gap-2',
      label: (
        <>
          <span>=</span>
          <span className="font-label-badge text-label-badge opacity-75 uppercase tracking-wider font-normal">
            Evaluate
          </span>
        </>
      ),
    },
  ],
]

interface KeypadProps {
  onPress: (key: string) => void
}

export function Keypad({ onPress }: KeypadProps) {
  return (
    <div className="bg-surface-container p-space-md rounded-xl border border-white/5 flex flex-col gap-space-sm">
      {ROWS.map((row, rowIndex) => (
        <div className="grid grid-cols-5 gap-space-sm" key={`row-${rowIndex}`}>
          {row.map((keyDef) => (
            <button
              className={`${BASE_KEY} ${keyDef.className}`}
              key={keyDef.key}
              title={keyDef.title}
              type="button"
              onClick={() => onPress(keyDef.key)}
            >
              {keyDef.label ?? keyDef.key}
            </button>
          ))}
        </div>
      ))}
    </div>
  )
}