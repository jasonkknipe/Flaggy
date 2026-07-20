import { motion } from 'framer-motion'
import type { Country } from '../types/country'
import FlagImage from './FlagImage'

interface FlagDisplayProps {
  country: Country
  compact?: boolean
}

/** ~40% of viewport height per spec. Flags come from public/flags/4x3 (see
 *  scripts/copy-flags.mjs) as plain static assets.
 *
 *  Each flag's SVG viewBox is read at render time to set the container's
 *  `aspect-ratio` dynamically, so non-4:3 flags (Nepal, Switzerland, etc.)
 *  display in their native proportions without letterboxing. */
export default function FlagDisplay({ country, compact = false }: FlagDisplayProps) {
  return (
    <div className="flex w-full items-center justify-center">
      <motion.div
        key={country.iso2}
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className={`max-w-full overflow-hidden rounded-lg shadow-lg ${
          compact ? 'h-[18dvh] max-h-36 min-h-24' : 'h-[30vh] max-h-72 min-h-40'
        }`}
      >
        <FlagImage iso2={country.iso2} name={country.name} />
      </motion.div>
    </div>
  )
}
