import type { Country } from '../types/country'
import type {
  FieldPlan,
  GameMode,
  GuessField,
  QuestionRecord,
  SessionConfig,
  SessionLength,
  SessionState,
  SessionSummary,
} from '../types/quiz'
import { validateGuess } from './answerValidation'
import { createLearningQueue, extendQueueIfRunningLow, reinsertAfterMiss } from './spacedRepetition'

/** Learning Mode always reveals calling code + capital - it never adds a
 *  second or third guess to the one mode built around low cognitive load and
 *  spaced repetition on a single skill. In Guess/Compete, both calling code
 *  and capital are independent per-session choices - reveal-only or guess. */
export function resolveFieldPlan(mode: GameMode, callingCodeGuessingChosen: boolean, capitalGuessingChosen: boolean): FieldPlan {
  if (mode === 'learning') return { callingCode: false, capital: false }
  return { callingCode: callingCodeGuessingChosen, capital: capitalGuessingChosen }
}

/** Compete ignores `length` entirely and is always every country once - per
 *  your "compete against your own record across the whole list" framing, a
 *  shorter Compete run wouldn't be comparable to a personal best. The 20/50/
 *  100 options are a Guess Mode thing. */
export function resolveQueue(mode: GameMode, length: SessionLength, allIso2: string[]): string[] {
  if (mode === 'learning') return createLearningQueue(allIso2)

  const shuffled = shuffleFull(allIso2)
  if (mode === 'compete') return shuffled

  const count = length === 'full' ? shuffled.length : Math.min(length, shuffled.length)
  return shuffled.slice(0, count)
}

function shuffleFull(items: string[]): string[] {
  const result = [...items]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

export function createSession(config: SessionConfig, allIso2: string[]): SessionState {
  return {
    id: crypto.randomUUID(),
    config,
    queue: resolveQueue(config.mode, config.length, allIso2),
    currentIndex: 0,
    history: [],
    startedAt: Date.now(),
    lastTouchedAt: Date.now(),
  }
}

export function currentCountryIso2(state: SessionState): string | null {
  return state.queue[state.currentIndex] ?? null
}

interface SubmitAnswerArgs {
  state: SessionState
  country: Country
  guesses: Partial<Record<GuessField, string>>
  /** The full playable list - only needed for Learning Mode's queue top-up,
   *  ignored for Guess/Compete. Pass it through anyway; it's cheap. */
  allIso2: string[]
}

/** Applies one answered question: validates every field that was actually
 *  asked (per the session's FieldPlan), records the result, and advances the
 *  queue - re-inserting misses and topping up for Learning Mode. Pure
 *  function; the caller owns persistence (localStorage, etc). */
export function submitAnswer({ state, country, guesses, allIso2 }: SubmitAnswerArgs): SessionState {
  const fieldsAsked: GuessField[] = [
    'country',
    ...(state.config.fieldPlan.callingCode ? (['callingCode'] as const) : []),
    ...(state.config.fieldPlan.capital ? (['capital'] as const) : []),
  ]

  const correct: Partial<Record<GuessField, boolean>> = {}
  for (const field of fieldsAsked) {
    correct[field] = validateGuess(field, guesses[field] ?? '', country)
  }

  const record: QuestionRecord = {
    iso2: country.iso2,
    guesses,
    correct,
    answeredAtMs: Date.now(),
  }

  let queue = state.queue
  if (state.config.mode === 'learning') {
    if (!correct.country) {
      queue = reinsertAfterMiss(
        queue,
        state.currentIndex,
        country.iso2,
        state.history.map((r) => r.iso2),
      )
    }
    queue = extendQueueIfRunningLow(queue, state.currentIndex + 1, allIso2)
  }

  return {
    ...state,
    queue,
    currentIndex: state.currentIndex + 1,
    history: [...state.history, record],
    lastTouchedAt: Date.now(),
  }
}

/** Learning Mode never completes on its own - it ends only when the user
 *  presses Exit (handled by calling summarize() directly, not by this). */
export function isSessionComplete(state: SessionState): boolean {
  if (state.config.mode === 'learning') return false
  return state.currentIndex >= state.queue.length
}

export function summarize(state: SessionState): SessionSummary {
  const correctByField: Partial<Record<GuessField, number>> = {}
  const askedByField: Partial<Record<GuessField, number>> = {}

  for (const record of state.history) {
    for (const field of Object.keys(record.correct) as GuessField[]) {
      askedByField[field] = (askedByField[field] ?? 0) + 1
      if (record.correct[field]) {
        correctByField[field] = (correctByField[field] ?? 0) + 1
      }
    }
  }

  return {
    mode: state.config.mode,
    totalQuestions: state.history.length,
    correctByField,
    askedByField,
    history: state.history,
  }
}
