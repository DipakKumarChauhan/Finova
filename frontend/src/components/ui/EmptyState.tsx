import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

type EmptyStateProps = {
  title: string
  description: string
  icon?: ReactNode
  actionLabel?: string
  onAction?: () => void
}

export function EmptyState({
  title,
  description,
  icon,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 18, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="glass-panel flex flex-col items-center justify-center p-8 text-center sm:p-10"
    >
      {icon ? <div className="rounded-2xl bg-ocean-50 p-3 text-ocean-700">{icon}</div> : null}
      <h2 className="mt-4 font-['Space_Grotesk'] text-2xl font-semibold text-slate-900">
        {title}
      </h2>
      <p className="mt-2 max-w-xl text-sm text-slate-600">{description}</p>
      {actionLabel && onAction ? (
        <button
          type="button"
          onClick={onAction}
          className="mt-6 rounded-xl bg-ocean-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-ocean-700"
        >
          {actionLabel}
        </button>
      ) : null}
    </motion.section>
  )
}