import type { ReactNode } from 'react'

export default function GlassBar({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`bg-surface-glass backdrop-blur-xl border-b border-border sticky top-0 z-10 ${className}`}
    >
      {children}
    </div>
  )
}
