import { useEffect, useRef } from 'react'
import { animate, useMotionValue, useTransform } from 'framer-motion'

interface AnimatedCounterProps {
  value: number
  className?: string
}

/** Tweens toward `value` whenever it changes, writing straight to the DOM
 *  node rather than through React state so the animation doesn't cost a
 *  re-render per frame. tabular-nums (set globally in index.css) keeps
 *  digit width constant while it counts, so nothing around it jitters. */
export default function AnimatedCounter({ value, className = '' }: AnimatedCounterProps) {
  const motionValue = useMotionValue(value)
  const rounded = useTransform(motionValue, (latest) => Math.round(latest).toString())
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const controls = animate(motionValue, value, { duration: 0.5, ease: 'easeOut' })
    return () => controls.stop()
  }, [value, motionValue])

  useEffect(() => {
    return rounded.on('change', (latest) => {
      if (ref.current) ref.current.textContent = latest
    })
  }, [rounded])

  return (
    <span ref={ref} className={`tabular-nums ${className}`}>
      {value}
    </span>
  )
}
