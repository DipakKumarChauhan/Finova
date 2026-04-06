import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-dashboard-glow px-4">
      <div className="glass-panel w-full max-w-md p-6 text-center">
        <p className="text-sm font-semibold uppercase tracking-wide text-ocean-700">404</p>
        <h1 className="mt-2 font-['Space_Grotesk'] text-2xl font-semibold text-slate-900">
          Page not found
        </h1>
        <Link
          to="/dashboard"
          className="mt-5 inline-flex rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
        >
          Back to dashboard
        </Link>
      </div>
    </div>
  )
}
