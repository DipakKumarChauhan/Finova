import { useQuery } from '@tanstack/react-query'
import { BellRing } from 'lucide-react'
import { motion } from 'framer-motion'
import { EmptyState } from '../components/ui/EmptyState'
import { NotificationsSkeleton } from '../components/notifications/NotificationsSkeleton'
import { pageVariants, staggerContainerVariants, staggerItemVariants } from '../animations/pageTransitions'
import { getNotifications } from '../services/notificationsService'
import { formatDateTime } from '../utils/formatDate'

export function Notifications() {
  const notificationsQuery = useQuery({
    queryKey: ['notifications'],
    queryFn: getNotifications,
    staleTime: 15_000,
  })

  const notifications = notificationsQuery.data ?? []

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="space-y-6"
    >
      <motion.section
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="glass-panel p-5 sm:p-6"
      >
        <p className="text-sm font-medium uppercase tracking-[0.18em] text-ocean-700">
          Notifications
        </p>
        <h1 className="mt-2 font-['Space_Grotesk'] text-3xl font-semibold text-slate-900">
          Activity feed
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-600 sm:text-base">
          Track invite and collaboration updates from the backend notification stream.
        </p>
      </motion.section>

      {notificationsQuery.isLoading ? <NotificationsSkeleton /> : null}

      {notificationsQuery.isError ? (
        <div className="glass-panel p-6 text-sm text-rose-700">
          We could not load notifications right now.
        </div>
      ) : null}

      {!notificationsQuery.isLoading && notifications.length === 0 ? (
        <EmptyState
          title="No notifications yet"
          description="New alerts and invite activity will appear here."
          icon={<BellRing className="size-10" />}
        />
      ) : null}

      <motion.div
        variants={staggerContainerVariants}
        initial="initial"
        animate="animate"
        className="grid gap-4"
      >
        {notifications.map((notification) => (
          <motion.div
            key={notification.id}
            variants={staggerItemVariants}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div className="flex items-start gap-3">
              <div className="rounded-full bg-ocean-50 p-2 text-ocean-700">
                <BellRing className="size-4" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-900">{notification.message}</p>
                <p className="mt-1 text-xs text-slate-500">{formatDateTime(notification.created_at)}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  )
}
