import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Sidebar } from '../navigation/Sidebar'
import { Topbar } from '../navigation/Topbar'

export function DashboardLayout() {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-dashboard-glow px-3 py-4 sm:px-5 sm:py-5">
      <div className="mx-auto flex max-w-[1400px] gap-4">
        <Sidebar />

        <AnimatePresence>
          {mobileSidebarOpen ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-slate-950/30 lg:hidden"
              onClick={() => setMobileSidebarOpen(false)}
            >
              <motion.div
                initial={{ x: -260 }}
                animate={{ x: 0 }}
                exit={{ x: -260 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className="h-full w-64 p-4"
                onClick={(event) => event.stopPropagation()}
              >
                <Sidebar />
              </motion.div>
            </motion.div>
          ) : null}
        </AnimatePresence>

        <main className="w-full min-w-0">
          <Topbar onToggleSidebar={() => setMobileSidebarOpen((prev) => !prev)} />
          <div className="rounded-2xl border border-white/60 bg-white/70 p-3 shadow-soft sm:p-5">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
