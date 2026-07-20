/** Abstract latitude/longitude graticule, very low opacity, purely
 *  decorative. Deliberately not a literal world-map illustration - that
 *  would mean embedding a large, detailed path (weight + attribution
 *  questions) for something meant to sit at ~5% opacity behind the logo. */
export default function WorldMapBackdrop() {
  return (
    <svg
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 h-full w-full text-brand opacity-[0.06]"
      viewBox="0 0 800 500"
      preserveAspectRatio="xMidYMid slice"
    >
      {Array.from({ length: 9 }).map((_, i) => (
        <line key={`lat-${i}`} x1={0} y1={i * 62.5} x2={800} y2={i * 62.5} stroke="currentColor" strokeWidth={1} />
      ))}
      {Array.from({ length: 13 }).map((_, i) => (
        <line key={`lng-${i}`} x1={i * 66.6} y1={0} x2={i * 66.6} y2={500} stroke="currentColor" strokeWidth={1} />
      ))}
      <circle cx={220} cy={180} r={70} fill="currentColor" opacity={0.5} />
      <circle cx={560} cy={310} r={95} fill="currentColor" opacity={0.5} />
      <circle cx={420} cy={120} r={50} fill="currentColor" opacity={0.5} />
    </svg>
  )
}
