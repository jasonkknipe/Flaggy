import type { Country } from '../types/country'
import type { StatsStore } from '../types/stats'
import type { CompeteAttempt } from '../types/quiz'
import PillButton from '../components/PillButton'

interface StatisticsScreenProps {
  stats: StatsStore
  byIso2: Map<string, Country>
  attempts: CompeteAttempt[]
  isAttemptLogLoading: boolean
  onRefreshAttempts: () => void
  onOpenAttempt: (attempt: CompeteAttempt) => void
  onBack: () => void
}

export default function StatisticsScreen({
  stats,
  byIso2,
  attempts,
  isAttemptLogLoading,
  onRefreshAttempts,
  onOpenAttempt,
  onBack,
}: StatisticsScreenProps) {
  const { lifetime, byCountry } = stats
  const totalCorrect = Object.values(lifetime.correctByField).reduce((sum, n) => sum + (n ?? 0), 0)
  const totalAsked = Object.values(lifetime.askedByField).reduce((sum, n) => sum + (n ?? 0), 0)
  const overallAccuracy = totalAsked > 0 ? Math.round((totalCorrect / totalAsked) * 100) : 0

  const countryRows = Object.entries(byCountry)
    .map(([iso2, accuracy]) => ({
      iso2,
      name: byIso2.get(iso2)?.name ?? iso2,
      pct: accuracy.attempts > 0 ? Math.round((accuracy.correct / accuracy.attempts) * 100) : 0,
      attempts: accuracy.attempts,
    }))
    .sort((a, b) => a.pct - b.pct)

  return (
    <div className="mx-auto flex min-h-dvh max-w-2xl flex-col gap-8 px-6 py-10">
      <h1 className="font-sans text-2xl font-bold text-ink">Statistics</h1>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <Stat label="Games Played" value={lifetime.gamesPlayed} />
        <Stat label="Questions Answered" value={lifetime.questionsAnswered} />
        <Stat label="Flags Correct" value={lifetime.correctByField.country ?? 0} />
        <Stat label="Codes Correct" value={lifetime.correctByField.callingCode ?? 0} />
        <Stat label="Overall Accuracy" value={`${overallAccuracy}%`} />
        <Stat label="Current Streak" value={lifetime.currentStreak} />
        <Stat label="Best Streak" value={lifetime.bestStreak} />
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between gap-4">
          <div>
            <h2 className="font-sans text-lg font-semibold text-ink">Compete attempts</h2>
            <p className="font-sans text-sm text-ink-muted">Open any run to revisit its study sheet.</p>
          </div>
          <button
            onClick={onRefreshAttempts}
            disabled={isAttemptLogLoading}
            className="font-sans text-sm font-semibold text-brand disabled:opacity-40"
          >
            {isAttemptLogLoading ? 'Syncing…' : 'Sync'}
          </button>
        </div>
        {attempts.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-border bg-surface-card/60 p-5 text-center font-sans text-sm text-ink-muted">
            Your completed and early-exited Compete runs will appear here.
          </div>
        ) : (
          <div className="space-y-2">
            {attempts.map((attempt) => {
              const flagsCorrect = attempt.summary.correctByField.country ?? 0
              const flagsAsked = attempt.summary.askedByField.country ?? 0
              return (
                <button
                  key={attempt.id}
                  onClick={() => onOpenAttempt(attempt)}
                  className="flex w-full items-center justify-between rounded-2xl border border-border bg-surface-card p-4 text-left shadow-sm transition-transform active:scale-[0.99]"
                >
                  <div>
                    <p className="font-sans text-sm font-semibold text-ink">{new Date(attempt.endedAt).toLocaleString()}</p>
                    <p className="mt-0.5 font-sans text-xs text-ink-muted">
                      {attempt.status === 'exited' ? `Exited early · ${flagsAsked} answered` : `${flagsAsked} answered`}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-sans text-lg font-bold tabular-nums text-ink">{flagsCorrect} / {flagsAsked}</p>
                    <p className="font-sans text-xs font-medium text-brand">Study sheet →</p>
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </div>

      <div>
        <h2 className="mb-3 font-sans text-lg font-semibold text-ink">Country history</h2>
        {countryRows.length === 0 ? (
          <p className="font-sans text-sm text-ink-muted">Play a round and this fills in - worst-first, so it's useful for study.</p>
        ) : (
          <ul className="max-h-96 space-y-1 overflow-auto">
            {countryRows.map((row) => (
              <li key={row.iso2} className="flex items-center justify-between border-b border-border py-1.5 font-sans text-sm">
                <span className="text-ink">{row.name}</span>
                <span className="tabular-nums text-ink-muted">
                  {row.pct}% ({row.attempts})
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <PillButton onClick={onBack} variant="ghost">
        Back
      </PillButton>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl border border-border bg-surface-card px-4 py-3 text-center shadow-sm">
      <div className="font-sans text-xl font-bold tabular-nums text-ink">{value}</div>
      <div className="font-sans text-xs text-ink-muted">{label}</div>
    </div>
  )
}
