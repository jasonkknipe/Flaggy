import { useCallback } from 'react'
import { useLocalStorage } from './useLocalStorage'
import { EMPTY_STATS, type StatsStore } from '../types/stats'
import type { GameMode, GuessField, QuestionRecord, SessionSummary } from '../types/quiz'

const KEY = 'flag-trainer:stats'

export function useStats() {
  const [stats, setStats] = useLocalStorage<StatsStore>(KEY, EMPTY_STATS)

  /** Call once per answered question. Learning Mode sessions can run
   *  indefinitely, so stats are kept live rather than only written at the
   *  end of a session — the same reasoning as persisting SessionState after
   *  every answer, not just on exit. */
  const recordQuestion = useCallback(
    (record: QuestionRecord) => {
      setStats((prev) => {
        const next: StatsStore = structuredClone(prev)
        next.lifetime.questionsAnswered += 1

        for (const field of Object.keys(record.correct) as GuessField[]) {
          next.lifetime.askedByField[field] = (next.lifetime.askedByField[field] ?? 0) + 1
          if (record.correct[field]) {
            next.lifetime.correctByField[field] = (next.lifetime.correctByField[field] ?? 0) + 1
          }
        }

        // Streak is scoped to the country guess specifically — the one
        // guess that happens in every mode, so it's the only fair constant.
        const countryCorrect = record.correct.country ?? false
        if (countryCorrect) {
          next.lifetime.currentStreak += 1
          next.lifetime.bestStreak = Math.max(next.lifetime.bestStreak, next.lifetime.currentStreak)
        } else {
          next.lifetime.currentStreak = 0
        }

        // Flag accuracy only, per-country, per your call.
        const existing = next.byCountry[record.iso2] ?? { correct: 0, attempts: 0 }
        next.byCountry[record.iso2] = {
          correct: existing.correct + (countryCorrect ? 1 : 0),
          attempts: existing.attempts + 1,
        }

        return next
      })
    },
    [setStats],
  )

  /** Call once when a session ends (Exit, or reaching the end of a fixed-
   *  length run). Only touches gamesPlayed and the Compete personal best —
   *  per-question numbers are already live via recordQuestion. */
  const recordSessionEnd = useCallback(
    (mode: GameMode, summary: SessionSummary) => {
      setStats((prev) => {
        const next: StatsStore = structuredClone(prev)
        next.lifetime.gamesPlayed += 1

        if (mode === 'compete') {
          const flagsCorrect = summary.correctByField.country ?? 0
          const best = next.lifetime.competeBest
          if (!best || flagsCorrect > best.flagsCorrect) {
            next.lifetime.competeBest = {
              flagsCorrect,
              totalQuestions: summary.totalQuestions,
              achievedAt: Date.now(),
            }
          }
        }

        return next
      })
    },
    [setStats],
  )

  const resetStatistics = useCallback(() => {
    setStats((prev) => ({ ...EMPTY_STATS, byCountry: prev.byCountry }))
  }, [setStats])

  const resetLearningHistory = useCallback(() => {
    setStats((prev) => ({ ...prev, byCountry: {} }))
  }, [setStats])

  return { stats, recordQuestion, recordSessionEnd, resetStatistics, resetLearningHistory }
}
