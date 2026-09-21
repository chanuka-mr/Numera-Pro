import { useCallback, useState } from 'react'
import { Calculator } from './components/Calculator'
import { Header } from './components/Header'
import { HistoryPanel, type HistoryItem } from './components/HistoryPanel'
import { useCalculator } from './hooks/useCalculator'

const SEED_HISTORY: HistoryItem[] = [
  { time: '14:32:08', expr: '2 * π * 6371 * 10^3', res: '4.003017e+7' },
  { time: '14:28:45', expr: 'sin(45°) * sqrt(2)', res: '1.000000' },
  { time: '14:15:10', expr: '1024 * 768 * 4 / 1024^2', res: '3.000000 MB' },
]

function App() {
  const [history, setHistory] = useState<HistoryItem[]>(SEED_HISTORY)
  const [drawerOpen, setDrawerOpen] = useState(true)

  const recordHistory = useCallback((expr: string, res: string) => {
    const time = new Date().toTimeString().split(' ')[0]
    setHistory((prev) => [{ time, expr, res }, ...prev])
  }, [])

  const calc = useCalculator(recordHistory)

  const handleRestore = useCallback((res: string) => calc.restore(res), [calc])
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