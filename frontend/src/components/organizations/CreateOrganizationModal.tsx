import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { createOrganization } from '../../services/organizationService'
import { modalBackdropVariants, modalPanelVariants } from '../../animations/pageTransitions'

type CreateOrganizationModalProps = {
  onClose: () => void
  onSuccess: () => void
}

export function CreateOrganizationModal({ onClose, onSuccess }: CreateOrganizationModalProps) {
  const [name, setName] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    setIsSubmitting(true)
    try {
      await createOrganization(name.trim())
      toast.success('Organization created successfully')
      setName('')
      onSuccess()
      onClose()
    } catch (error) {
      console.error('Failed to create organization:', error)
      toast.error('Failed to create organization. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AnimatePresence>
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
          className="glass-panel w-full max-w-md p-6 sm:p-8"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <h3 className="font-['Space_Grotesk'] text-2xl font-semibold text-slate-900">
                Create Organization
              </h3>
              <p className="text-sm text-slate-500">Enter a name for your new organization.</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-200 bg-white p-2 text-slate-500 transition hover:bg-slate-50"
            >
              <X className="size-4" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Organization Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Acme Corp"
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-ocean-500 focus:ring-4 focus:ring-ocean-100"
                disabled={isSubmitting}
                autoFocus
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isSubmitting || !name.trim()}
                className="rounded-xl bg-ocean-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-ocean-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSubmitting ? 'Creating...' : 'Create'}
              </motion.button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
