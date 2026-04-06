import { motion } from 'framer-motion'

type SkeletonProps = {
  className?: string
}

export function Skeleton({ className = '' }: SkeletonProps) {
  return (
    <motion.div
      aria-hidden="true"
      initial={{ opacity: 0.45 }}
      animate={{ opacity: [0.45, 0.9, 0.45] }}
      transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
      className={`animate-pulse rounded-xl bg-slate-200/80 ${className}`.trim()}
    />
  )
}