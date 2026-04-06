import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Download, Plus } from 'lucide-react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { useOrganizationContext } from '../context/OrganizationContext'
import { getCategories } from '../services/categoriesService'
import {
  createRecord,
  deleteRecord,
  exportRecords,
  getRecords,
  updateRecord,
  type RecordFilters,
  type RecordItem,
  type RecordPayload,
  type RecordUpdatePayload,
} from '../services/recordsService'
import { RecordFilters as RecordFiltersBar } from '../components/records/RecordFilters'
import { RecordForm, type RecordFormValues } from '../components/records/RecordForm'
import { RecordsTable } from '../components/records/RecordsTable'
import { RecordsTableSkeleton } from '../components/records/RecordsTableSkeleton'
import { EmptyState } from '../components/ui/EmptyState'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { pageVariants } from '../animations/pageTransitions'

const DEFAULT_FILTERS: RecordFilters = {
  limit: 10,
  offset: 0,
}

function toFormValues(record: RecordItem): RecordFormValues {
  return {
    category_name: record.category_name,
    amount: Number(record.amount),
    transaction_type: record.transaction_type === 'income' ? 'income' : 'expense',
    transaction_date: record.transaction_date,
    description: record.description,
  }
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.click()
  URL.revokeObjectURL(url)
}

export function Records() {
  const { activeOrganization } = useOrganizationContext()
  const queryClient = useQueryClient()
  const orgId = activeOrganization?.id ?? null
  const [filters, setFilters] = useState<RecordFilters>(DEFAULT_FILTERS)
  const [appliedFilters, setAppliedFilters] = useState<RecordFilters>(DEFAULT_FILTERS)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedRecord, setSelectedRecord] = useState<RecordItem | null>(null)
  const [pendingDeleteRecord, setPendingDeleteRecord] = useState<RecordItem | null>(null)

  const recordsQuery = useQuery({
    queryKey: ['records', orgId, appliedFilters],
    queryFn: () => getRecords(orgId as string, appliedFilters),
    enabled: Boolean(orgId),
    staleTime: 20_000,
  })

  const categoriesQuery = useQuery({
    queryKey: ['categories', orgId],
    queryFn: () => getCategories(orgId as string),
    enabled: Boolean(orgId),
    staleTime: 30_000,
  })

  const createMutation = useMutation({
    mutationFn: (payload: RecordPayload) => createRecord(payload),
    onSuccess: async () => {
      toast.success('Record created')
      await queryClient.invalidateQueries({ queryKey: ['records', orgId] })
      setIsFormOpen(false)
      setSelectedRecord(null)
    },
    onError: () => toast.error('Could not create record'),
  })

  const updateMutation = useMutation({
    mutationFn: ({ recordId, payload }: { recordId: string; payload: RecordUpdatePayload }) =>
      updateRecord(recordId, orgId as string, payload),
    onSuccess: async () => {
      toast.success('Record updated')
      await queryClient.invalidateQueries({ queryKey: ['records', orgId] })
      setIsFormOpen(false)
      setSelectedRecord(null)
    },
    onError: () => toast.error('Could not update record'),
  })

  const deleteMutation = useMutation({
    mutationFn: (recordId: string) => deleteRecord(recordId, orgId as string),
    onSuccess: async () => {
      toast.success('Record deleted')
      await queryClient.invalidateQueries({ queryKey: ['records', orgId] })
      setPendingDeleteRecord(null)
    },
    onError: () => toast.error('Could not delete record'),
  })

  const exportMutation = useMutation({
    mutationFn: () => exportRecords(orgId as string, { ...appliedFilters, limit: 10_000, offset: 0 }),
    onSuccess: (blob) => {
      downloadBlob(blob, `records-${activeOrganization?.name ?? 'export'}.csv`)
      toast.success('CSV export downloaded')
    },
    onError: () => toast.error('Could not export CSV'),
  })

  const records = recordsQuery.data?.records ?? []
  const categories = categoriesQuery.data ?? []
  const hasNextPage = records.length === (appliedFilters.limit ?? DEFAULT_FILTERS.limit ?? 10)
  const pageStart = (appliedFilters.offset ?? 0) + 1
  const pageEnd = (appliedFilters.offset ?? 0) + records.length

  const title = useMemo(() => {
    if (!activeOrganization) {
      return 'Records'
    }

    return `${activeOrganization.name} records`
  }, [activeOrganization])

  if (!activeOrganization) {
    return (
      <div className="flex min-h-[65vh] items-center justify-center">
        <motion.section
          initial={{ opacity: 0, y: 18, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="glass-panel w-full max-w-2xl p-7 text-center"
        >
          <h1 className="font-['Space_Grotesk'] text-3xl font-semibold text-slate-900">
            Select an organization to manage records
          </h1>
          <p className="mt-3 text-sm text-slate-600">
            Record listings, filtering, editing, and CSV export are scoped to the active organization.
          </p>
        </motion.section>
      </div>
    )
  }

  if (recordsQuery.isLoading) {
    return (
      <div className="space-y-6">
        <div className="glass-panel h-24 animate-pulse bg-slate-100" />
        <div className="glass-panel h-28 animate-pulse bg-slate-100" />
        <RecordsTableSkeleton />
      </div>
    )
  }

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="space-y-6"
    >
      <motion.section
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="glass-panel flex flex-col gap-4 p-5 sm:p-6 lg:flex-row lg:items-end lg:justify-between"
      >
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-ocean-700">
            Operational records
          </p>
          <h1 className="mt-2 font-['Space_Grotesk'] text-3xl font-semibold text-slate-900">
            {title}
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-600 sm:text-base">
            Filter transactions, update entries, and export the current view as CSV.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => setIsFormOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-ocean-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-ocean-700"
          >
            <Plus className="size-4" />
            New Record
          </button>
          <button
            type="button"
            onClick={() => exportMutation.mutate()}
            disabled={exportMutation.isPending}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Download className="size-4" />
            Export CSV
          </button>
        </div>
      </motion.section>

      <RecordFiltersBar
        filters={filters}
        onChange={(nextFilters) => setFilters({ ...nextFilters, offset: 0 })}
        onSearch={() => setAppliedFilters({ ...filters, offset: 0 })}
        onReset={() => {
          setFilters(DEFAULT_FILTERS)
          setAppliedFilters(DEFAULT_FILTERS)
        }}
      />

      {recordsQuery.isError ? (
        <div className="glass-panel p-6 text-sm text-rose-700">
          We could not load records for the selected organization.
        </div>
      ) : null}

      {records.length === 0 ? (
        <EmptyState
          title={
            appliedFilters.startDate ||
            appliedFilters.endDate ||
            appliedFilters.category ||
            appliedFilters.transactionType
              ? 'No records match the current filters'
              : 'No records yet'
          }
          description={
            appliedFilters.startDate ||
            appliedFilters.endDate ||
            appliedFilters.category ||
            appliedFilters.transactionType
              ? 'Reset the filters or add a new record to widen the view.'
              : 'Add your first record to start populating the ledger.'
          }
          actionLabel={
            appliedFilters.startDate ||
            appliedFilters.endDate ||
            appliedFilters.category ||
            appliedFilters.transactionType
              ? 'Reset filters'
              : 'New Record'
          }
          onAction={
            appliedFilters.startDate ||
            appliedFilters.endDate ||
            appliedFilters.category ||
            appliedFilters.transactionType
              ? () => {
                  setFilters(DEFAULT_FILTERS)
                  setAppliedFilters(DEFAULT_FILTERS)
                }
              : () => setIsFormOpen(true)
          }
        />
      ) : (
        <RecordsTable
          records={records}
          onEdit={(record) => {
            setSelectedRecord(record)
            setIsFormOpen(true)
          }}
          onDelete={(record) => {
            setPendingDeleteRecord(record)
          }}
        />
      )}

      <div className="flex flex-col gap-3 rounded-2xl border border-white/60 bg-white/70 p-4 shadow-soft sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-slate-600">
          Showing {pageStart} to {pageEnd} of {records.length} loaded record(s)
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            disabled={(appliedFilters.offset ?? 0) === 0}
            onClick={() => {
              const nextOffset = Math.max(
                0,
                (appliedFilters.offset ?? 0) - (appliedFilters.limit ?? DEFAULT_FILTERS.limit ?? 10),
              )
              setAppliedFilters((current) => ({
                ...current,
                offset: nextOffset,
              }))
              setFilters((current) => ({
                ...current,
                offset: nextOffset,
              }))
            }}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Previous
          </button>
          <button
            type="button"
            disabled={!hasNextPage}
            onClick={() => {
              const nextOffset = (appliedFilters.offset ?? 0) +
                (appliedFilters.limit ?? DEFAULT_FILTERS.limit ?? 10)
              setAppliedFilters((current) => ({
                ...current,
                offset: nextOffset,
              }))
              setFilters((current) => ({
                ...current,
                offset: nextOffset,
              }))
            }}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>

      <RecordForm
        open={isFormOpen}
        title={selectedRecord ? 'Edit Record' : 'Create Record'}
        categories={categories}
        initialValues={selectedRecord ? toFormValues(selectedRecord) : undefined}
        onClose={() => {
          setIsFormOpen(false)
          setSelectedRecord(null)
        }}
        onSubmit={(values) => {
          if (selectedRecord) {
            updateMutation.mutate({
              recordId: selectedRecord.id,
              payload: values,
            })
            return
          }

          createMutation.mutate({
            organization_id: activeOrganization.id,
            ...values,
          })
        }}
      />

      <ConfirmDialog
        open={Boolean(pendingDeleteRecord)}
        title="Delete record?"
        description="This action cannot be undone. The record will be removed from the active organization."
        confirmLabel="Delete"
        destructive
        loading={deleteMutation.isPending}
        onClose={() => setPendingDeleteRecord(null)}
        onConfirm={() => {
          if (pendingDeleteRecord) {
            deleteMutation.mutate(pendingDeleteRecord.id)
          }
        }}
      />
    </motion.div>
  )
}
