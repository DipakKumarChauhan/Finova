import apiClient from '../api/client'
import type {
  CashflowPoint,
  DashboardAnalytics,
  ExpenseCategoryPoint,
  SummaryResponse,
  WeeklySpendingPoint,
} from './types'

const fallbackAnalytics: DashboardAnalytics = {
  summary: {
    total_income: 94250,
    total_expense: 38640,
    net_balance: 55610,
  },
  cashflow: [
    { month: '2026-01', income: 13200, expense: 5400, net: 7800 },
    { month: '2026-02', income: 14850, expense: 6030, net: 8820 },
    { month: '2026-03', income: 16120, expense: 6580, net: 9540 },
    { month: '2026-04', income: 17780, expense: 7440, net: 10340 },
    { month: '2026-05', income: 16900, expense: 7010, net: 9890 },
    { month: '2026-06', income: 15400, expense: 6180, net: 9220 },
  ],
  topExpenses: [
    { category_id: 'Infrastructure', total_expense: 13800 },
    { category_id: 'Payroll', total_expense: 9200 },
    { category_id: 'Marketing', total_expense: 6100 },
    { category_id: 'Software', total_expense: 4700 },
    { category_id: 'Operations', total_expense: 3840 },
  ],
  weeklySpending: [
    { week: '2026-02-02', total: 1180 },
    { week: '2026-02-09', total: 1620 },
    { week: '2026-02-16', total: 1390 },
    { week: '2026-02-23', total: 1840 },
    { week: '2026-03-02', total: 2010 },
    { week: '2026-03-09', total: 1670 },
    { week: '2026-03-16', total: 1950 },
  ],
}

function withOrg(orgId: string) {
  return { params: { org_id: orgId } }
}

export async function fetchDashboardAnalytics(orgId?: string): Promise<DashboardAnalytics> {
  if (!orgId) {
    return fallbackAnalytics
  }

  try {
    const [summaryRes, cashflowRes, topExpensesRes, weeklyRes] = await Promise.all([
      apiClient.get<SummaryResponse>('/dashboard/summary', withOrg(orgId)),
      apiClient.get<CashflowPoint[]>('/dashboard/cashflow', withOrg(orgId)),
      apiClient.get<ExpenseCategoryPoint[]>('/dashboard/top-expenses', withOrg(orgId)),
      apiClient.get<WeeklySpendingPoint[]>('/dashboard/weekly-trends', withOrg(orgId)),
    ])

    return {
      summary: summaryRes.data,
      cashflow: cashflowRes.data,
      topExpenses: topExpensesRes.data,
      weeklySpending: weeklyRes.data,
    }
  } catch {
    // Gracefully fallback to showcase UI even before org selection/token wiring.
    return fallbackAnalytics
  }
}
