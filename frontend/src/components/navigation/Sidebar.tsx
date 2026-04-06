import { LayoutDashboard, Bell, Users, Wallet, Building2, Mail } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { motion } from 'framer-motion'

const navItems = [
  { to: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { to: '/records', label: 'Records', icon: Wallet },
  { to: '/members', label: 'Members', icon: Users },
  { to: '/invites', label: 'Invites', icon: Mail },
  { to: '/notifications', label: 'Alerts', icon: Bell },
]

export function Sidebar() {
  return (
    <motion.aside
      initial={{ x: -36, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="glass-panel sticky top-4 hidden h-[calc(100vh-2rem)] w-64 shrink-0 flex-col p-4 lg:flex"
    >
      <div className="mb-8 flex items-center gap-3 border-b border-slate-100 pb-4">
        <div className="rounded-xl bg-ocean-600/95 p-2 text-white shadow-soft">
          <Building2 className="size-5" />
        </div>
        <div>
          <p className="font-['Space_Grotesk'] text-lg font-semibold text-slate-900">
            Finova
          </p>
          <p className="text-xs text-slate-500">Analytics Suite</p>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-2">
        {navItems.map((item, index) => {
          const Icon = item.icon

          return (
            <motion.div
              key={item.to}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05, duration: 0.25 }}
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.98 }}
            >
              <NavLink
                to={item.to}
                className={({ isActive }) =>
                  `group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-ocean-600 to-ocean-500 text-white shadow-soft ring-1 ring-ocean-300/20'
                      : 'text-slate-700 hover:bg-slate-100/80 hover:text-slate-900'
                  }`
                }
              >
                <span className="absolute inset-y-2 left-1 w-1 rounded-full bg-white/0 transition-all group-hover:bg-ocean-300/60" />
                <Icon className="size-4" />
                <span>{item.label}</span>
              </NavLink>
            </motion.div>
          )
        })}
      </nav>

      <div className="rounded-xl bg-slate-50 p-3 text-xs text-slate-500">
        Team plan: <span className="font-semibold text-slate-700">Pro</span>
      </div>
    </motion.aside>
  )
}
