import type { Country } from '../types/country'
import type { SessionSummary } from '../types/quiz'
import { flagSvgPath } from '../engine/flagAsset'
import { CheckIcon, CrossIcon } from './StatusIcons'

interface LearningStudySheetProps {
  summary: SessionSummary
  byIso2: Map<string, Country>
}

/** One tile per guess (not per country — a country missed then later
 *  answered correctly shows up as two separate tiles, reflecting what
 *  actually happened). Border color carries correct/incorrect; the small
 *  badge repeats that non-visually so it's never colour-only. Deliberately
 *  no wrong-answer text — the flag and the correct name are what matter for
 *  study, not what you typed. */
export default function LearningStudySheet({ summary, byIso2 }: LearningStudySheetProps) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
      {summary.history.map((record, index) => {
        const country = byIso2.get(record.iso2)
        if (!country) return null
        const correct = record.correct.country === true

        return (
          <div
            key={`${record.iso2}-${record.answeredAtMs}-${index}`}
            className={`rounded-2xl border-2 p-2 ${correct ? 'border-success' : 'border-danger'}`}
          >
            <div className="relative">
              <img src={flagSvgPath(country.iso2)} alt={`Flag of ${country.name}`} className="w-full rounded-md object-contain" />
              <span
                className={`absolute -right-1.5 -top-1.5 flex h-6 w-6 items-center justify-center rounded-full border-2 border-surface-card ${
                  correct ? 'bg-success' : 'bg-danger'
                }`}
              >
                {correct ? <CheckIcon className="h-3.5 w-3.5 text-white" /> : <CrossIcon className="h-3.5 w-3.5 text-white" />}
              </span>
            </div>
            <p className="mt-1.5 truncate text-center font-sans text-sm font-medium text-ink">{country.name}</p>
          </div>
        )
      })}
    </div>
  )
}
