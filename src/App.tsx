import { useEffect, useState } from 'react'
import { useCountries } from './hooks/useCountries'
import { useSession } from './hooks/useSession'
import { useStats } from './hooks/useStats'
import { useSettings } from './hooks/useSettings'
import { resolveFieldPlan, summarize } from './engine/sessionEngine'
import type { GameMode, SessionLength, SessionState, SessionSummary } from './types/quiz'
import type { PersonalBest } from './types/stats'
import HomeScreen from './pages/HomeScreen'
import CasualSelectScreen from './pages/CasualSelectScreen'
import ModeOptionsScreen from './pages/ModeOptionsScreen'
import GameScreen from './pages/GameScreen'
import ResultsScreen from './pages/ResultsScreen'
import StatisticsScreen from './pages/StatisticsScreen'
import SettingsScreen from './pages/SettingsScreen'

type View = 'home' | 'casualSelect' | 'modeOptions' | 'game' | 'results' | 'statistics' | 'settings'
type PendingMode = Extract<GameMode, 'guess' | 'compete'>

export default function App() {
  const [view, setView] = useState<View>('home')
  const [pendingMode, setPendingMode] = useState<PendingMode | null>(null)
  const [lastSummary, setLastSummary] = useState<SessionSummary | null>(null)
  const [competeBestSnapshot, setCompeteBestSnapshot] = useState<PersonalBest | null>(null)

  const { byIso2, allNames, allCapitals, allIso2 } = useCountries()
  const { session, setSession, startSession, clearSession } = useSession()
  const { stats, recordQuestion, recordSessionEnd, resetStatistics, resetLearningHistory } = useStats()
  const { settings, setSettings } = useSettings()

  // Defensive: if a view's required state is missing (e.g. arrived here via
  // a stale reference), fall back to Home rather than render a dead end.
  useEffect(() => {
    if (view === 'game' && !session) setView('home')
    if (view === 'modeOptions' && !pendingMode) setView('home')
    if (view === 'results' && !lastSummary) setView('home')
  }, [view, session, pendingMode, lastSummary])

  function endSession(finalState: SessionState) {
    const summary = summarize(finalState)
    setCompeteBestSnapshot(stats.lifetime.competeBest)
    recordSessionEnd(finalState.config.mode, summary)
    clearSession()
    setLastSummary(summary)
    setView('results')
  }

  function startLearning() {
    startSession({ mode: 'learning', fieldPlan: resolveFieldPlan('learning', false, false), length: 'full' }, allIso2)
    setView('game')
  }

  function startFromOptions(length: SessionLength, callingCodeGuessing: boolean, capitalGuessing: boolean) {
    if (!pendingMode) return
    setSettings((prev) => ({
      ...prev,
      lastCallingCodeGuessChoice: callingCodeGuessing,
      lastCapitalGuessChoice: capitalGuessing,
      lastSessionLength: length,
    }))
    startSession(
      { mode: pendingMode, fieldPlan: resolveFieldPlan(pendingMode, callingCodeGuessing, capitalGuessing), length },
      allIso2,
    )
    setView('game')
  }

  async function clearCache() {
    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations()
      await Promise.all(registrations.map((registration) => registration.unregister()))
    }
    if ('caches' in window) {
      const keys = await caches.keys()
      await Promise.all(keys.map((key) => caches.delete(key)))
    }
    window.location.reload()
  }

  switch (view) {
    case 'home':
      return (
        <HomeScreen
          session={session}
          onResumeSession={() => setView('game')}
          onEndSession={() => session && endSession(session)}
          onCasual={() => setView('casualSelect')}
          onCompete={() => {
            setPendingMode('compete')
            setView('modeOptions')
          }}
          onStatistics={() => setView('statistics')}
          onSettings={() => setView('settings')}
        />
      )

    case 'casualSelect':
      return (
        <CasualSelectScreen
          onLearning={startLearning}
          onGuess={() => {
            setPendingMode('guess')
            setView('modeOptions')
          }}
          onBack={() => setView('home')}
        />
      )

    case 'modeOptions':
      return pendingMode ? (
        <ModeOptionsScreen
          mode={pendingMode}
          totalCountries={allIso2.length}
          competeBest={stats.lifetime.competeBest}
          defaultLength={settings.lastSessionLength}
          defaultCallingCodeGuessing={settings.lastCallingCodeGuessChoice}
          defaultCapitalGuessing={settings.lastCapitalGuessChoice}
          onStart={startFromOptions}
          onBack={() => setView(pendingMode === 'guess' ? 'casualSelect' : 'home')}
        />
      ) : null

    case 'game':
      return session ? (
        <GameScreen
          session={session}
          byIso2={byIso2}
          allIso2={allIso2}
          allNames={allNames}
          allCapitals={allCapitals}
          onSessionChange={setSession}
          onSessionEnd={endSession}
          recordQuestion={recordQuestion}
        />
      ) : null

    case 'results':
      return lastSummary ? (
        <ResultsScreen
          summary={lastSummary}
          byIso2={byIso2}
          competeBestBeforeThisSession={competeBestSnapshot}
          onHome={() => setView('home')}
        />
      ) : null

    case 'statistics':
      return <StatisticsScreen stats={stats} byIso2={byIso2} onBack={() => setView('home')} />

    case 'settings':
      return (
        <SettingsScreen
          onResetStatistics={resetStatistics}
          onResetLearningHistory={resetLearningHistory}
          onClearCache={clearCache}
          onBack={() => setView('home')}
        />
      )
  }
}
