import type { Country } from '../types/country'
import type { CompeteAttempt } from '../types/quiz'
import LearningStudySheet from '../components/LearningStudySheet'
import PillButton from '../components/PillButton'

interface AttemptStudySheetScreenProps {
  attempt: CompeteAttempt
  byIso2: Map<string, Country>
  onBack: () => void
}

export default function AttemptStudySheetScreen({ attempt, byIso2, onBack }: AttemptStudySheetScreenProps) {
  const flagsCorrect = attempt.summary.correctByField.country ?? 0

  return (
    <div className="mx-auto flex min-h-dvh max-w-2xl flex-col gap-6 px-6 py-10">
      <div>
        <p className="font-sans text-sm text-ink-muted">Compete attempt</p>
        <h1 className="mt-1 font-sans text-2xl font-bold text-ink">Study sheet</h1>
        <p className="mt-2 font-sans text-sm text-ink-muted">
          {new Date(attempt.endedAt).toLocaleString()} · {flagsCorrect} / {attempt.summary.askedByField.country ?? 0} flags
          {attempt.status === 'exited' ? ' · exited early' : ''}
        </p>
      </div>

      <LearningStudySheet summary={attempt.summary} byIso2={byIso2} />

      <PillButton onClick={onBack} variant="ghost">
        Back to statistics
      </PillButton>
    </div>
  )
}
