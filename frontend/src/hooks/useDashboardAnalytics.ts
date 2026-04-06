import { useQuery } from '@tanstack/react-query'
import { fetchDashboardAnalytics } from '../services/dashboard/dashboardApi'

export function useDashboardAnalytics() {
  const orgId = localStorage.getItem('active_org_id') ?? undefined

  return useQuery({
    queryKey: ['dashboard-analytics', orgId],
    queryFn: () => fetchDashboardAnalytics(orgId),
    staleTime: 30_000,
  })
}
