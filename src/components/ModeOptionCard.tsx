import { motion } from 'framer-motion'

interface ModeOptionCardProps {
  title: string
  description: string
  onClick: () => void
}

export default function ModeOptionCard({ title, description, onClick }: ModeOptionCardProps) {
  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.12 }}
      onClick={onClick}
      className="min-h-12 w-full rounded-3xl border border-border bg-surface-card p-4 text-left shadow-sm transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
    >
      <div className="font-sans text-base font-semibold text-ink">{title}</div>
      <div className="mt-0.5 font-sans text-sm text-ink-muted">{description}</div>
    </motion.button>
  )
}
