import { useEffect, useMemo, useState } from 'react'
import type { Country } from '../types/country'
import type { GuessField, SessionState } from '../types/quiz'
import { buildGameSteps } from '../engine/gameSteps'
import { currentCountryIso2, isSessionComplete, submitAnswer } from '../engine/sessionEngine'
import { validateGuess } from '../engine/answerValidation'
import GlassBar from '../components/GlassBar'
import FlagDisplay from '../components/FlagDisplay'
import ScoreboardBar from '../components/ScoreboardBar'
import AutocompleteInput from '../components/AutocompleteInput'
import CallingCodeInput from '../components/CallingCodeInput'
import RevealPanel from '../components/RevealPanel'
import PillButton from '../components/PillButton'

interface GameScreenProps {
  session: SessionState
  byIso2: Map<string, Country>
  allIso2: string[]
  allNames: string[]
  allCapitals: string[]
  onSessionChange: (updated: SessionState) => void
  onSessionEnd: (finalState: SessionState) => void
  recordQuestion: (record: SessionState['history'][number]) => void
}

const FIELD_LABEL: Record<GuessField, string> = {
  country: 'Which country is this?',
  callingCode: "This country's calling code?",
  capital: "This country's capital?",
}

export default function GameScreen({
  session,
  byIso2,
  allIso2,
  allNames,
  allCapitals,
  onSessionChange,
  onSessionEnd,
  recordQuestion,
}: GameScreenProps) {
  const steps = useMemo(
    () => buildGameSteps(session.config.mode, session.config.fieldPlan),
    [session.config.mode, session.config.fieldPlan],
  )
  const [stepIndex, setStepIndex] = useState(0)
  const [guesses, setGuesses] = useState<Partial<Record<GuessField, string>>>({})
  const [fieldResults, setFieldResults] = useState<Partial<Record<GuessField, boolean>>>({})
  const [isAnswerInputFocused, setIsAnswerInputFocused] = useState(false)
  const [viewportHeight, setViewportHeight] = useState<number>()

  const currentIso2 = currentCountryIso2(session)
  const currentCountry = currentIso2 ? byIso2.get(currentIso2) : undefined

  const step = currentCountry ? steps[stepIndex] : undefined
  const isFixedLength = session.config.mode !== 'learning'
  const totalQuestions = isFixedLength ? session.queue.length : undefined

  // iOS can leave the layout viewport at full height while the visual
  // viewport shrinks for its keyboard. Use the latter so the quiz remains a
  // contained screen instead of scrolling the flag out of view.
  useEffect(() => {
    const viewport = window.visualViewport
    if (!viewport) return

    const updateViewportHeight = () => setViewportHeight(Math.round(viewport.height))
    updateViewportHeight()
    viewport.addEventListener('resize', updateViewportHeight)
    viewport.addEventListener('scroll', updateViewportHeight)
    return () => {
      viewport.removeEventListener('resize', updateViewportHeight)
      viewport.removeEventListener('scroll', updateViewportHeight)
    }
  }, [])

  function finishQuestion(finalGuesses: Partial<Record<GuessField, string>>) {
    if (!currentCountry) return
    const updated = submitAnswer({ state: session, country: currentCountry, guesses: finalGuesses, allIso2 })
    recordQuestion(updated.history[updated.history.length - 1])
    onSessionChange(updated)
    setStepIndex(0)
    setGuesses({})
    setFieldResults({})
    if (isSessionComplete(updated)) {
      onSessionEnd(updated)
    }
  }

  function handleAskSubmit(field: GuessField, value: string) {
    if (!currentCountry) return
    const correct = validateGuess(field, value, currentCountry)
    const nextGuesses = { ...guesses, [field]: value }
    const nextResults = { ...fieldResults, [field]: correct }
    setGuesses(nextGuesses)
    setFieldResults(nextResults)

    const isLastStep = stepIndex === steps.length - 1
    if (isLastStep) {
      finishQuestion(nextGuesses)
    } else {
      setStepIndex(stepIndex + 1)
    }
  }

  function handleRevealNext() {
    const isLastStep = stepIndex === steps.length - 1
    if (isLastStep) {
      finishQuestion(guesses)
    } else {
      setStepIndex(stepIndex + 1)
    }
  }

  function handleExit() {
    onSessionEnd(session)
  }

  // Enter advances only when a reveal is already on screen. The answer inputs
  // stop propagation for their submitting Enter, so users always see the
  // correct/incorrect feedback before a separate Enter advances.
  // Re-subscribes on every render (cheap) rather than trying to track a
  // dependency array, so it always closes over the current step/guesses.
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (step?.kind === 'reveal' && event.key === 'Enter' && !event.repeat) {
        event.preventDefault()
        handleRevealNext()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  })

  if (!currentCountry || !step) {
    // Shouldn't normally render — App transitions away as soon as the
    // session completes — but guards against a data/session mismatch.
    return null
  }

  return (
    <div className="flex h-dvh min-h-0 flex-col overflow-hidden" style={viewportHeight ? { height: viewportHeight } : undefined}>
      <GlassBar>
        <div className="flex items-center justify-between px-4 py-2">
          <button
            onClick={handleExit}
            className="font-sans text-sm font-medium text-ink-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            Exit round
          </button>
          <span className="font-sans text-sm font-medium text-ink-muted tabular-nums">
            {totalQuestions !== undefined
              ? `Question ${session.currentIndex + 1} / ${totalQuestions}`
              : `Question ${session.currentIndex + 1}`}
          </span>
        </div>
        <ScoreboardBar session={session} />
      </GlassBar>

      <div className={`flex min-h-0 flex-1 flex-col items-center overflow-y-auto px-6 ${isAnswerInputFocused ? 'gap-1 py-2' : 'gap-3 py-4'}`}>
        <FlagDisplay country={currentCountry} compact={isAnswerInputFocused} />

        {step.kind === 'ask' && (
          <div className="flex w-full flex-col items-center gap-2">
            <p className="font-sans text-base font-medium text-ink">{FIELD_LABEL[step.field]}</p>
            {step.field === 'callingCode' ? (
              <CallingCodeInput
                autoFocus
                onSubmit={(value) => handleAskSubmit('callingCode', value)}
                onFocus={() => setIsAnswerInputFocused(true)}
                onBlur={() => setIsAnswerInputFocused(false)}
              />
            ) : (
              <AutocompleteInput
                label={step.field === 'country' ? 'Country' : 'Capital'}
                options={step.field === 'country' ? allNames : allCapitals}
                autoFocus
                onSubmit={(value) => handleAskSubmit(step.field, value)}
                onFocus={() => setIsAnswerInputFocused(true)}
                onBlur={() => setIsAnswerInputFocused(false)}
              />
            )}
            <PillButton variant="ghost" onClick={() => handleAskSubmit(step.field, '')}>
              Not sure — skip
            </PillButton>
          </div>
        )}

        {step.kind === 'reveal' && (
          <RevealPanel
            country={currentCountry}
            gradeFields={step.gradeFields}
            guesses={guesses}
            fieldResults={fieldResults}
            showInfoCard={step.showInfoCard}
            onNext={handleRevealNext}
          />
        )}
      </div>
    </div>
  )
}
