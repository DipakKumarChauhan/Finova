import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '../hooks/useAuth'
import { getOrganizations, type Organization } from '../services/organizationService'

type OrganizationContextValue = {
  organizations: Organization[]
  activeOrganization: Organization | null
  isLoadingOrganizations: boolean
  setActiveOrganization: (organization: Organization | null) => void
  refreshOrganizations: () => Promise<void>
}

const OrganizationContext = createContext<OrganizationContextValue | undefined>(undefined)

type OrganizationProviderProps = {
  children: ReactNode
}

const ACTIVE_ORG_STORAGE_KEY = 'active_org_id'

export function OrganizationProvider({ children }: OrganizationProviderProps) {
  const { isAuthenticated, isAuthLoading, user } = useAuth()
  const [activeOrganizationId, setActiveOrganizationId] = useState<string | null>(() => {
    return localStorage.getItem(ACTIVE_ORG_STORAGE_KEY)
  })

  const organizationsQuery = useQuery({
    queryKey: ['organizations', user?.email],
    queryFn: getOrganizations,
    enabled: isAuthenticated && !isAuthLoading,
    staleTime: 30_000,
    retry: false,
    refetchOnWindowFocus: false,
  })

  const organizations = organizationsQuery.data ?? []

  const activeOrganization = useMemo(() => {
    if (!activeOrganizationId) {
      return null
    }

    return organizations.find((organization) => organization.id === activeOrganizationId) ?? null
  }, [activeOrganizationId, organizations])

  useEffect(() => {
    if (!isAuthenticated) {
      setActiveOrganizationId(null)
      localStorage.removeItem(ACTIVE_ORG_STORAGE_KEY)
    }
  }, [isAuthenticated])

  useEffect(() => {
    if (organizationsQuery.isLoading) {
      return
    }

    if (!organizations.length) {
      setActiveOrganizationId(null)
      localStorage.removeItem(ACTIVE_ORG_STORAGE_KEY)
      return
    }

    const savedActiveId = localStorage.getItem(ACTIVE_ORG_STORAGE_KEY)
    const savedOrganization = organizations.find((organization) => organization.id === savedActiveId)

    if (savedOrganization) {
      setActiveOrganizationId(savedOrganization.id)
      return
    }

    if (organizations.length === 1) {
      setActiveOrganizationId(organizations[0].id)
      localStorage.setItem(ACTIVE_ORG_STORAGE_KEY, organizations[0].id)
      return
    }

    setActiveOrganizationId(null)
    localStorage.removeItem(ACTIVE_ORG_STORAGE_KEY)
  }, [organizations, organizationsQuery.isLoading])

  const setActiveOrganization = (organization: Organization | null) => {
    setActiveOrganizationId(organization?.id ?? null)

    if (organization) {
      localStorage.setItem(ACTIVE_ORG_STORAGE_KEY, organization.id)
    } else {
      localStorage.removeItem(ACTIVE_ORG_STORAGE_KEY)
    }
  }

  const refreshOrganizations = async () => {
    await organizationsQuery.refetch()
  }

  const value = useMemo<OrganizationContextValue>(
    () => ({
      organizations,
      activeOrganization,
      isLoadingOrganizations: organizationsQuery.isLoading,
      setActiveOrganization,
      refreshOrganizations,
    }),
    [activeOrganization, organizations, organizationsQuery.isLoading],
  )

  return <OrganizationContext.Provider value={value}>{children}</OrganizationContext.Provider>
}

export function useOrganizationContext() {
  const context = useContext(OrganizationContext)

  if (!context) {
    throw new Error('useOrganizationContext must be used within OrganizationProvider')
  }

  return context
}
