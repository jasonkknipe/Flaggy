/**
 * A single playable country/territory entry.
 *
 * Populated by scripts/generate-data.mjs from mledoze/countries (ODbL
 * license — credit it if you redistribute the data file) into
 * src/data/countries.json. src/data/countries.sample.json is a small,
 * hand-verified subset of 10 countries for local development before you've
 * run the generator (or if you just want to build UI against something real
 * without waiting on it).
 */
export interface Country {
  /** ISO 3166-1 alpha-2 code, lowercase — matches flag-icons' file naming (e.g. "au" -> au.svg). */
  iso2: string

  /** Canonical display + answer name. Common English name, accents normalized
   *  to plain keyboard letters, single form only — there's no alias list, so
   *  "USA" is never a second valid entry alongside "United States". */
  name: string

  /** Root international calling code, e.g. "+61". Deliberately not
   *  disambiguated further than that — every NANP country shares "+1", and
   *  per your call that's fine, not an error to fix. */
  callingCode: string

  /** One or more official capitals. A handful of countries have more than one
   *  (South Africa has three, Bolivia has two) — any of them counts as a
   *  correct guess. Same accent-normalization as `name`. */
  capitals: string[]

  /** Currency name, e.g. "Euro". Not used for scoring, info-card display only. */
  currency: string

  /** Official language names in English, e.g. ["French", "English"]. */
  languages: string[]

  /** Continent grouping — Africa, Americas, Asia, Europe, or Oceania. This is
   *  mledoze's own five-way `region` field, which happens to match the
   *  grouping you used for "Region-specific practice" in your future
   *  enhancements list (Americas kept as one, not split North/South). */
  continent: string

  /** Population, most recent estimate available when the data was generated.
   *  Approximate by nature — for the info card only, never for scoring. */
  population: number
}
