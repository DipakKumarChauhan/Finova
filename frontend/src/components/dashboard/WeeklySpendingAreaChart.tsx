import { motion } from 'framer-motion'
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { useProgressiveChartData } from '../../hooks/useProgressiveChartData'
import type { WeeklySpendingPoint } from '../../services/dashboard/types'

type WeeklySpendingAreaChartProps = {
  data: WeeklySpendingPoint[]
}

function toCurrency(value: unknown) {
  const numeric = Number(value ?? 0)
  return `$${numeric.toLocaleString()}`
}

function formatWeek(week: string) {
  const date = new Date(week)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export function WeeklySpendingAreaChart({ data }: WeeklySpendingAreaChartProps) {
  const visibleData = useProgressiveChartData(data, 170, 1)

  return (
    <motion.section
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.1 }}
      className="glass-panel p-5"
    >
      <h3 className="font-['Space_Grotesk'] text-lg font-semibold text-slate-900">
        Weekly Spending Trend
      </h3>
      <p className="mt-1 text-sm text-slate-500">
        Weekly expense movement rendered with progressive area growth.
      </p>

      <div className="mt-4 h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={visibleData}>
            <defs>
              <linearGradient id="weeklyColor" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0a8fbf" stopOpacity={0.45} />
                <stop offset="95%" stopColor="#0a8fbf" stopOpacity={0.04} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis
              dataKey="week"
              tickFormatter={formatWeek}
              tick={{ fill: '#64748b', fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{ borderRadius: 12, borderColor: '#cbd5e1' }}
              labelFormatter={(label) => formatWeek(label)}
              formatter={(value) => [toCurrency(value), 'Spent']}
            />
            <Area
              type="monotone"
              dataKey="total"
              stroke="#0a8fbf"
              fill="url(#weeklyColor)"
              strokeWidth={3}
              isAnimationActive
              animationDuration={450}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.section>
  )
}
