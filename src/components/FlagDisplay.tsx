import { motion } from 'framer-motion'
import type { Country } from '../types/country'
import { flagSvgPath } from '../engine/flagAsset'

interface FlagDisplayProps {
  country: Country
  compact?: boolean
}

/** ~40% of viewport height per spec. Flags come from public/flags/4x3 (see
 *  scripts/copy-flags.mjs) as plain static assets.
 *
 *  The rounded corners + shadow live on a wrapper with an explicit
 *  `aspect-[4/3]`, not on the <img> itself. With the ratio fixed at the
 *  container level, the browser only ever has one degree of freedom to
 *  solve for (whichever of width/height the viewport constrains first) and
 *  derives the other correctly - on a narrow phone viewport, letting the
 *  <img>'s own h-full/w-auto/max-w-full fight it out was the bug: height and
 *  width could get capped independently, leaving the rounded "card" shape
 *  slightly the wrong proportions even though object-contain kept the flag
 *  picture itself undistorted. object-contain stays as a defensive fallback
 *  for the rare non-4:3 source (Nepal, Switzerland, Vatican City), which
 *  would otherwise letterbox inside a now-guaranteed-correct 4:3 box. */
export default function FlagDisplay({ country, compact = false }: FlagDisplayProps) {
  const src = flagSvgPath(country.iso2)

  return (
    <div className="flex w-full items-center justify-center">
      <div
        className={`aspect-[4/3] max-w-full overflow-hidden rounded-lg shadow-lg ${
          compact ? 'h-[18dvh] max-h-36 min-h-24' : 'h-[30vh] max-h-72 min-h-40'
        }`}
      >
        <motion.img
          key={country.iso2}
          src={src}
          alt={`Flag of ${country.name}`}
          className="h-full w-full object-contain"
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
        />
      </div>
    </div>
  )
}
