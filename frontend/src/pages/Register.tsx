import { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Navbar } from '../components/layout/Navbar'
import { register } from '../services/authService'

export function Register() {
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    setLoading(true)

    try {
      await register(name, email, password)
      navigate('/login', { replace: true })
    } catch {
      setError('Registration failed. Please try a different email.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-dashboard-glow">
      <Navbar />

      <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 pb-10 pt-24">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_10%_15%,rgba(10,143,191,0.2),transparent_45%),radial-gradient(circle_at_90%_5%,rgba(4,89,119,0.2),transparent_45%)]" />

        <motion.div
          initial={{ opacity: 0, y: 22, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="glass-panel relative z-10 w-full max-w-md p-6 sm:p-8"
        >
          <div className="mb-6 text-center">
            <h1 className="font-['Space_Grotesk'] text-3xl font-semibold text-slate-900">
              Create account
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Start managing your financial analytics workspace.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-slate-700">
                Name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none transition focus:border-ocean-500 focus:ring-4 focus:ring-ocean-100"
                placeholder="John Doe"
              />
            </div>

            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-slate-700">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none transition focus:border-ocean-500 focus:ring-4 focus:ring-ocean-100"
                placeholder="you@company.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-slate-700">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none transition focus:border-ocean-500 focus:ring-4 focus:ring-ocean-100"
                placeholder="Create a strong password"
              />
            </div>

            {error ? (
              <p className="rounded-lg border border-rose-100 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                {error}
              </p>
            ) : null}

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-ocean-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-ocean-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? 'Creating account...' : 'Register'}
            </motion.button>
          </form>
        </motion.div>
      </div>
    </div>
  )
}
