import { lazy, Suspense } from 'react'
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { DashboardLayout } from './components/layout/DashboardLayout'
import { ProtectedRoute } from './components/ProtectedRoute'
import { useAuth } from './hooks/useAuth'

const Login = lazy(() => import('./pages/Login').then((module) => ({ default: module.Login })))
const Dashboard = lazy(() =>
  import('./pages/Dashboard').then((module) => ({ default: module.Dashboard })),
)
const Records = lazy(() => import('./pages/Records').then((module) => ({ default: module.Records })))
const Members = lazy(() => import('./pages/Members').then((module) => ({ default: module.Members })))
const Invites = lazy(() => import('./pages/Invites').then((module) => ({ default: module.Invites })))
const Notifications = lazy(() =>
  import('./pages/Notifications').then((module) => ({ default: module.Notifications })),
)
const Home = lazy(() => import('./pages/Home').then((module) => ({ default: module.Home })))
const Register = lazy(() =>
  import('./pages/Register').then((module) => ({ default: module.Register })),
)

function AuthLoadingScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4 text-sm font-medium text-slate-600 shadow-sm">
        Restoring session...
      </div>
    </div>
  )
}

function PublicOnlyRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isAuthLoading } = useAuth()

  if (isAuthLoading) {
    return <AuthLoadingScreen />
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  return <>{children}</>
}

function RouteFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4 text-sm font-medium text-slate-600 shadow-sm">
        Loading page...
      </div>
    </div>
  )
}

function AnimatedRoutes() {
  const location = useLocation()
  const { isAuthLoading } = useAuth()

  if (isAuthLoading) {
    return <AuthLoadingScreen />
  }

  return (
    <Suspense fallback={<RouteFallback />}>
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Home />} />
          <Route
            path="/login"
            element={
              <PublicOnlyRoute>
                <Login />
              </PublicOnlyRoute>
            }
          />
          <Route
            path="/register"
            element={
              <PublicOnlyRoute>
                <Register />
              </PublicOnlyRoute>
            }
          />
          <Route element={<ProtectedRoute />}>
            <Route element={<DashboardLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="records" element={<Records />} />
              <Route path="members" element={<Members />} />
              <Route path="invites" element={<Invites />} />
              <Route path="notifications" element={<Notifications />} />
            </Route>
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AnimatePresence>
    </Suspense>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AnimatedRoutes />
    </BrowserRouter>
  )
}

export default App
