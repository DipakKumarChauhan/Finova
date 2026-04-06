export type SummaryResponse = {
  total_income: number
  total_expense: number
  net_balance: number
}

export type CashflowPoint = {
  month: string
  income: number
  expense: number
  net: number
}

export type ExpenseCategoryPoint = {
  category_id: string | null
  total_expense: number
}

export type WeeklySpendingPoint = {
  week: string
  total: number
}

export type RecentTransaction = {
  id: string
  organization_id: string
  created_by: string | null
  category_id: string | null
  amount: number
  transaction_type: string
  transaction_date: string
  description: string | null
  created_at: string
  updated_at: string
}

export type DashboardAnalytics = {
  summary: SummaryResponse
  cashflow: CashflowPoint[]
  topExpenses: ExpenseCategoryPoint[]
  weeklySpending: WeeklySpendingPoint[]
}
