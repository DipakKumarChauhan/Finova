import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../hooks/useAuth'

export function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleDemoLogin = () => {
    login('demo-access-token', 'demo-refresh-token')
    navigate('/dashboard', { replace: true })
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-dashboard-glow px-4">
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="glass-panel w-full max-w-md p-7"
      >
        <h1 className="font-['Space_Grotesk'] text-3xl font-semibold text-slate-900">
          Welcome Back
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Auth shell is configured. Replace this with real form/API flow.
        </p>

        <button
          onClick={handleDemoLogin}
          className="mt-6 w-full rounded-xl bg-ocean-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-ocean-700"
        >
          Continue (Demo)
        </button>
      </motion.div>
    </div>
  )
}
