import { useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { ExpenseCategoryPoint } from '../../services/dashboard/types'
import { formatCurrency } from '../../utils/formatCurrency'

type CategoryChartProps = {
  data: ExpenseCategoryPoint[]
}

const BAR_COLORS = ['#0a8fbf', '#06749d', '#045977', '#0284c7', '#38bdf8']

export function CategoryChart({ data }: CategoryChartProps) {
  const chartData = useMemo(
    () =>
      data.map((item, index) => ({
        name: item.category_id ?? `Category ${index + 1}`,
        total_expense: item.total_expense,
      })),
    [data],
  )

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.05 }}
      className="glass-panel p-5"
    >
      <div className="mb-4">
        <h3 className="font-['Space_Grotesk'] text-lg font-semibold text-slate-900">
          Top Expense Categories
        </h3>
        <p className="text-sm text-slate-500">Spending concentration by category.</p>
      </div>

      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis
              dataKey="name"
              tick={{ fill: '#64748b', fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{ borderRadius: 12, borderColor: '#cbd5e1' }}
              formatter={(value) => [formatCurrency(Number(value ?? 0)), 'Expense']}
            />
            <Bar dataKey="total_expense" radius={[8, 8, 0, 0]} isAnimationActive animationDuration={500}>
              {chartData.map((entry, index) => (
                <Cell key={`${entry.name}-${index}`} fill={BAR_COLORS[index % BAR_COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </motion.section>
  )
}
