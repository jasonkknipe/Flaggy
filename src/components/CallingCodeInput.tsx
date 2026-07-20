import { useId, useState } from 'react'
import type { KeyboardEvent } from 'react'
import PillButton from './PillButton'

interface CallingCodeInputProps {
  onSubmit: (value: string) => void
  autoFocus?: boolean
}

export default function CallingCodeInput({ onSubmit, autoFocus }: CallingCodeInputProps) {
  const [digits, setDigits] = useState('')
  const inputId = useId()

  function submit() {
    if (!digits) return
    onSubmit(`+${digits}`)
    setDigits('')
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Enter') {
      event.preventDefault()
      // Do not let the Enter that checks an answer also advance the reveal
      // panel. A subsequent Enter is handled by GameScreen as "Next".
      event.stopPropagation()
      submit()
    }
  }

  return (
    <div className="w-full max-w-sm">
      <label htmlFor={inputId} className="mb-1.5 block text-sm font-medium text-ink-muted">
        Calling code
      </label>
      <div className="flex min-h-11 items-center gap-1 rounded-2xl border border-border bg-surface-card px-4 py-2.5 shadow-sm focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-brand">
        <span className="font-sans text-lg text-ink-muted" aria-hidden="true">
          +
        </span>
        <input
          id={inputId}
          type="text"
          inputMode="numeric"
          autoComplete="off"
          autoFocus={autoFocus}
          aria-label="Calling code, digits only"
          value={digits}
          onChange={(event) => setDigits(event.target.value.replace(/\D/g, ''))}
          onKeyDown={handleKeyDown}
          className="w-full bg-transparent font-sans text-lg tabular-nums text-ink outline-none"
        />
      </div>
      <PillButton onClick={submit} className="mt-2 w-full" disabled={!digits}>
        Check answer
      </PillButton>
    </div>
  )
}
