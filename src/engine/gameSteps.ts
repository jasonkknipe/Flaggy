import type { FieldPlan, GameMode, GuessField } from '../types/quiz'

export type GameStep =
  | { kind: 'ask'; field: GuessField }
  | { kind: 'reveal'; gradeFields: GuessField[]; showInfoCard: boolean }

/**
 * The ordered ask/reveal sequence for one question, given a mode and field
 * plan. This is the one place that encodes the actual behavioral difference
 * between the three modes:
 *
 * - Learning: one guess (country only - calling code/capital are never
 *   asked here), one combined reveal with the full info card.
 * - Guess: every asked field gets its own immediate reveal before the next
 *   field is asked - a "foothold" after each guess - then a final,
 *   info-only reveal for anything that wasn't guessed (capital/calling code
 *   if their toggle was off for this session).
 * - Compete: every field is asked back-to-back with NO reveal in between,
 *   then everything (every grading + the info card) is revealed together.
 *   That's the confirmed distinction from Guess Mode: committing "blind".
 */
export function buildGameSteps(mode: GameMode, fieldPlan: FieldPlan): GameStep[] {
  const askedFields: GuessField[] = [
    'country',
    ...(fieldPlan.callingCode ? (['callingCode'] as const) : []),
    ...(fieldPlan.capital ? (['capital'] as const) : []),
  ]

  if (mode === 'learning') {
    return [
      { kind: 'ask', field: 'country' },
      { kind: 'reveal', gradeFields: ['country'], showInfoCard: true },
    ]
  }

  if (mode === 'guess') {
    const steps: GameStep[] = []
    for (const field of askedFields) {
      steps.push({ kind: 'ask', field })
      steps.push({ kind: 'reveal', gradeFields: [field], showInfoCard: false })
    }
    steps.push({ kind: 'reveal', gradeFields: [], showInfoCard: true })
    return steps
  }

  // compete
  const steps: GameStep[] = askedFields.map((field) => ({ kind: 'ask', field }))
  steps.push({ kind: 'reveal', gradeFields: askedFields, showInfoCard: true })
  return steps
}
