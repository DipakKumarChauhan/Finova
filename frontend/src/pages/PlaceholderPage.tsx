import { motion } from 'framer-motion'
import { pageVariants } from '../animations/pageTransitions'

type PlaceholderPageProps = {
  title: string
  description: string
}

export function PlaceholderPage({ title, description }: PlaceholderPageProps) {
  return (
    <motion.section
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="glass-panel p-6"
    >
      <h1 className="font-['Space_Grotesk'] text-2xl font-semibold text-slate-900">
        {title}
      </h1>
      <p className="mt-2 text-sm text-slate-500">{description}</p>
    </motion.section>
  )
}
