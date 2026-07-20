import { motion, HTMLMotionProps } from 'framer-motion';
import type { ButtonHTMLAttributes, ReactNode } from 'react'

interface PillButtonProps extends HTMLMotionProps<"button"> {
  children: ReactNode
  variant?: 'primary' | 'secondary' | 'ghost'
}

const VARIANT_CLASSES: Record<NonNullable<PillButtonProps['variant']>, string> = {
  primary: 'bg-brand text-white shadow-lg shadow-brand/25',
  secondary: 'bg-surface-card text-ink border border-border shadow-sm',
  ghost: 'bg-transparent text-ink-muted hover:text-ink',
}

/** Every tap gets the same slight scale-down per the mobile-interactions
 *  requirement, and a large minimum hit target for touch-friendliness. */
export default function PillButton({ children, variant = 'primary', className = '', ...rest }: PillButtonProps) {
  return (
    <motion.button
      whileTap={{ scale: 0.96 }}
      transition={{ duration: 0.12 }}
      className={`min-h-11 rounded-full px-5 py-2.5 font-sans text-base font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:opacity-40 ${VARIANT_CLASSES[variant]} ${className}`}
      {...rest}
    >
      {children}
    </motion.button>
  )
}
