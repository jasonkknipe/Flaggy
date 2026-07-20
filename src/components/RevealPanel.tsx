import { motion } from 'framer-motion'
import type { Country } from '../types/country'
import type { GuessField } from '../types/quiz'
import PillButton from './PillButton'
import { CheckIcon, CrossIcon } from './StatusIcons'

interface RevealPanelProps {
  country: Country
  gradeFields: GuessField[]
  guesses: Partial<Record<GuessField, string>>
  fieldResults: Partial<Record<GuessField, boolean>>
  showInfoCard: boolean
  onNext: () => void
  nextLabel?: string
}

function GradeBadge({ correct, label }: { correct: boolean; label: string }) {
  return (
    <span className="inline-flex items-center gap-1 font-sans text-sm font-medium" role="status">
      {correct ? <CheckIcon /> : <CrossIcon />}
      <span className={correct ? 'text-success' : 'text-danger'}>{label}</span>
    </span>
  )
}

export default function RevealPanel({
  country,
  gradeFields,
  guesses,
  fieldResults,
  showInfoCard,
  onNext,
  nextLabel = 'Next',
}: RevealPanelProps) {
  const isGraded = (field: GuessField) => gradeFields.includes(field)
  const isCorrect = (field: GuessField) => fieldResults[field] === true

  const capitalText = country.capitals.join(' / ')

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="w-full max-w-md rounded-3xl border border-border bg-surface-card p-5 shadow-lg"
    >
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-sans text-xl font-bold text-ink">{country.name}</h2>
        {isGraded('country') && <GradeBadge correct={isCorrect('country')} label={isCorrect('country') ? 'Correct' : 'Incorrect'} />}
      </div>

      {isGraded('country') && !isCorrect('country') && (
        <p className="mb-3 -mt-2 font-sans text-sm text-ink-muted">You wrote: {guesses.country || '(nothing)'}</p>
      )}

      <dl className="space-y-2">
        {(showInfoCard || isGraded('capital')) && (
          <FactRow label="Capital" value={capitalText} graded={isGraded('capital')} correct={isCorrect('capital')} guess={guesses.capital} />
        )}
        {(showInfoCard || isGraded('callingCode')) && (
          <FactRow
            label="Calling code"
            value={country.callingCode}
            graded={isGraded('callingCode')}
            correct={isCorrect('callingCode')}
            guess={guesses.callingCode}
          />
        )}
        {showInfoCard && (
          <>
            <FactRow label="Currency" value={country.currency} />
            <FactRow label="Languages" value={country.languages.join(', ')} />
            <FactRow label="Continent" value={country.continent} />
            <FactRow label="Population" value={formatPopulation(country.population)} />
          </>
        )}
      </dl>

      <PillButton onClick={onNext} className="mt-4 w-full">
        {nextLabel}
      </PillButton>
    </motion.div>
  )
}

function FactRow({
  label,
  value,
  graded,
  correct,
  guess,
}: {
  label: string
  value: string
  graded?: boolean
  correct?: boolean
  guess?: string
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-border pb-1.5 last:border-b-0">
      <dt className="font-sans text-sm text-ink-muted">{label}</dt>
      <dd className="text-right font-sans text-sm text-ink">
        <div className="flex items-center justify-end gap-1.5">
          <span>{value}</span>
          {graded && (correct ? <CheckIcon /> : <CrossIcon />)}
        </div>
        {graded && !correct && <div className="text-xs text-ink-muted">You wrote: {guess || '(nothing)'}</div>}
      </dd>
    </div>
  )
}

function formatPopulation(value: number): string {
  if (value <= 0) return 'Unknown'
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)} million`
  if (value >= 1_000) return `${(value / 1_000).toFixed(0)} thousand`
  return value.toString()
}
