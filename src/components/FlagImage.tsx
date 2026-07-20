import { useCallback, useRef, useState } from 'react'
import { flagSvgPath } from '../engine/flagAsset'

interface FlagImageProps {
  iso2: string
  name: string
  className?: string
}

export default function FlagImage({ iso2, name, className = '' }: FlagImageProps) {
  const [ratio, setRatio] = useState<number | null>(null)
  const fetched = useRef<Set<string>>(new Set())

  const load = useCallback(() => {
    if (fetched.current.has(iso2)) return
    fetched.current.add(iso2)
    const img = new Image()
    img.onload = () => {
      if (img.naturalWidth > 0 && img.naturalHeight > 0) {
        setRatio(img.naturalWidth / img.naturalHeight)
      }
    }
    img.src = flagSvgPath(iso2)
  }, [iso2])

  const style =
    ratio !== null
      ? { aspectRatio: `${ratio} / 1` }
      : { aspectRatio: '4 / 3' }

  return (
    <div
      className={`overflow-hidden ${className}`}
      style={style}
    >
      <img
        src={flagSvgPath(iso2)}
        alt={`Flag of ${name}`}
        className="h-full w-full object-contain"
        onLoad={load}
      />
    </div>
  )
}
