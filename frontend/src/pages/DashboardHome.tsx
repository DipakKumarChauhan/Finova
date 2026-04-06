import { motion } from 'framer-motion'
import { pageVariants } from '../animations/pageTransitions'
import { SummaryCards } from '../components/dashboard/SummaryCards'
import { CashflowTrendChart } from '../components/dashboard/CashflowTrendChart'
import { TopExpenseCategoriesChart } from '../components/dashboard/TopExpenseCategoriesChart'
import { WeeklySpendingAreaChart } from '../components/dashboard/WeeklySpendingAreaChart'
import { useDashboardAnalytics } from '../hooks/useDashboardAnalytics'

export function DashboardHome() {
  const { data, isLoading, isError } = useDashboardAnalytics()

  if (isLoading) {
    return (
      <motion.section
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        className="space-y-5"
      >
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, idx) => (
            <div key={idx} className="glass-panel h-28 animate-pulse bg-slate-100" />
          ))}
        </div>
        <div className="glass-panel h-80 animate-pulse bg-slate-100" />
        <div className="glass-panel h-80 animate-pulse bg-slate-100" />
      </motion.section>
    )
  }

  if (isError || !data) {
    return (
      <motion.section
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        className="glass-panel p-6"
      >
        <h2 className="font-['Space_Grotesk'] text-xl font-semibold text-slate-900">
          Dashboard temporarily unavailable
        </h2>
        <p className="mt-2 text-sm text-slate-500">
          Please verify API connectivity and organization selection.
        </p>
      </motion.section>
    )
  }

  return (
    <motion.section
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="space-y-5"
    >
      <div>
        <h1 className="font-['Space_Grotesk'] text-2xl font-semibold text-slate-900 sm:text-3xl">
          Financial Command Center
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Snapshot view of your organization-wide money flow.
        </p>
      </div>

      <SummaryCards summary={data.summary} />

      <div className="grid gap-4 xl:grid-cols-2">
        <CashflowTrendChart data={data.cashflow} />
        <TopExpenseCategoriesChart data={data.topExpenses} />
      </div>

      <WeeklySpendingAreaChart data={data.weeklySpending} />
    </motion.section>
  )
}
