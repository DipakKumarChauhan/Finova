import { Bell, Menu, Search } from 'lucide-react'
import { motion } from 'framer-motion'
import { useAuth } from '../../hooks/useAuth'
import { OrganizationSelector } from '../layout/OrganizationSelector'

type TopbarProps = {
  onToggleSidebar?: () => void
}

export function Topbar({ onToggleSidebar }: TopbarProps) {
  const { logout } = useAuth()

  return (
    <motion.header
      initial={{ y: -12, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="glass-panel mb-5 flex items-center justify-between gap-3 p-3 sm:p-4"
    >
      <div className="flex items-center gap-2">
        <button
          onClick={onToggleSidebar}
          className="inline-flex rounded-lg p-2 text-slate-600 transition hover:bg-slate-100 lg:hidden"
          aria-label="Toggle navigation"
        >
          <Menu className="size-5" />
        </button>

        <div className="hidden items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 sm:flex">
          <Search className="size-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search transactions..."
            className="w-52 border-none bg-transparent text-sm text-slate-700 outline-none"
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-end gap-2">
        <OrganizationSelector />
        <button className="rounded-xl border border-slate-200 bg-white p-2.5 text-slate-600 transition hover:bg-slate-50">
          <Bell className="size-4" />
        </button>
        <button
          onClick={() => {
            void logout()
          }}
          className="rounded-xl bg-slate-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
        >
          Logout
        </button>
      </div>
    </motion.header>
  )
}
