import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import type { Country } from '../types/country'
import { flagSvgPath } from '../engine/flagAsset'
import GlassBar from '../components/GlassBar'
import PillButton from '../components/PillButton'

interface CountryBrowserScreenProps {
  countries: Country[]
  onBack: () => void
}

const CONTINENTS = ['All', 'Africa', 'Americas', 'Asia', 'Europe', 'Oceania'] as const

export default function CountryBrowserScreen({ countries, onBack }: CountryBrowserScreenProps) {
  const [search, setSearch] = useState('')
  const [continent, setContinent] = useState<string>('All')

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase()
    return countries
      .filter((c) => {
        if (continent !== 'All' && c.continent !== continent) return false
        if (!query) return true
        return (
          c.name.toLowerCase().includes(query) ||
          c.capitals.some((cap) => cap.toLowerCase().includes(query))
        )
      })
      .sort((a, b) => a.name.localeCompare(b.name))
  }, [countries, search, continent])

  return (
    <div className="flex min-h-dvh flex-col bg-surface-app">
      <GlassBar>
        <div className="mx-auto flex max-w-2xl flex-col gap-3 px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="font-sans text-xl font-bold text-ink">Countries</h1>
            <span className="font-sans text-sm tabular-nums text-ink-muted">
              {filtered.length} of {countries.length}
            </span>
          </div>
          <input
            type="text"
            placeholder="Search by name or capital…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-border bg-surface-card px-4 py-2.5 font-sans text-sm text-ink placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-brand/30"
          />
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            {CONTINENTS.map((c) => (
              <button
                key={c}
                onClick={() => setContinent(c)}
                className={`shrink-0 rounded-full px-3.5 py-1 font-sans text-xs font-semibold transition-colors ${
                  continent === c
                    ? 'bg-brand text-white'
                    : 'border border-border bg-surface-card text-ink-muted'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      </GlassBar>

      <div className="mx-auto w-full max-w-2xl px-6 py-6">
        {filtered.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-border bg-surface-card/60 p-8 text-center font-sans text-sm text-ink-muted">
            No countries match your search.
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {filtered.map((country, i) => (
              <CountryCard key={country.iso2} country={country} index={i} />
            ))}
          </div>
        )}
      </div>

      <div className="sticky bottom-0 bg-surface-app/80 backdrop-blur-sm">
        <div className="mx-auto max-w-2xl px-6 py-4">
          <PillButton onClick={onBack} variant="ghost" className="w-full">
            Back
          </PillButton>
        </div>
      </div>
    </div>
  )
}

function CountryCard({ country, index }: { country: Country; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: Math.min(index * 0.015, 0.4) }}
      className="rounded-2xl border border-border bg-surface-card p-3 shadow-sm"
    >
      <div className="aspect-[4/3] overflow-hidden rounded-lg">
        <img
          src={flagSvgPath(country.iso2)}
          alt={`Flag of ${country.name}`}
          className="h-full w-full object-contain"
          loading="lazy"
        />
      </div>
      <div className="mt-2.5">
        <p className="font-sans text-sm font-semibold text-ink leading-tight line-clamp-1">{country.name}</p>
        <p className="mt-0.5 font-sans text-xs text-ink-muted leading-tight line-clamp-1">
          {country.capitals.join(', ')}
        </p>
      </div>
    </motion.div>
  )
}
