import { motion } from 'framer-motion'
import { Link, NavLink } from 'react-router-dom'

export function Navbar() {
  const navItemClass = ({ isActive }: { isActive: boolean }) =>
    `rounded-lg px-3 py-1.5 text-sm font-medium transition ${
      isActive ? 'bg-ocean-100 text-ocean-700' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
    }`

  return (
    <motion.header
      initial={{ y: -16, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="fixed inset-x-0 top-0 z-50 border-b border-white/50 bg-white/75 backdrop-blur-lg"
    >
      <nav className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="font-['Space_Grotesk'] text-xl font-semibold text-slate-900">
          FinanceDash
        </Link>

        <div className="flex items-center gap-1">
          <NavLink to="/" className={navItemClass} end>
            Home
          </NavLink>
          <NavLink to="/login" className={navItemClass}>
            Login
          </NavLink>
          <NavLink to="/register" className={navItemClass}>
            Register
          </NavLink>
        </div>
      </nav>
    </motion.header>
  )
}
