import { useQuery } from '@tanstack/react-query'
import {
  getCashflow,
  getRecentTransactions,
  getSummary,
  getTopExpenses,
  getWeeklyTrends,
} from '../services/dashboardService'

export function useSummary(orgId?: string | null) {

  return useQuery({
    queryKey: ['dashboard-summary', orgId],
    queryFn: () => getSummary(orgId as string),
    enabled: Boolean(orgId),
    staleTime: 30_000,
  })
}

export function useCashflow(orgId?: string | null) {

  return useQuery({
    queryKey: ['dashboard-cashflow', orgId],
    queryFn: () => getCashflow(orgId as string),
    enabled: Boolean(orgId),
    staleTime: 30_000,
  })
}

export function useTopExpenses(orgId?: string | null) {

  return useQuery({
    queryKey: ['dashboard-top-expenses', orgId],
    queryFn: () => getTopExpenses(orgId as string),
    enabled: Boolean(orgId),
    staleTime: 30_000,
  })
}

export function useWeeklyTrends(orgId?: string | null) {

  return useQuery({
    queryKey: ['dashboard-weekly-trends', orgId],
    queryFn: () => getWeeklyTrends(orgId as string),
    enabled: Boolean(orgId),
    staleTime: 30_000,
  })
}

export function useRecentTransactions(orgId?: string | null) {

  return useQuery({
    queryKey: ['dashboard-recent', orgId],
    queryFn: () => getRecentTransactions(orgId as string),
    enabled: Boolean(orgId),
    staleTime: 15_000,
  })
}
