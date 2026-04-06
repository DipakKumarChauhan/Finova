import { useEffect, useState } from 'react'
import { ArrowDownRight, ArrowUpRight, WalletCards } from 'lucide-react'
import { motion } from 'framer-motion'
import type { SummaryResponse } from '../../services/dashboard/types'
import { formatCurrency } from '../../utils/formatCurrency'
import { cardVariants, staggerContainerVariants } from '../../animations/pageTransitions'

type SummaryCardsProps = {
  summary: SummaryResponse
}

function AnimatedAmount({ value }: { value: number }) {
  const [displayValue, setDisplayValue] = useState(0)

  useEffect(() => {
    const start = performance.now()
    const duration = 700

    let animationFrame = 0

    const tick = (time: number) => {
      const progress = Math.min((time - start) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplayValue(Math.round(value * eased))

      if (progress < 1) {
        animationFrame = requestAnimationFrame(tick)
      }
    }

    animationFrame = requestAnimationFrame(tick)

    return () => cancelAnimationFrame(animationFrame)
  }, [value])

  return <>{formatCurrency(displayValue)}</>
}

export function SummaryCards({ summary }: SummaryCardsProps) {
  const cards = [
    {
      title: 'Total Income',
      value: summary.total_income,
      icon: ArrowUpRight,
      tone: 'text-emerald-600',
      bg: 'bg-emerald-50',
    },
    {
      title: 'Total Expenses',
      value: summary.total_expense,
      icon: ArrowDownRight,
      tone: 'text-rose-600',
      bg: 'bg-rose-50',
    },
    {
      title: 'Net Balance',
      value: summary.net_balance,
      icon: WalletCards,
      tone: 'text-ocean-700',
      bg: 'bg-cyan-50',
    },
  ]

  return (
    <motion.div
      variants={staggerContainerVariants}
      initial="initial"
      animate="animate"
      className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
    >
      {cards.map((card) => {
        const Icon = card.icon

        return (
          <motion.article
            key={card.title}
            variants={cardVariants}
            whileHover={{ y: -4, scale: 1.01 }}
            className="stat-card"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm text-slate-500">{card.title}</p>
                <p className="mt-2 font-['Space_Grotesk'] text-2xl font-semibold text-slate-900">
                  <AnimatedAmount value={card.value} />
                </p>
              </div>
              <div className={`rounded-xl p-2 ${card.bg}`}>
                <Icon className={`size-4 ${card.tone}`} />
              </div>
            </div>
          </motion.article>
        )
      })}
    </motion.div>
  )
}
