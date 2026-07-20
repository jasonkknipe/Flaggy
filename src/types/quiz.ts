export type GameMode = 'learning' | 'guess' | 'compete'

/** The three things a question can ask about. Country is asked in every mode
 *  (see resolveFieldPlan in the engine) so it isn't part of FieldPlan below -
 *  it's the one constant, everything else is conditional. */
export type GuessField = 'country' | 'callingCode' | 'capital'

/** Whether calling code / capital are guessed (true) or simply revealed
 *  (false) for a session. Resolved by the engine, not constructed by hand -
 *  see resolveFieldPlan, which encodes that Learning Mode always reveals
 *  both regardless of what's passed in here. */
export interface FieldPlan {
  callingCode: boolean
  capital: boolean
}

/** 20/50/100 are user-picked lengths for Guess Mode, with countries drawn at
 *  random each time. 'full' means every country once - Compete Mode is
 *  always 'full', regardless of what's stored in a SessionConfig, since
 *  competing against your own record only makes sense against the whole list. */
export type SessionLength = 20 | 50 | 100 | 'full'

export interface SessionConfig {
  mode: GameMode
  fieldPlan: FieldPlan
  /** Ignored for 'compete' - see the SessionLength note above. */
  length: SessionLength
}

export interface QuestionRecord {
  iso2: string
  /** What was actually typed for each field that was asked. Fields that were
   *  only revealed (not guessed) don't appear here. */
  guesses: Partial<Record<GuessField, string>>
  correct: Partial<Record<GuessField, boolean>>
  answeredAtMs: number
}

export interface SessionState {
  id: string
  config: SessionConfig
  /** iso2 queue in play order. Learning Mode mutates this as answers come in
   *  (spaced repetition re-insertion + topping up when it runs low). */
  queue: string[]
  currentIndex: number
  history: QuestionRecord[]
  startedAt: number
  /** Updated on every answer; used to decide what "resume or end?" should
   *  show after a refresh (a session untouched for a long time is more
   *  likely to be intentionally abandoned, though v1 just always asks). */
  lastTouchedAt: number
}

export interface SessionSummary {
  mode: GameMode
  totalQuestions: number
  correctByField: Partial<Record<GuessField, number>>
  askedByField: Partial<Record<GuessField, number>>
  history: QuestionRecord[]
}

export type CompeteAttemptStatus = 'completed' | 'exited'

/** A durable snapshot of a Compete run. Kept separate from lifetime stats so
 * an unfinished run is just as reviewable as a completed one. */
export interface CompeteAttempt {
  id: string
  startedAt: number
  endedAt: number
  status: CompeteAttemptStatus
  plannedQuestions: number
  summary: SessionSummary
}
