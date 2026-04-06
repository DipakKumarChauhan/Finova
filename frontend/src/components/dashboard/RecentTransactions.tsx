import { motion } from 'framer-motion'
import type { RecentTransaction } from '../../services/dashboard/types'
import { formatCurrency } from '../../utils/formatCurrency'
import { formatDate } from '../../utils/formatDate'
import { staggerContainerVariants, staggerItemVariants } from '../../animations/pageTransitions'

type RecentTransactionsProps = {
  data: RecentTransaction[]
}

export function RecentTransactions({ data }: RecentTransactionsProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.15 }}
      className="glass-panel p-5"
    >
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h3 className="font-['Space_Grotesk'] text-lg font-semibold text-slate-900">
            Recent Transactions
          </h3>
          <p className="text-sm text-slate-500">Latest financial activity in your organization.</p>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-left">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Amount
                </th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Type
                </th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Date
                </th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Description
                </th>
              </tr>
            </thead>
            <motion.tbody
              variants={staggerContainerVariants}
              initial="initial"
              animate="animate"
              className="divide-y divide-slate-100"
            >
              {data.map((transaction) => (
                <motion.tr
                  key={transaction.id}
                  variants={staggerItemVariants}
                  className="transition hover:bg-slate-50/80"
                >
                  <td className="px-4 py-3 text-sm font-semibold text-slate-900">
                    {transaction.transaction_type === 'expense'
                      ? formatCurrency(transaction.amount, { negative: true })
                      : formatCurrency(transaction.amount)}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600 capitalize">
                    {transaction.transaction_type}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600">
                    {formatDate(transaction.transaction_date)}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600">
                    {transaction.description ?? 'No description'}
                  </td>
                </motion.tr>
              ))}
            </motion.tbody>
          </table>
        </div>
      </div>
    </motion.section>
  )
}
