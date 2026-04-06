import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { BarChart3, Download, ShieldCheck, WalletCards } from 'lucide-react'
import { Navbar } from '../components/layout/Navbar'
import { DemoCharts } from '../components/charts/DemoCharts'

const features = [
  {
    title: 'Financial record tracking',
    description: 'Capture and organize income and expenses with clean workflows.',
    icon: WalletCards,
  },
  {
    title: 'Role based access',
    description: 'Control visibility and actions with secure organization roles.',
    icon: ShieldCheck,
  },
  {
    title: 'Real time analytics',
    description: 'Visualize spending behavior and cashflow trends instantly.',
    icon: BarChart3,
  },
  {
    title: 'Data export',
    description: 'Export your records and reports in audit-friendly formats.',
    icon: Download,
  },
]

export function Home() {
  return (
    <div className="min-h-screen bg-dashboard-glow">
      <Navbar />

      <main className="mx-auto w-full max-w-6xl px-4 pb-16 pt-24 sm:px-6 lg:px-8">
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="glass-panel overflow-hidden p-8 sm:p-10"
        >
          <div className="max-w-3xl">
            <h1 className="font-['Space_Grotesk'] text-4xl font-semibold leading-tight text-slate-900 sm:text-5xl">
              Finance Dashboard Analytics
            </h1>
            <p className="mt-4 text-base text-slate-600 sm:text-lg">
              Track income and expenses, uncover financial insights, and make confident decisions
              with a modern analytics workspace.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                to="/login"
                className="rounded-xl bg-ocean-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-ocean-700"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Register
              </Link>
            </div>
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.35 }}
          className="mt-8 grid gap-4 sm:grid-cols-2"
        >
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <motion.article
                key={feature.title}
                whileHover={{ y: -4 }}
                transition={{ duration: 0.2 }}
                className="glass-panel p-5"
              >
                <div className="mb-3 inline-flex rounded-lg bg-ocean-100 p-2 text-ocean-700">
                  <Icon className="size-4" />
                </div>
                <h3 className="font-['Space_Grotesk'] text-lg font-semibold text-slate-900">
                  {feature.title}
                </h3>
                <p className="mt-1 text-sm text-slate-600">{feature.description}</p>
                <div className="mt-3 h-1.5 w-16 rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-ocean-500"
                    style={{ width: `${55 + index * 10}%` }}
                  />
                </div>
              </motion.article>
            )
          })}
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="mt-10"
        >
          <DemoCharts />
        </motion.section>
      </main>
    </div>
  )
}
