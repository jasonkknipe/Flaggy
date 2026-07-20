import PillButton from '../components/PillButton'

interface SettingsScreenProps {
  onResetStatistics: () => void
  onResetLearningHistory: () => void
  onClearCache: () => void
  onBack: () => void
}

export default function SettingsScreen({ onResetStatistics, onResetLearningHistory, onClearCache, onBack }: SettingsScreenProps) {
  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col gap-6 px-6 py-10">
      <h1 className="font-sans text-2xl font-bold text-ink">Settings</h1>

      <SettingsRow
        title="Reset statistics"
        description="Clears lifetime totals, streaks, and your Compete personal best. Per-country history is kept."
        actionLabel="Reset"
        onConfirm={onResetStatistics}
      />
      <SettingsRow
        title="Reset learning history"
        description="Clears per-country flag accuracy — the data spaced repetition and future adaptive learning would use."
        actionLabel="Reset"
        onConfirm={onResetLearningHistory}
      />
      <SettingsRow
        title="Clear cache"
        description="Removes the offline copy of the app and its data, and reloads. Everything refetches on next load."
        actionLabel="Clear"
        onConfirm={onClearCache}
      />

      <PillButton onClick={onBack} variant="ghost">
        Back
      </PillButton>
    </div>
  )
}

function SettingsRow({
  title,
  description,
  actionLabel,
  onConfirm,
}: {
  title: string
  description: string
  actionLabel: string
  onConfirm: () => void
}) {
  return (
    <div className="rounded-3xl border border-border bg-surface-card p-4 shadow-sm">
      <h2 className="font-sans text-base font-semibold text-ink">{title}</h2>
      <p className="mt-1 font-sans text-sm text-ink-muted">{description}</p>
      <PillButton
        variant="secondary"
        className="mt-3"
        onClick={() => {
          if (window.confirm(`${title}? This can't be undone.`)) onConfirm()
        }}
      >
        {actionLabel}
      </PillButton>
    </div>
  )
}
