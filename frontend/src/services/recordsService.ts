import api from './api'

export type RecordItem = {
  id: string
  organization_id: string
  created_by?: string
  category_name: string | null
  amount: number
  transaction_type: 'income' | 'expense' | string
  transaction_date: string
  description: string | null
  created_at?: string
  updated_at?: string | null
  deleted_at?: string | null
}

export type RecordsResponse = {
  records: RecordItem[]
  limit: number
  offset: number
}

export type RecordFilters = {
  startDate?: string
  endDate?: string
  category?: string
  transactionType?: string
  limit?: number
  offset?: number
}

export type RecordPayload = {
  organization_id: string
  category_name?: string | null
  amount: number
  transaction_type: string
  transaction_date: string
  description?: string | null
}

export type RecordUpdatePayload = {
  category_name?: string | null
  amount?: number
  transaction_type?: string
  transaction_date?: string
  description?: string | null
}

function buildRecordParams(orgId: string, filters: RecordFilters) {
  return {
    org_id: orgId,
    start_date: filters.startDate,
    end_date: filters.endDate,
    category: filters.category || undefined,
    transaction_type: filters.transactionType || undefined,
    limit: filters.limit ?? 50,
    offset: filters.offset ?? 0,
  }
}

export async function getRecords(orgId: string, filters: RecordFilters): Promise<RecordsResponse> {
  const response = await api.get<RecordsResponse>('/records', {
    params: buildRecordParams(orgId, filters),
  })

  return response.data
}

export async function createRecord(payload: RecordPayload): Promise<RecordItem> {
  const response = await api.post<RecordItem>('/records', payload)
  return response.data
}

export async function updateRecord(
  recordId: string,
  orgId: string,
  payload: RecordUpdatePayload,
): Promise<RecordItem> {
  const response = await api.patch<RecordItem>(`/records/${recordId}`, payload, {
    params: { organization_id: orgId },
  })

  return response.data
}

export async function deleteRecord(recordId: string, orgId: string): Promise<void> {
  await api.delete(`/records/${recordId}`, {
    params: { organization_id: orgId },
  })
}

export async function exportRecords(orgId: string, filters: RecordFilters): Promise<Blob> {
  const response = await api.get('/records/export', {
    params: buildRecordParams(orgId, filters),
    responseType: 'blob',
  })

  return response.data
}
