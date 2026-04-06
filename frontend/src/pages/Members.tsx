import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { MailPlus, Pencil, Trash2 } from 'lucide-react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { useOrganizationContext } from '../context/OrganizationContext'
import {
  getMembers,
  inviteMember,
  removeMember,
  updateMemberRole,
  type MemberItem,
} from '../services/membersService'
import { InviteModal } from '../components/members/InviteModal'
import { MembersTableSkeleton } from '../components/members/MembersTableSkeleton'
import { EmptyState } from '../components/ui/EmptyState'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { staggerContainerVariants, staggerItemVariants, pageVariants } from '../animations/pageTransitions'
import { formatDate } from '../utils/formatDate'

export function Members() {
  const { activeOrganization } = useOrganizationContext()
  const queryClient = useQueryClient()
  const [inviteOpen, setInviteOpen] = useState(false)
  const [draftRoles, setDraftRoles] = useState<Record<string, MemberItem['role']>>({})
  const [pendingRemovalEmail, setPendingRemovalEmail] = useState<string | null>(null)
  const orgId = activeOrganization?.id ?? null

  const membersQuery = useQuery({
    queryKey: ['members', orgId],
    queryFn: () => getMembers(orgId as string),
    enabled: Boolean(orgId),
    staleTime: 20_000,
  })

  const inviteMutation = useMutation({
    mutationFn: ({ email, role }: { email: string; role: MemberItem['role'] }) =>
      inviteMember(orgId as string, { email, role }),
    onSuccess: async () => {
      toast.success('Invite sent')
      await queryClient.invalidateQueries({ queryKey: ['members', orgId] })
      setInviteOpen(false)
    },
    onError: () => toast.error('Could not send invite'),
  })

  const updateRoleMutation = useMutation({
    mutationFn: ({ email, role }: { email: string; role: MemberItem['role'] }) =>
      updateMemberRole(orgId as string, email, role),
    onSuccess: async () => {
      toast.success('Member role updated')
      await queryClient.invalidateQueries({ queryKey: ['members', orgId] })
    },
    onError: () => toast.error('Could not update member role'),
  })

  const removeMutation = useMutation({
    mutationFn: (email: string) => removeMember(orgId as string, email),
    onSuccess: async () => {
      toast.success('Member removed')
      await queryClient.invalidateQueries({ queryKey: ['members', orgId] })
      setPendingRemovalEmail(null)
    },
    onError: () => toast.error('Could not remove member'),
  })

  if (!activeOrganization) {
    return (
      <div className="flex min-h-[65vh] items-center justify-center">
        <motion.section
          initial={{ opacity: 0, y: 18, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="glass-panel w-full max-w-2xl p-7 text-center"
        >
          <h1 className="font-['Space_Grotesk'] text-3xl font-semibold text-slate-900">
            Select an organization to manage members
          </h1>
          <p className="mt-3 text-sm text-slate-600">
            Member roles and invite actions are organization-scoped.
          </p>
        </motion.section>
      </div>
    )
  }

  if (membersQuery.isLoading) {
    return (
      <div className="space-y-6">
        <div className="glass-panel h-28 animate-pulse bg-slate-100" />
        <MembersTableSkeleton />
      </div>
    )
  }

  const members = membersQuery.data ?? []

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
        className="glass-panel flex flex-col gap-4 p-5 sm:p-6 lg:flex-row lg:items-end lg:justify-between"
      >
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-ocean-700">
            Team access
          </p>
          <h1 className="mt-2 font-['Space_Grotesk'] text-3xl font-semibold text-slate-900">
            {activeOrganization.name} members
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-600 sm:text-base">
            Review access, adjust roles, and send new invites.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setInviteOpen(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-ocean-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-ocean-700"
        >
          <MailPlus className="size-4" />
          Invite Member
        </button>
      </motion.section>

      {membersQuery.isError ? (
        <div className="glass-panel p-6 text-sm text-rose-700">
          We could not load members for the selected organization.
        </div>
      ) : null}

      {members.length === 0 ? (
        <EmptyState
          title="No members yet"
          description="Invite teammates to start collaborating in the workspace."
          actionLabel="Invite Member"
          onAction={() => setInviteOpen(true)}
        />
      ) : (
        <div className="glass-panel overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-left">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                    Email
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                    Role
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                    Joined
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <motion.tbody
                variants={staggerContainerVariants}
                initial="initial"
                animate="animate"
                className="divide-y divide-slate-100 bg-white"
              >
                {members.map((member) => {
                  const currentRole = draftRoles[member.email] ?? member.role

                  return (
                    <motion.tr
                      key={member.user_id}
                      variants={staggerItemVariants}
                      className="transition hover:bg-slate-50/80"
                    >
                      <td className="px-4 py-3 text-sm text-slate-700">{member.email}</td>
                      <td className="px-4 py-3">
                        <select
                          value={currentRole}
                          onChange={(event) =>
                            setDraftRoles((current) => ({
                              ...current,
                              [member.email]: event.target.value as MemberItem['role'],
                            }))
                          }
                          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-ocean-500 focus:ring-4 focus:ring-ocean-100 sm:w-44"
                        >
                          <option value="viewer">Viewer</option>
                          <option value="analyst">Analyst</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600">
                        {formatDate(member.joined_at)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              updateRoleMutation.mutate({ email: member.email, role: currentRole })
                            }
                            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                          >
                            <Pencil className="size-3.5" />
                            Save Role
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setPendingRemovalEmail(member.email)
                            }}
                            className="inline-flex items-center gap-1 rounded-lg border border-rose-100 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700 transition hover:bg-rose-100"
                          >
                            <Trash2 className="size-3.5" />
                            Remove
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  )
                })}
              </motion.tbody>
            </table>
          </div>
        </div>
      )}

      <InviteModal
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
        onSubmit={(payload) => inviteMutation.mutate(payload)}
      />

      <ConfirmDialog
        open={Boolean(pendingRemovalEmail)}
        title="Remove member?"
        description={`This will remove ${pendingRemovalEmail ?? 'this member'} from the organization.`}
        confirmLabel="Remove"
        destructive
        loading={removeMutation.isPending}
        onClose={() => setPendingRemovalEmail(null)}
        onConfirm={() => {
          if (pendingRemovalEmail) {
            removeMutation.mutate(pendingRemovalEmail)
          }
        }}
      />
    </motion.div>
  )
}
