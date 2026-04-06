import { motion } from 'framer-motion'
import type { RecordFilters as RecordFiltersState } from '../../services/recordsService'

type RecordFiltersProps = {
  filters: RecordFiltersState
  onChange: (nextFilters: RecordFiltersState) => void
  onSearch: () => void
  onReset: () => void
}

export function RecordFilters({ filters, onChange, onSearch, onReset }: RecordFiltersProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="glass-panel p-5"
    >
      <div className="grid gap-4 lg:grid-cols-5">
        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
            Start date
          </label>
          <input
            type="date"
            value={filters.startDate ?? ''}
            onChange={(event) => onChange({ ...filters, startDate: event.target.value || undefined })}
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-ocean-500 focus:ring-4 focus:ring-ocean-100"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
            End date
          </label>
          <input
            type="date"
            value={filters.endDate ?? ''}
            onChange={(event) => onChange({ ...filters, endDate: event.target.value || undefined })}
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-ocean-500 focus:ring-4 focus:ring-ocean-100"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
            Category
          </label>
          <input
            type="text"
            value={filters.category ?? ''}
            onChange={(event) => onChange({ ...filters, category: event.target.value || undefined })}
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-ocean-500 focus:ring-4 focus:ring-ocean-100"
            placeholder="Category name"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
            Type
          </label>
          <select
            value={filters.transactionType ?? ''}
            onChange={(event) => onChange({ ...filters, transactionType: event.target.value || undefined })}
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-ocean-500 focus:ring-4 focus:ring-ocean-100"
          >
            <option value="">All types</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
        </div>

        <div className="flex items-end gap-2">
          <button
            type="button"
            onClick={onSearch}
            className="w-full rounded-xl bg-ocean-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-ocean-700"
          >
            Search
          </button>
          <button
            type="button"
            onClick={onReset}
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Reset
          </button>
        </div>
      </div>
    </motion.section>
  )
}
