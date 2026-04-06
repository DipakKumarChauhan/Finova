import api from './api'
import type {
  CashflowPoint,
  ExpenseCategoryPoint,
  RecentTransaction,
  SummaryResponse,
  WeeklySpendingPoint,
} from './dashboard/types'

function withOrg(orgId: string) {
  return { params: { org_id: orgId } }
}

export async function getSummary(orgId: string): Promise<SummaryResponse> {
  const response = await api.get<SummaryResponse>('/dashboard/summary', withOrg(orgId))
  return response.data
}

export async function getCashflow(orgId: string): Promise<CashflowPoint[]> {
  const response = await api.get<CashflowPoint[]>('/dashboard/cashflow', withOrg(orgId))
  return response.data
}

export async function getTopExpenses(orgId: string): Promise<ExpenseCategoryPoint[]> {
  const response = await api.get<ExpenseCategoryPoint[]>('/dashboard/top-expenses', withOrg(orgId))
  return response.data
}

export async function getWeeklyTrends(orgId: string): Promise<WeeklySpendingPoint[]> {
  const response = await api.get<WeeklySpendingPoint[]>('/dashboard/weekly-trends', withOrg(orgId))
  return response.data
}

export async function getRecentTransactions(orgId: string): Promise<RecentTransaction[]> {
  const response = await api.get<RecentTransaction[]>('/dashboard/recent', withOrg(orgId))
  return response.data
}
