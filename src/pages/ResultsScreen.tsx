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

  const rows = summary.history.map((record) => {
    const country = byIso2.get(record.iso2)
    const overallCorrect = Object.values(record.correct).every(Boolean)
    const wrongFields = (Object.keys(record.correct) as GuessField[]).filter((field) => !record.correct[field])
    return { record, country, overallCorrect, wrongFields }
  })
  const correctRows = rows.filter((row) => row.overallCorrect)
  const incorrectRows = rows.filter((row) => !row.overallCorrect)

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

        {summary.mode === 'learning' ? (
          <LearningStudySheet summary={summary} byIso2={byIso2} />
        ) : (
          <>
            {incorrectRows.length > 0 && (
              <div className="mb-4">
                <p className="mb-2 font-sans text-sm font-medium text-danger">Incorrect ({incorrectRows.length})</p>
                <ul className="space-y-2">
                  {incorrectRows.map(({ record, country, wrongFields }) => (
                    <li key={record.iso2 + record.answeredAtMs} className="rounded-2xl border border-border bg-surface-card p-3">
                      <div className="font-sans text-sm font-semibold text-ink">
                        {country?.name ?? record.iso2} - {country?.callingCode}
                      </div>
                      {wrongFields.map((field) => (
                        <div key={field} className="font-sans text-xs text-ink-muted">
                          {FIELD_LABEL[field]}: you wrote &ldquo;{record.guesses[field] || '(nothing)'}&rdquo;
                          {field === 'capital' && country ? ` - correct: ${country.capitals.join(' / ')}` : ''}
                          {field === 'country' && country ? ` - correct: ${country.name}` : ''}
                          {field === 'callingCode' && country ? ` - correct: ${country.callingCode}` : ''}
                        </div>
                      ))}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {correctRows.length > 0 && (
              <div>
                <p className="mb-2 font-sans text-sm font-medium text-success">Correct ({correctRows.length})</p>
                <ul className="grid grid-cols-2 gap-x-4 gap-y-1 sm:grid-cols-3">
                  {correctRows.map(({ record, country }) => (
                    <li key={record.iso2 + record.answeredAtMs} className="font-sans text-sm text-ink">
                      {country?.name ?? record.iso2}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}
      </div>

      <PillButton onClick={onHome}>Home</PillButton>
    </div>
  )
}
