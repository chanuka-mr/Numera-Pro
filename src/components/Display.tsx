import type { CalcErrorState } from '../hooks/useCalculator'
import { Icon } from './Icon'

interface DisplayProps {
  expression: string
  result: string
  error: CalcErrorState | null
  onCopy: () => void
  onRecallAnswer: () => void
}

export function Display({ expression, result, error, onCopy, onRecallAnswer }: DisplayProps) {
  return (
    <div className="bg-surface-container-lowest p-space-lg rounded-xl border border-card-border shadow-card flex flex-col justify-between gap-space-md relative overflow-hidden">
      <div className="flex items-center justify-between z-10">
        <div className="flex items-center gap-space-xs"></div>
        <div className="flex items-center gap-space-xs">
          <button
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-primary transition-all font-label-badge text-label-badge"
            title="Copy result"
            onClick={onCopy}
          >
            <Icon className="text-[14px]" name="content_copy" />
            <span>COPY</span>
          </button>
          <button
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-secondary transition-all font-label-badge text-label-badge"
            title="Cycle previous answer"
            onClick={onRecallAnswer}
          >
            <Icon className="text-[14px]" name="history" />
            <span>ANS</span>
          </button>
        </div>
      </div>
      <div className="flex flex-col items-end justify-end mt-2 z-10 min-h-[90px]">
        <div className="w-full text-right font-display-expression text-display-expression text-on-surface-variant tracking-wide overflow-x-auto whitespace-nowrap scrollbar-none pb-1">
          {expression || '0'}
        </div>
        <div className="w-full flex items-baseline justify-end gap-space-xs">
          <span className="font-body-mono text-[20px] text-outline opacity-40 select-none">=</span>
          <div className="font-display-result text-display-result-mobile md:text-display-result text-secondary select-all tracking-tight text-right overflow-x-auto whitespace-nowrap scrollbar-none font-semibold">
            {result === 'Error' ? (
              <span className="text-error">{result}</span>
            ) : (
              result
            )}
          </div>
        </div>
      </div>
      {error && (
        <div className="flex items-center gap-space-sm p-space-sm rounded-md bg-error-container text-on-error-container z-10">
          <Icon className="text-[18px]" name="error" />
          <span className="font-body-mono text-body-mono text-[12px] font-semibold">{error.message}</span>
        </div>
      )}
    </div>
  )
}