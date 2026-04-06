import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Check, X } from 'lucide-react'
import { motion } from 'framer-motion'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { getInvites, respondToInvite, type InviteItem } from '../services/invitesService'
import { EmptyState } from '../components/ui/EmptyState'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { InvitesSkeleton } from '../components/invites/InvitesSkeleton'
import { pageVariants, staggerContainerVariants, staggerItemVariants } from '../animations/pageTransitions'

function formatDate(value: string) {
  return new Date(value).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function InviteCard({
  invite,
  onAction,
  isLoading,
}: {
  invite: InviteItem
  onAction: (action: 'accept' | 'reject') => void
  isLoading: boolean
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-900">{invite.email}</p>
          <p className="mt-1 text-sm text-slate-600">
            Role: <span className="font-medium capitalize text-slate-800">{invite.role}</span>
          </p>
          <p className="mt-1 text-xs text-slate-500">Created {formatDate(invite.created_at)}</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <span className="rounded-full bg-ocean-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-ocean-700">
            {invite.status}
          </span>
          <button
            type="button"
            disabled={isLoading}
            onClick={() => onAction('accept')}
            className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Check className="size-3.5" />
            Accept
          </button>
          <button
            type="button"
            disabled={isLoading}
            onClick={() => onAction('reject')}
            className="inline-flex items-center gap-1 rounded-lg border border-rose-100 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <X className="size-3.5" />
            Reject
          </button>
        </div>
      </div>
    </div>
  )
}

export function Invites() {
  const queryClient = useQueryClient()
  const [pendingRejectInvite, setPendingRejectInvite] = useState<InviteItem | null>(null)
  const invitesQuery = useQuery({
    queryKey: ['invites'],
    queryFn: getInvites,
    staleTime: 15_000,
  })

  const actionMutation = useMutation({
    mutationFn: ({ inviteId, action }: { inviteId: string; action: 'accept' | 'reject' }) =>
      respondToInvite(inviteId, action),
    onSuccess: async (_data, variables) => {
      toast.success(variables.action === 'accept' ? 'Invite accepted' : 'Invite rejected')
      await queryClient.invalidateQueries({ queryKey: ['invites'] })
      setPendingRejectInvite(null)
    },
    onError: () => toast.error('Could not process invite'),
  })

  const invites = invitesQuery.data ?? []

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
          Invitations
        </p>
        <h1 className="mt-2 font-['Space_Grotesk'] text-3xl font-semibold text-slate-900">
          Pending invites
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-600 sm:text-base">
          Accept or reject outstanding organization invitations.
        </p>
      </motion.section>

      {invitesQuery.isLoading ? <InvitesSkeleton /> : null}

      {invitesQuery.isError ? (
        <div className="glass-panel p-6 text-sm text-rose-700">
          We could not load your pending invites.
        </div>
      ) : null}

      {!invitesQuery.isLoading && invites.length === 0 ? (
        <EmptyState
          title="No pending invites"
          description="You will see incoming organization invitations here."
        />
      ) : null}

      <motion.div
        variants={staggerContainerVariants}
        initial="initial"
        animate="animate"
        className="grid gap-4"
      >
        {invites.map((invite) => (
          <motion.div key={invite.id} variants={staggerItemVariants}>
            <InviteCard
              invite={invite}
              isLoading={actionMutation.isPending}
              onAction={(action) => {
                if (action === 'reject') {
                  setPendingRejectInvite(invite)
                  return
                }

                actionMutation.mutate({ inviteId: invite.id, action })
              }}
            />
          </motion.div>
        ))}
      </motion.div>

      <ConfirmDialog
        open={Boolean(pendingRejectInvite)}
        title="Reject invite?"
        description={`Reject the invitation for ${pendingRejectInvite?.email ?? 'this user'}?`}
        confirmLabel="Reject"
        destructive
        loading={actionMutation.isPending}
        onClose={() => setPendingRejectInvite(null)}
        onConfirm={() => {
          if (pendingRejectInvite) {
            actionMutation.mutate({ inviteId: pendingRejectInvite.id, action: 'reject' })
          }
        }}
      />
    </motion.div>
  )
}
