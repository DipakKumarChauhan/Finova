import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

type CashflowPoint = {
  month: string
  income: number
  expense: number
}

type ExpensePoint = {
  category: string
  amount: number
}

type WeeklyPoint = {
  week: string
  total: number
}

const fullCashflowData: CashflowPoint[] = [
  { month: 'Jan', income: 12000, expense: 7400 },
  { month: 'Feb', income: 14100, expense: 8300 },
  { month: 'Mar', income: 13800, expense: 7900 },
  { month: 'Apr', income: 16000, expense: 9100 },
  { month: 'May', income: 17200, expense: 9800 },
  { month: 'Jun', income: 18500, expense: 10200 },
]

const fullExpenseData: ExpensePoint[] = [
  { category: 'Ops', amount: 6200 },
  { category: 'SaaS', amount: 4600 },
  { category: 'Payroll', amount: 9800 },
  { category: 'Travel', amount: 2800 },
  { category: 'Marketing', amount: 5400 },
]

const fullWeeklyData: WeeklyPoint[] = [
  { week: 'W1', total: 1500 },
  { week: 'W2', total: 2200 },
  { week: 'W3', total: 1800 },
  { week: 'W4', total: 2600 },
  { week: 'W5', total: 2300 },
  { week: 'W6', total: 2900 },
]

function useStreaming<T>(source: T[], speedMs: number) {
  const [visible, setVisible] = useState<T[]>([])

  useEffect(() => {
    setVisible(source.slice(0, 1))
    let index = 1

    const timer = setInterval(() => {
      setVisible((prev) => {
        if (index >= source.length) {
          clearInterval(timer)
          return prev
        }

        index += 1
        return source.slice(0, index)
      })
    }, speedMs)

    return () => clearInterval(timer)
  }, [source, speedMs])

  return visible
}

export function DemoCharts() {
  const cashflowSeed = useMemo(() => fullCashflowData, [])
  const expenseSeed = useMemo(() => fullExpenseData, [])
  const weeklySeed = useMemo(() => fullWeeklyData, [])

  const cashflowData = useStreaming(cashflowSeed, 220)
  const expenseData = useStreaming(expenseSeed, 260)
  const weeklyData = useStreaming(weeklySeed, 200)

  return (
    <section className="space-y-6">
      <motion.h2
        initial={{ opacity: 0, y: 14 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.3 }}
        className="font-['Space_Grotesk'] text-2xl font-semibold text-slate-900"
      >
        Live Dashboard Preview
      </motion.h2>

      <div className="grid gap-5 xl:grid-cols-2">
        <motion.article
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.35 }}
          className="glass-panel p-5"
        >
          <p className="text-sm text-slate-500">Cashflow trend</p>
          <div className="mt-3 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={cashflowData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip />
                <Line dataKey="income" stroke="#059669" strokeWidth={3} dot={false} />
                <Line dataKey="expense" stroke="#e11d48" strokeWidth={3} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.article>

        <motion.article
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.35, delay: 0.05 }}
          className="glass-panel p-5"
        >
          <p className="text-sm text-slate-500">Expense categories</p>
          <div className="mt-3 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={expenseData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="category" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip />
                <Bar dataKey="amount" fill="#0a8fbf" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.article>
      </div>

      <motion.article
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.35, delay: 0.08 }}
        className="glass-panel p-5"
      >
        <p className="text-sm text-slate-500">Weekly spending</p>
        <div className="mt-3 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={weeklyData}>
              <defs>
                <linearGradient id="demoWeekly" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0a8fbf" stopOpacity={0.45} />
                  <stop offset="95%" stopColor="#0a8fbf" stopOpacity={0.03} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="week" axisLine={false} tickLine={false} />
              <YAxis axisLine={false} tickLine={false} />
              <Tooltip />
              <Area type="monotone" dataKey="total" stroke="#0a8fbf" fill="url(#demoWeekly)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.article>
    </section>
  )
}
