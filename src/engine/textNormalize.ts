/**
 * Normalizes free-text answers for comparison: case-insensitive,
 * accent-insensitive, whitespace-collapsed. Per your call, this is the ONLY
 * leniency in matching - there's no alias/synonym table. "United States" and
 * "united   states" match each other; "USA" does not match "United States"
 * unless "USA" is itself the stored canonical name for that country.
 */
export function normalizeAnswer(input: string): string {
  return input
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // strip combining diacritical marks (é -> e, etc.)
    .replace(/[^\p{L}\p{N}\s'-]/gu, '') // drop punctuation other than apostrophes/hyphens
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ')
}

export function answersMatch(a: string, b: string): boolean {
  return normalizeAnswer(a) === normalizeAnswer(b)
}
