import { useState } from 'react'
import PillButton from '../components/PillButton'
import type { PersonalBest } from '../types/stats'
import type { SessionLength } from '../types/quiz'

interface ModeOptionsScreenProps {
  mode: 'guess' | 'compete'
  totalCountries: number
  competeBest: PersonalBest | null
  defaultLength: SessionLength
  defaultCallingCodeGuessing: boolean
  defaultCapitalGuessing: boolean
  onStart: (length: SessionLength, callingCodeGuessing: boolean, capitalGuessing: boolean) => void
  onBack: () => void
}

const LENGTH_OPTIONS: SessionLength[] = [20, 50, 100, 'full']

function ToggleRow({
  label,
  value,
  onChange,
}: {
  label: string
  value: boolean
  onChange: (next: boolean) => void
}) {
  return (
    <div className="w-full max-w-sm">
      <p className="mb-2 font-sans text-sm font-medium text-ink-muted">{label}</p>
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => onChange(false)}
          className={`min-h-12 rounded-2xl border font-sans text-sm font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${
            !value ? 'border-brand bg-brand text-white' : 'border-border bg-surface-card text-ink'
          }`}
        >
          Reveal only
        </button>
        <button
          onClick={() => onChange(true)}
          className={`min-h-12 rounded-2xl border font-sans text-sm font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${
            value ? 'border-brand bg-brand text-white' : 'border-border bg-surface-card text-ink'
          }`}
        >
          Guess them
        </button>
      </div>
    </div>
  )
}

export default function ModeOptionsScreen({
  mode,
  totalCountries,
  competeBest,
  defaultLength,
  defaultCallingCodeGuessing,
  defaultCapitalGuessing,
  onStart,
  onBack,
}: ModeOptionsScreenProps) {
  const [length, setLength] = useState<SessionLength>(defaultLength)
  const [callingCodeGuessing, setCallingCodeGuessing] = useState(defaultCallingCodeGuessing)
  const [capitalGuessing, setCapitalGuessing] = useState(defaultCapitalGuessing)

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-8 px-6 py-8">
      <h1 className="font-sans text-2xl font-bold text-ink">{mode === 'guess' ? 'Guess Mode' : 'Compete Mode'}</h1>

      {mode === 'compete' && competeBest && (
        <p className="font-sans text-sm text-ink-muted">
          Your best: {competeBest.flagsCorrect} / {competeBest.totalQuestions} flags
        </p>
      )}

      {mode === 'guess' && (
        <div className="w-full max-w-sm">
          <p className="mb-2 font-sans text-sm font-medium text-ink-muted">Session length</p>
          <div className="grid grid-cols-4 gap-2">
            {LENGTH_OPTIONS.map((option) => (
              <button
                key={String(option)}
                onClick={() => setLength(option)}
                className={`min-h-12 rounded-2xl border font-sans text-sm font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${
                  length === option ? 'border-brand bg-brand text-white' : 'border-border bg-surface-card text-ink'
                }`}
              >
                {option === 'full' ? `All ${totalCountries}` : option}
              </button>
            ))}
          </div>
        </div>
      )}

      {mode === 'compete' && (
        <p className="font-sans text-sm text-ink-muted">Every country, once - {totalCountries} in total.</p>
      )}

      <ToggleRow label="Country calling codes" value={callingCodeGuessing} onChange={setCallingCodeGuessing} />
      <ToggleRow label="Capital cities" value={capitalGuessing} onChange={setCapitalGuessing} />

      <div className="flex w-full max-w-sm flex-col gap-3">
        <PillButton onClick={() => onStart(mode === 'compete' ? 'full' : length, callingCodeGuessing, capitalGuessing)}>
          Start
        </PillButton>
        <PillButton onClick={onBack} variant="ghost">
          Back
        </PillButton>
      </div>
    </div>
  )
}
