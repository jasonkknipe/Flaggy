import type { Country } from '../types/country'
import type { GuessField, SessionSummary } from '../types/quiz'
import type { PersonalBest } from '../types/stats'
import PillButton from '../components/PillButton'
import AnimatedCounter from '../components/AnimatedCounter'
import LearningStudySheet from '../components/LearningStudySheet'

interface ResultsScreenProps {
  summary: SessionSummary
  byIso2: Map<string, Country>
  competeBestBeforeThisSession: PersonalBest | null
  onHome: () => void
}

const FIELD_LABEL: Record<GuessField, string> = {
  country: 'Flags',
  callingCode: 'Country Codes',
  capital: 'Capitals',
}

export default function ResultsScreen({ summary, byIso2, competeBestBeforeThisSession, onHome }: ResultsScreenProps) {
  const fields = Object.keys(summary.askedByField) as GuessField[]

  const flagsCorrectThisSession = summary.correctByField.country ?? 0
  const isNewCompeteBest =
    summary.mode === 'compete' &&
    (!competeBestBeforeThisSession || flagsCorrectThisSession > competeBestBeforeThisSession.flagsCorrect)

  return (
    <div className="mx-auto flex min-h-dvh max-w-2xl flex-col gap-8 px-6 py-10">
      <div className="text-center">
        <h1 className="font-sans text-2xl font-bold text-ink">Session Complete</h1>
        {summary.mode === 'compete' && (
          <p className="mt-2 font-sans text-sm text-ink-muted">
            {isNewCompeteBest
              ? 'New personal best!'
              : competeBestBeforeThisSession
                ? `Best: ${competeBestBeforeThisSession.flagsCorrect} / ${competeBestBeforeThisSession.totalQuestions} flags`
                : null}
            {!isNewCompeteBest &&
              competeBestBeforeThisSession &&
              ` (${flagsCorrectThisSession - competeBestBeforeThisSession.flagsCorrect >= 0 ? '+' : ''}${
                flagsCorrectThisSession - competeBestBeforeThisSession.flagsCorrect
              } this time)`}
          </p>
        )}
      </div>

      <div className="flex flex-wrap justify-center gap-6">
        {fields.map((field) => {
          const asked = summary.askedByField[field] ?? 0
          const correct = summary.correctByField[field] ?? 0
          const pct = asked > 0 ? Math.round((correct / asked) * 100) : 0
          return (
            <div key={field} className="rounded-3xl border border-border bg-surface-card px-6 py-4 text-center shadow-sm">
              <div className="font-sans text-xs uppercase tracking-wide text-ink-muted">{FIELD_LABEL[field]}</div>
              <div className="font-sans text-2xl font-bold text-ink">
                <AnimatedCounter value={correct} /> / {asked}
              </div>
              <div className="font-sans text-sm text-ink-muted">{pct}%</div>
            </div>
          )
        })}
      </div>

      <div>
        <h2 className="mb-3 font-sans text-lg font-semibold text-ink">Study Sheet</h2>

        <LearningStudySheet summary={summary} byIso2={byIso2} />
      </div>

      <PillButton onClick={onHome}>Home</PillButton>
    </div>
  )
}
