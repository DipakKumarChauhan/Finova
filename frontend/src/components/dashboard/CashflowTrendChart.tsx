import { motion } from 'framer-motion'
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { useProgressiveChartData } from '../../hooks/useProgressiveChartData'
import type { CashflowPoint } from '../../services/dashboard/types'

type CashflowTrendChartProps = {
  data: CashflowPoint[]
}

function toCurrency(value: unknown) {
  const numeric = Number(value ?? 0)
  return `$${numeric.toLocaleString()}`
}

function formatMonth(month: string) {
  const [year, m] = month.split('-')
  const date = new Date(Number(year), Number(m) - 1)
  return date.toLocaleDateString('en-US', { month: 'short' })
}

export function CashflowTrendChart({ data }: CashflowTrendChartProps) {
  const visibleData = useProgressiveChartData(data, 200, 1)

  return (
    <motion.section
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="glass-panel p-5"
    >
      <h3 className="font-['Space_Grotesk'] text-lg font-semibold text-slate-900">
        Cashflow Trend
      </h3>
      <p className="mt-1 text-sm text-slate-500">
        Income vs expenses over time with progressive growth rendering.
      </p>

      <div className="mt-4 h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={visibleData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis
              dataKey="month"
              tickFormatter={formatMonth}
              tick={{ fill: '#64748b', fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{ borderRadius: 12, borderColor: '#cbd5e1' }}
              formatter={(value) => [toCurrency(value)]}
            />
            <Line
              type="monotone"
              dataKey="income"
              stroke="#059669"
              strokeWidth={3}
              dot={false}
              isAnimationActive
              animationDuration={500}
            />
            <Line
              type="monotone"
              dataKey="expense"
              stroke="#e11d48"
              strokeWidth={3}
              dot={false}
              isAnimationActive
              animationDuration={500}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </motion.section>
  )
}
