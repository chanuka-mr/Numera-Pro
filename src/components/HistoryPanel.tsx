import { toDisplayExpression } from '../hooks/useCalculator'
import { Icon } from './Icon'

export interface HistoryItem {
  expr: string
  res: string
}

interface HistoryPanelProps {
  items: HistoryItem[]
  onClear: () => void
  onClose: () => void
  onRestore: (expr: string, res: string) => void
}

export function HistoryPanel({ items, onClear, onClose, onRestore }: HistoryPanelProps) {
  return (
    <aside className="fixed right-0 top-16 bottom-0 w-80 bg-surface-container-low border-l border-outline-variant/30 flex flex-col z-40 shadow-[-4px_0_24px_rgba(0,0,0,0.3)]">
      <div className="px-space-lg py-space-md border-b border-outline-variant/30 flex items-center justify-between bg-surface-container/40">
        <div className="flex items-center gap-space-xs">
          <Icon className="text-primary text-[18px]" name="receipt_long" />
          <span className="font-headline-panel text-headline-panel text-on-surface">History</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            aria-label="Clear History"
            className="p-1.5 rounded hover:bg-surface-container-high text-on-surface-variant hover:text-error transition-colors"
            onClick={onClear}
          >
            <Icon className="text-[18px]" name="delete_sweep" />
          </button>
          <button
            aria-label="Close Panel"
            className="p-1.5 rounded hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface transition-colors"
            onClick={onClose}
          >
            <Icon className="text-[18px]" name="close" />
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-space-md flex flex-col gap-space-sm">
        {items.length === 0 && (
          <div className="py-space-md text-center font-body-mono text-body-mono text-outline">
            Ledger empty
          </div>
        )}
        {items.map((item, index) => (
          <div
            className="p-space-sm rounded-md bg-surface-container hover:bg-surface-container-high border border-outline-variant/20 transition-colors cursor-pointer group"
            key={`${index}-${item.res}`}
            onClick={() => onRestore(item.expr, item.res)}
          >
            <div className="flex justify-end mb-1">
              <span className="text-primary text-[11px] font-body-mono opacity-0 group-hover:opacity-100 transition-opacity">
                Restore
              </span>
            </div>
            <div className="font-display-expression text-body-mono text-on-surface-variant text-right truncate">
              {toDisplayExpression(item.expr)}
            </div>
            <div className="font-body-mono text-keycap-secondary text-secondary text-right font-semibold">
              = {item.res}
            </div>
          </div>
        ))}
      </div>
    </aside>
  )
}