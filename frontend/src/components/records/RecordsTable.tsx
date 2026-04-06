import { motion } from 'framer-motion'
import { Pencil, Trash2 } from 'lucide-react'
import type { RecordItem } from '../../services/recordsService'
import { formatCurrency } from '../../utils/formatCurrency'
import { formatDate } from '../../utils/formatDate'
import { staggerContainerVariants, staggerItemVariants } from '../../animations/pageTransitions'

type RecordsTableProps = {
  records: RecordItem[]
  onEdit: (record: RecordItem) => void
  onDelete: (record: RecordItem) => void
}

export function RecordsTable({ records, onEdit, onDelete }: RecordsTableProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="glass-panel overflow-hidden p-0"
    >
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-left">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Date</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Type</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Amount</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Category</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Description</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Actions</th>
            </tr>
          </thead>
          <motion.tbody
            variants={staggerContainerVariants}
            initial="initial"
            animate="animate"
            className="divide-y divide-slate-100 bg-white"
          >
            {records.map((record) => (
              <motion.tr
                key={record.id}
                variants={staggerItemVariants}
                className="transition hover:bg-slate-50/80"
              >
                <td className="px-4 py-3 text-sm text-slate-700">{formatDate(record.transaction_date)}</td>
                <td className="px-4 py-3 text-sm capitalize text-slate-600">{record.transaction_type}</td>
                <td className="px-4 py-3 text-sm font-semibold text-slate-900">
                  {record.transaction_type === 'expense'
                    ? formatCurrency(Number(record.amount), { negative: true })
                    : formatCurrency(Number(record.amount))}
                </td>
                <td className="px-4 py-3 text-sm text-slate-600">
                  {record.category_name ?? 'Uncategorized'}
                </td>
                <td className="max-w-[280px] px-4 py-3 text-sm text-slate-600">
                  <span className="line-clamp-2">{record.description ?? '—'}</span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onEdit(record)}
                      className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                      <Pencil className="size-3.5" />
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(record)}
                      className="inline-flex items-center gap-1 rounded-lg border border-rose-100 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700 transition hover:bg-rose-100"
                    >
                      <Trash2 className="size-3.5" />
                      Delete
                    </button>
                  </div>
                </td>
              </motion.tr>
            ))}
          </motion.tbody>
        </table>
      </div>
    </motion.section>
  )
}
