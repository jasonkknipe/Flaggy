import WorldMapBackdrop from '../components/WorldMapBackdrop'
import PillButton from '../components/PillButton'
import ModeOptionCard from '../components/ModeOptionCard'
import type { SessionState } from '../types/quiz'

interface HomeScreenProps {
  session: SessionState | null
  onResumeSession: () => void
  onEndSession: () => void
  onCasual: () => void
  onCompete: () => void
  onStatistics: () => void
  onSettings: () => void
}

const MODE_LABEL: Record<SessionState['config']['mode'], string> = {
  learning: 'Learning Mode',
  guess: 'Guess Mode',
  compete: 'Compete Mode',
}

export default function HomeScreen({
  session,
  onResumeSession,
  onEndSession,
  onCasual,
  onCompete,
  onStatistics,
  onSettings,
}: HomeScreenProps) {
  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center gap-8 overflow-hidden px-6 py-12">
      <WorldMapBackdrop />

      <div className="relative z-10 text-center">
        <div className="text-6xl">🌍</div>
        <h1 className="mt-3 font-sans text-3xl font-bold text-ink">Flag Trainer</h1>
      </div>

      {session && (
        <div className="relative z-10 w-full max-w-sm rounded-3xl border border-border bg-surface-card p-5 shadow-lg">
          <p className="font-sans text-sm text-ink-muted">Unfinished round</p>
          <p className="font-sans text-lg font-semibold text-ink">
            {MODE_LABEL[session.config.mode]} — {session.history.length} answered
          </p>
          <div className="mt-4 flex gap-3">
            <PillButton onClick={onResumeSession} className="flex-1">
              Resume
            </PillButton>
            <PillButton onClick={onEndSession} variant="secondary" className="flex-1">
              End round
            </PillButton>
          </div>
        </div>
      )}

      <div className="relative z-10 flex w-full max-w-sm flex-col gap-3">
        <ModeOptionCard
          title="Casual"
          description="Practice without pressure — choose Learning or Guess mode next."
          onClick={onCasual}
        />
        <ModeOptionCard
          title="Compete"
          description="Every country, once, no feedback until the end. Try to beat your best."
          onClick={onCompete}
        />
        <PillButton onClick={onStatistics} variant="secondary">
          Statistics
        </PillButton>
        <PillButton onClick={onSettings} variant="secondary">
          Settings
        </PillButton>
      </div>
    </div>
  )
}
