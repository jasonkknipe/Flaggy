import type { GuessField } from './quiz'

export interface CountryAccuracy {
  /** Flag/country-recognition accuracy only, per your call - calling code and
   *  capital accuracy aren't tracked per-country in v1, only in aggregate
   *  (see LifetimeStats.correctByField). */
  correct: number
  attempts: number
}

export interface PersonalBest {
  flagsCorrect: number
  totalQuestions: number
  achievedAt: number
}

export interface LifetimeStats {
  gamesPlayed: number
  questionsAnswered: number
  correctByField: Partial<Record<GuessField, number>>
  askedByField: Partial<Record<GuessField, number>>
  /** Consecutive correct *country* guesses specifically - the one guess that
   *  happens in every mode, so it's the only fair constant to streak on. */
  currentStreak: number
  bestStreak: number
  /** Compete is always a fixed full run, so a single personal best is enough
   *  to compare against and show a delta on the results screen. */
  competeBest: PersonalBest | null
}

export interface StatsStore {
  lifetime: LifetimeStats
  /** Keyed by iso2. */
  byCountry: Record<string, CountryAccuracy>
}

export const EMPTY_STATS: StatsStore = {
  lifetime: {
    gamesPlayed: 0,
    questionsAnswered: 0,
    correctByField: {},
    askedByField: {},
    currentStreak: 0,
    bestStreak: 0,
    competeBest: null,
  },
  byCountry: {},
}
