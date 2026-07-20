import { useMemo } from 'react'
import type { Country } from '../types/country'
import countriesData from '../data/countries.json'

/**
 * Static import, not a runtime fetch: this is bundled at build time, which
 * is what makes "no external APIs during gameplay" and full offline support
 * possible. Until you've run `npm run generate-data`, countries.json is a
 * copy of the 10-country sample - see the README.
 */
export function useCountries() {
  const countries = countriesData as Country[]

  const byIso2 = useMemo(() => {
    const map = new Map<string, Country>()
    for (const country of countries) map.set(country.iso2, country)
    return map
  }, [countries])

  const allNames = useMemo(() => countries.map((c) => c.name), [countries])
  const allCapitals = useMemo(() => Array.from(new Set(countries.flatMap((c) => c.capitals))), [countries])
  const allIso2 = useMemo(() => countries.map((c) => c.iso2), [countries])

  return { countries, byIso2, allNames, allCapitals, allIso2 }
}
