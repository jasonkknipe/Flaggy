import { useMemo } from 'react'
import type { SessionState } from '../types/quiz'
import { summarize } from '../engine/sessionEngine'
import AnimatedCounter from './AnimatedCounter'

const FIELD_LABELS = {
  country: 'Flags',
  callingCode: 'Country Codes',
  capital: 'Capitals',
} as const

export default function ScoreboardBar({ session }: { session: SessionState }) {
  const summary = useMemo(() => summarize(session), [session])
  const fields = Object.keys(FIELD_LABELS) as Array<keyof typeof FIELD_LABELS>
  const trackedFields = fields.filter((field) => (summary.askedByField[field] ?? 0) > 0)

  return (
    <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-1 px-4 py-2">
      {trackedFields.map((field) => {
        const asked = summary.askedByField[field] ?? 0
        const correct = summary.correctByField[field] ?? 0
        const pct = asked > 0 ? Math.round((correct / asked) * 100) : 0
        return (
          <div key={field} className="text-center">
            <div className="font-sans text-xs uppercase tracking-wide text-ink-muted">{FIELD_LABELS[field]}</div>
            <div className="font-sans text-lg font-semibold text-ink">
              <AnimatedCounter value={correct} /> / <AnimatedCounter value={asked} />
              <span className="ml-1.5 text-sm font-normal text-ink-muted">{pct}%</span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
