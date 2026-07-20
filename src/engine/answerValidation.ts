import type { Country } from '../types/country'
import type { GuessField } from '../types/quiz'
import { answersMatch, normalizeAnswer } from './textNormalize'

export function validateGuess(field: GuessField, guess: string, country: Country): boolean {
  switch (field) {
    case 'country':
      return answersMatch(guess, country.name)
    case 'capital':
      // Any official capital counts - South Africa's three, Bolivia's two,
      // etc. - same "shared answer is fine" logic as calling codes.
      return country.capitals.some((capital) => answersMatch(guess, capital))
    case 'callingCode':
      return normalizeCallingCode(guess) === normalizeCallingCode(country.callingCode)
  }
}

/** Tolerates "+61", "61", " +61 " as equivalent - only the digits matter. */
function normalizeCallingCode(input: string): string {
  return input.replace(/\D/g, '')
}

/** Powers the autocomplete lists for both the country and capital text boxes.
 *  Uses the same normalization as validation, so anything selectable from the
 *  list is guaranteed to also validate correctly if typed out in full. */
export function filterSuggestions(query: string, options: string[], limit = 8): string[] {
  const normalizedQuery = normalizeAnswer(query)
  if (!normalizedQuery) return []
  return options.filter((option) => normalizeAnswer(option).includes(normalizedQuery)).slice(0, limit)
}
