import { useEffect, useMemo, useState } from 'react'
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
import type { CashflowPoint } from '../../services/dashboard/types'
import { formatCurrency } from '../../utils/formatCurrency'
import { formatDate } from '../../utils/formatDate'

type CashflowChartProps = {
  data: CashflowPoint[]
}

function formatMonth(month: string) {
  const [year, value] = month.split('-')
  const date = new Date(Number(year), Number(value) - 1)
  return formatDate(date, { month: 'short' })
}

export function CashflowChart({ data }: CashflowChartProps) {
  const chartData = useMemo(() => data, [data])
  const [visibleData, setVisibleData] = useState<CashflowPoint[]>([])

  useEffect(() => {
    setVisibleData([])

    if (!chartData.length) {
      return
    }

    let index = 0
    const timer = window.setInterval(() => {
      index += 1
      setVisibleData(chartData.slice(0, index))

      if (index >= chartData.length) {
        window.clearInterval(timer)
      }
    }, 180)

    return () => window.clearInterval(timer)
  }, [chartData])

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="glass-panel p-5"
    >
      <div className="mb-4">
        <h3 className="font-['Space_Grotesk'] text-lg font-semibold text-slate-900">Cashflow Trend</h3>
        <p className="text-sm text-slate-500">Income and expense movement over time.</p>
      </div>

      <div className="h-72 w-full">
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
              formatter={(value) => [formatCurrency(Number(value ?? 0))]}
            />
            <Line
              type="monotone"
              dataKey="income"
              stroke="#059669"
              strokeWidth={3}
              dot={false}
              isAnimationActive
              animationDuration={350}
            />
            <Line
              type="monotone"
              dataKey="expense"
              stroke="#e11d48"
              strokeWidth={3}
              dot={false}
              isAnimationActive
              animationDuration={350}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </motion.section>
  )
}
