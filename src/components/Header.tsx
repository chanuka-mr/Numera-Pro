import logo from '../assets/logo.svg'
import type { Theme } from '../hooks/useTheme'
import { Icon } from './Icon'

interface HeaderProps {
  historyCount: number
  drawerOpen: boolean
  theme: Theme
  onToggleHistory: () => void
  onToggleTheme: () => void
}

export function Header({ historyCount, drawerOpen, theme, onToggleHistory, onToggleTheme }: HeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-surface-container-lowest/90 backdrop-blur-xl border-b border-outline-variant/30 shadow-header">
      <div className="h-16 px-space-lg flex items-center justify-between gap-space-md">
        <div className="flex items-center gap-space-md">
          <div className="flex items-center gap-space-sm">
            <img alt="Numera Calculator Logo" className="h-8 w-auto object-contain" src={logo} />
            <div className="flex flex-col">
              <span className="font-headline-panel text-headline-panel text-on-surface tracking-tight leading-none">
                Numera Pro
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-space-sm">
          <div className="relative flex items-center">
            <button
              aria-label="Toggle History Panel"
              aria-pressed={drawerOpen}
              className="p-2 rounded-md bg-surface-container-low hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface transition-colors flex items-center justify-center"
              onClick={onToggleHistory}
            >
              <Icon className="text-[20px]" name="history" />
            </button>
            {historyCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-secondary text-on-secondary font-label-badge text-[10px] font-bold">
                {historyCount}
              </span>
            )}
          </div>
          <button
            aria-label="Toggle Dark/Light Mode"
            className="p-2 rounded-md bg-surface-container-low hover:bg-surface-container-high transition-colors flex items-center justify-center text-amber-500 hover:text-amber-600"
            onClick={onToggleTheme}
            title={theme === 'light' ? 'Light Mode Active' : 'Dark Mode Active'}
          >
            <Icon className="text-[20px]" name={theme === 'light' ? 'light_mode' : 'dark_mode'} />
          </button>
        </div>
      </div>
    </header>
  )
}