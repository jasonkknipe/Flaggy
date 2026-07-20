import type { Country } from '../types/country'
import type { GuessField, QuestionRecord, SessionSummary } from '../types/quiz'
import { CheckIcon, CrossIcon } from './StatusIcons'
import FlagImage from './FlagImage'

interface LearningStudySheetProps {
  summary: SessionSummary
  byIso2: Map<string, Country>
}

/** One row per attempted country across every game mode. The three matching
 * fact cards make the study sheet easy to scan in Guess/Compete while still
 * retaining Learning's repeated-attempt history. */
export default function LearningStudySheet({ summary, byIso2 }: LearningStudySheetProps) {
  return (
    <div className="space-y-3">
      {summary.history.map((record, index) => {
        const country = byIso2.get(record.iso2)
        if (!country) return null

        return (
          <div
            key={`${record.iso2}-${record.answeredAtMs}-${index}`}
            className="rounded-3xl border border-border bg-surface-card p-3 shadow-sm"
          >
            <div className="grid gap-3 md:grid-cols-3">
              <FlagCard country={country} record={record} />
              <FactCard field="capital" label="Capital city" value={country.capitals.join(' / ')} record={record} />
              <FactCard field="callingCode" label="Calling code" value={country.callingCode} record={record} />
            </div>
          </div>
        )
      })}
    </div>
  )
}

function FlagCard({ country, record }: { country: Country; record: QuestionRecord }) {
  const graded = Object.hasOwn(record.correct, 'country')
  const correct = record.correct.country === true

  return (
    <div className={`rounded-2xl border-2 p-3 ${borderClass(graded, correct)}`}>
      <CardHeading label="Flag" graded={graded} correct={correct} />
      <FlagImage iso2={country.iso2} name={country.name} className="mt-2 w-full rounded-lg" />
      <p className="mt-2 truncate font-sans text-sm font-semibold text-ink">{country.name}</p>
      {graded && !correct && <GuessText value={record.guesses.country} />}
    </div>
  )
}

function FactCard({
  field,
  label,
  value,
  record,
}: {
  field: Exclude<GuessField, 'country'>
  label: string
  value: string
  record: QuestionRecord
}) {
  const graded = Object.hasOwn(record.correct, field)
  const correct = record.correct[field] === true

  return (
    <div className={`flex min-h-32 flex-col justify-between rounded-2xl border-2 p-3 ${borderClass(graded, correct)}`}>
      <CardHeading label={label} graded={graded} correct={correct} />
      <p className="mt-4 font-sans text-lg font-semibold leading-snug text-ink">{value}</p>
      {graded && !correct ? <GuessText value={record.guesses[field]} /> : <div className="h-4" />}
    </div>
  )
}

function CardHeading({ label, graded, correct }: { label: string; graded: boolean; correct: boolean }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="font-sans text-xs font-semibold uppercase tracking-wide text-ink-muted">{label}</span>
      {graded && (correct ? <CheckIcon className="h-4 w-4 text-success" /> : <CrossIcon className="h-4 w-4 text-danger" />)}
    </div>
  )
}

function GuessText({ value }: { value?: string }) {
  return <p className="mt-2 truncate font-sans text-xs text-ink-muted">You wrote: {value || '(nothing)'}</p>
}

function borderClass(graded: boolean, correct: boolean): string {
  if (!graded) return 'border-border bg-surface-app/40'
  return correct ? 'border-success bg-success/5' : 'border-danger bg-danger/5'
}
