import { useMemo } from 'react'
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
import { formatCurrency } from '../../utils/formatCurrency'
import { formatDate } from '../../utils/formatDate'

type WeeklyTrendChartProps = {
  data: WeeklySpendingPoint[]
}

function formatWeek(week: string) {
  return formatDate(week, { month: 'short', day: 'numeric' })
}

export function WeeklyTrendChart({ data }: WeeklyTrendChartProps) {
  const chartData = useMemo(() => data, [data])
  const visibleData = useProgressiveChartData(chartData, 170, 1)

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.1 }}
      className="glass-panel p-5"
    >
      <div className="mb-4">
        <h3 className="font-['Space_Grotesk'] text-lg font-semibold text-slate-900">
          Weekly Spending Trend
        </h3>
        <p className="text-sm text-slate-500">Weekly spending behavior with progressive reveal.</p>
      </div>

      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={visibleData}>
            <defs>
              <linearGradient id="weeklyTrendFill" x1="0" y1="0" x2="0" y2="1">
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
              labelFormatter={(label) => formatWeek(String(label))}
              formatter={(value) => [formatCurrency(Number(value ?? 0)), 'Spent']}
            />
            <Area
              type="monotone"
              dataKey="total"
              stroke="#0a8fbf"
              fill="url(#weeklyTrendFill)"
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
