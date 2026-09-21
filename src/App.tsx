import { useCallback, useEffect, useState } from 'react'
import { Calculator } from './components/Calculator'
import { Header } from './components/Header'
import { HistoryPanel, type HistoryItem } from './components/HistoryPanel'
import { useCalculator } from './hooks/useCalculator'

const HISTORY_KEY = 'numera-pro:history'
const HISTORY_LIMIT = 50

function loadHistory(): HistoryItem[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter(
      (item): item is HistoryItem =>
        typeof item === 'object' &&
        item !== null &&
        typeof (item as HistoryItem).expr === 'string' &&
        typeof (item as HistoryItem).res === 'string',
    )
  } catch {
    return []
  }
}

function App() {
  const [history, setHistory] = useState<HistoryItem[]>(loadHistory)
  const [drawerOpen, setDrawerOpen] = useState(true)

  useEffect(() => {
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, HISTORY_LIMIT)))
    } catch {
      // storage unavailable — history stays in-memory for this session
    }
  }, [history])

  const recordHistory = useCallback((expr: string, res: string) => {
    setHistory((prev) => [{ expr, res }, ...prev].slice(0, HISTORY_LIMIT))
  }, [])

  const calc = useCalculator(recordHistory)

  const handleRestore = useCallback(
    (expr: string, res: string) => calc.restore(expr, res),
    [calc],
  )
  const handleClear = useCallback(() => setHistory([]), [])
  const handleToggleDrawer = useCallback(() => setDrawerOpen((open) => !open), [])

  return (
    <>
      <Header
        drawerOpen={drawerOpen}
        historyCount={history.length}
        onToggleHistory={handleToggleDrawer}
      />
      <div className={`transition-[padding] duration-300 ${drawerOpen ? 'pr-80' : 'pr-0'}`}>
        <main className="w-full pt-16 bg-surface min-h-screen">
          <div className="p-space-lg lg:p-space-xl max-w-7xl mx-auto w-full flex flex-col gap-space-lg">
            <div className="flex justify-center w-full">
              <Calculator calc={calc} />
            </div>
          </div>
        </main>
      </div>
      {drawerOpen && (
        <HistoryPanel
          items={history}
          onClear={handleClear}
          onClose={handleToggleDrawer}
          onRestore={handleRestore}
        />
      )}
    </>
  )
}

export default App