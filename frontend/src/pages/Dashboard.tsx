import { motion } from 'framer-motion'
import { Building2, LayoutDashboard } from 'lucide-react'
import { useState } from 'react'
import { SummaryCards } from '../components/dashboard/SummaryCards'
import { CashflowChart } from '../components/dashboard/CashflowChart'
import { CategoryChart } from '../components/dashboard/CategoryChart'
import { WeeklyTrendChart } from '../components/dashboard/WeeklyTrendChart'
import { RecentTransactions } from '../components/dashboard/RecentTransactions'
import {
  useCashflow,
  useRecentTransactions,
  useSummary,
  useTopExpenses,
  useWeeklyTrends,
} from '../hooks/useDashboard'
import { useOrganizationContext } from '../context/OrganizationContext'
import { DashboardSkeleton } from '../components/dashboard/DashboardSkeleton'
import { EmptyState } from '../components/ui/EmptyState'
import { CreateOrganizationModal } from '../components/organizations/CreateOrganizationModal'
import { pageVariants } from '../animations/pageTransitions'

export function Dashboard() {
  const [showCreateOrgModal, setShowCreateOrgModal] = useState(false)
  const { organizations, activeOrganization, isLoadingOrganizations, refreshOrganizations } =
    useOrganizationContext()
  const orgId = activeOrganization?.id ?? null
  const summaryQuery = useSummary(orgId)
  const cashflowQuery = useCashflow(orgId)
  const topExpensesQuery = useTopExpenses(orgId)
  const weeklyTrendsQuery = useWeeklyTrends(orgId)
  const recentTransactionsQuery = useRecentTransactions(orgId)

  const isLoading =
    isLoadingOrganizations ||
    summaryQuery.isLoading ||
    cashflowQuery.isLoading ||
    topExpensesQuery.isLoading ||
    weeklyTrendsQuery.isLoading ||
    recentTransactionsQuery.isLoading

  const hasError =
    summaryQuery.isError ||
    cashflowQuery.isError ||
    topExpensesQuery.isError ||
    weeklyTrendsQuery.isError ||
    recentTransactionsQuery.isError

  if (isLoadingOrganizations) {
    return <DashboardSkeleton />
  }

  if (organizations.length === 0) {
    return (
      <>
        <EmptyState
          icon={<Building2 className="size-10" />}
          title="You are not part of any organization yet."
          description="Create an organization to start viewing analytics and managing financial data."
          actionLabel="Create Organization"
          onAction={() => setShowCreateOrgModal(true)}
        />
        {showCreateOrgModal && (
          <CreateOrganizationModal
            onClose={() => setShowCreateOrgModal(false)}
            onSuccess={async () => {
              await refreshOrganizations()
            }}
          />
        )}
      </>
    )
  }

  if (!activeOrganization) {
    return (
      <EmptyState
        icon={<LayoutDashboard className="size-10" />}
        title="Select an organization to view analytics"
        description="Use the organization dropdown in the top bar to switch between available workspaces."
      />
    )
  }

  if (isLoading) {
    return <DashboardSkeleton />
  }

  if (hasError) {
    return (
      <EmptyState
        title="Dashboard analytics unavailable"
        description="We could not load one or more dashboard widgets. Please retry after confirming the backend is running and the organization id is valid."
      />
    )
  }

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="space-y-6"
    >
      <motion.section
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="glass-panel p-5 sm:p-6"
      >
        <p className="text-sm font-medium uppercase tracking-[0.18em] text-ocean-700">
          Organization Analytics
        </p>
        <h1 className="mt-2 font-['Space_Grotesk'] text-3xl font-semibold text-slate-900">
          Live finance dashboard
        </h1>
        <p className="mt-2 max-w-3xl text-sm text-slate-600 sm:text-base">
          Real-time summary metrics, trend visualizations, and recent transaction activity powered by the backend dashboard APIs.
        </p>
      </motion.section>

      <SummaryCards summary={summaryQuery.data!} />

      <div className="grid gap-5 xl:grid-cols-2">
        <CashflowChart data={cashflowQuery.data ?? []} />
        <CategoryChart data={topExpensesQuery.data ?? []} />
      </div>

      <WeeklyTrendChart data={weeklyTrendsQuery.data ?? []} />

      <RecentTransactions data={recentTransactionsQuery.data ?? []} />
    </motion.div>
  )
}
