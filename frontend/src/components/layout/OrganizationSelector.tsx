import { ChevronDown, Building2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { useOrganizationContext } from '../../context/OrganizationContext'

export function OrganizationSelector() {
  const {
    organizations,
    activeOrganization,
    isLoadingOrganizations,
    setActiveOrganization,
  } = useOrganizationContext()

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="flex min-w-[220px] items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm"
    >
      <Building2 className="size-4 shrink-0 text-ocean-700" />
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-slate-400">
          Organization
        </p>
        <select
          disabled={isLoadingOrganizations || organizations.length === 0}
          value={activeOrganization?.id ?? ''}
          onChange={(event) => {
            const selected = organizations.find((organization) => organization.id === event.target.value)
            setActiveOrganization(selected ?? null)
          }}
          className="mt-0.5 w-full cursor-pointer bg-transparent text-sm font-medium text-slate-900 outline-none disabled:cursor-not-allowed"
        >
          {organizations.length === 0 ? (
            <option value="">No organizations</option>
          ) : activeOrganization ? (
            <option value={activeOrganization.id}>{activeOrganization.name}</option>
          ) : (
            <option value="">Select organization</option>
          )}
          {organizations
            .filter((organization) => organization.id !== activeOrganization?.id)
            .map((organization) => (
              <option key={organization.id} value={organization.id}>
                {organization.name}
              </option>
            ))}
        </select>
      </div>
      <ChevronDown className="size-4 shrink-0 text-slate-400" />
    </motion.div>
  )
}
