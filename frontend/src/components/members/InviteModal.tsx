import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import type { MemberItem } from '../../services/membersService'
import { modalBackdropVariants, modalPanelVariants } from '../../animations/pageTransitions'

type InviteModalProps = {
  open: boolean
  onClose: () => void
  onSubmit: (payload: { email: string; role: MemberItem['role'] }) => void
}

export function InviteModal({ open, onClose, onSubmit }: InviteModalProps) {
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<MemberItem['role']>('viewer')

  useEffect(() => {
    if (!open) {
      setEmail('')
      setRole('viewer')
    }
  }, [open])

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          variants={modalBackdropVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4 py-8 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            variants={modalPanelVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="glass-panel w-full max-w-lg p-6 sm:p-8"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <h3 className="font-['Space_Grotesk'] text-2xl font-semibold text-slate-900">
                  Invite Member
                </h3>
                <p className="text-sm text-slate-500">Send a new organization invite.</p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-slate-200 bg-white p-2 text-slate-500 transition hover:bg-slate-50"
              >
                <X className="size-4" />
              </button>
            </div>

            <form
              onSubmit={(event) => {
                event.preventDefault()
                onSubmit({ email, role })
              }}
              className="space-y-4"
            >
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-ocean-500 focus:ring-4 focus:ring-ocean-100"
                  placeholder="teammate@company.com"
                  required
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Role</label>
                <select
                  value={role}
                  onChange={(event) => setRole(event.target.value as MemberItem['role'])}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-ocean-500 focus:ring-4 focus:ring-ocean-100"
                >
                  <option value="viewer">Viewer</option>
                  <option value="analyst">Analyst</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Cancel
                </button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  className="rounded-xl bg-ocean-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-ocean-700"
                >
                  Send Invite
                </motion.button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
