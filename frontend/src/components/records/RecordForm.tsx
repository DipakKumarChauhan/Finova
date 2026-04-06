import { motion, AnimatePresence } from 'framer-motion'
import { Check, ChevronDown, Plus, X } from 'lucide-react'
import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import { modalBackdropVariants, modalPanelVariants } from '../../animations/pageTransitions'
import { type CategoryItem } from '../../services/categoriesService'

export type RecordFormValues = {
  category_name?: string | null
  amount: number
  transaction_type: 'income' | 'expense'
  transaction_date: string
  description?: string | null
}

type RecordFormProps = {
  open: boolean
  title: string
  categories: CategoryItem[]
  initialValues?: RecordFormValues
  onClose: () => void
  onSubmit: (values: RecordFormValues) => void
}

function toDateInputValue(value?: string | null) {
  if (!value) {
    return ''
  }

  return new Date(value).toISOString().slice(0, 10)
}

function normalizeName(value: string) {
  return value.trim().toLowerCase()
}

export function RecordForm({ open, title, categories, initialValues, onClose, onSubmit }: RecordFormProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [inputValue, setInputValue] = useState(initialValues?.category_name ?? '')
  const [amount, setAmount] = useState(String(initialValues?.amount ?? ''))
  const [transactionType, setTransactionType] = useState<RecordFormValues['transaction_type']>(
    initialValues?.transaction_type ?? 'expense',
  )
  const [transactionDate, setTransactionDate] = useState(
    toDateInputValue(initialValues?.transaction_date),
  )
  const [description, setDescription] = useState(initialValues?.description ?? '')
  const [filteredCategories, setFilteredCategories] = useState<CategoryItem[]>(categories)
  const [selectedCategory, setSelectedCategory] = useState<CategoryItem | null>(null)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  const exactMatch = useMemo(() => {
    const normalizedInput = normalizeName(inputValue)

    if (!normalizedInput) {
      return null
    }

    return categories.find((category) => normalizeName(category.name) === normalizedInput) ?? null
  }, [categories, inputValue])

  useEffect(() => {
    const initialCategoryName = initialValues?.category_name ?? ''

    setInputValue(initialCategoryName)
    setAmount(String(initialValues?.amount ?? ''))
    setTransactionType(initialValues?.transaction_type ?? 'expense')
    setTransactionDate(toDateInputValue(initialValues?.transaction_date))
    setDescription(initialValues?.description ?? '')
    setSelectedCategory(
      categories.find((category) => normalizeName(category.name) === normalizeName(initialCategoryName)) ??
        null,
    )
    setIsDropdownOpen(false)
  }, [categories, initialValues, open])

  useEffect(() => {
    const normalizedInput = normalizeName(inputValue)

    if (!normalizedInput) {
      setFilteredCategories(categories)
      return
    }

    setFilteredCategories(
      categories.filter((category) => normalizeName(category.name).includes(normalizedInput)),
    )
  }, [categories, inputValue])

  useEffect(() => {
    const handleDocumentMouseDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleDocumentMouseDown)

    return () => document.removeEventListener('mousedown', handleDocumentMouseDown)
  }, [])

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    onSubmit({
      category_name: inputValue.trim() || null,
      amount: Number(amount),
      transaction_type: transactionType,
      transaction_date: transactionDate,
      description: description || null,
    })
  }

  const showCreateOption = inputValue.trim().length > 0 && !exactMatch

  const handleCategorySelect = (category: CategoryItem) => {
    setInputValue(category.name)
    setSelectedCategory(category)
    setIsDropdownOpen(false)
  }

  const handleCreateNew = () => {
    setSelectedCategory(null)
    setIsDropdownOpen(false)
  }

  return (
    <AnimatePresence>
      {open ? (
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
            className="glass-panel w-full max-w-2xl p-6 sm:p-8"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <h3 className="font-['Space_Grotesk'] text-2xl font-semibold text-slate-900">
                  {title}
                </h3>
                <p className="text-sm text-slate-500">Enter transaction details below.</p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-slate-200 bg-white p-2 text-slate-500 transition hover:bg-slate-50"
              >
                <X className="size-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Amount</label>
                <input
                  type="number"
                  step="0.01"
                  value={amount}
                  onChange={(event) => setAmount(event.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-ocean-500 focus:ring-4 focus:ring-ocean-100"
                  required
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Transaction Type
                </label>
                <select
                  value={transactionType}
                  onChange={(event) => setTransactionType(event.target.value as RecordFormValues['transaction_type'])}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-ocean-500 focus:ring-4 focus:ring-ocean-100"
                >
                  <option value="income">Income</option>
                  <option value="expense">Expense</option>
                </select>
              </div>

              <div ref={containerRef} className="relative sm:col-span-2">
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Category</label>
                <div className="relative">
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(event) => {
                      setInputValue(event.target.value)
                      setSelectedCategory(null)
                      setIsDropdownOpen(true)
                    }}
                    onFocus={() => {
                      setIsDropdownOpen(true)
                      setFilteredCategories(categories)
                    }}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 pr-10 text-sm outline-none transition focus:border-ocean-500 focus:ring-4 focus:ring-ocean-100"
                    placeholder="Type a category name"
                    autoComplete="off"
                  />
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                </div>

                {isDropdownOpen ? (
                  <div className="absolute z-20 mt-2 w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
                    <div className="max-h-56 overflow-y-auto py-1">
                      {filteredCategories.length > 0 ? (
                        filteredCategories.map((category) => {
                          const isSelected = selectedCategory?.id === category.id

                          return (
                            <button
                              key={category.id}
                              type="button"
                              onMouseDown={(event) => event.preventDefault()}
                              onClick={() => handleCategorySelect(category)}
                              className={`flex w-full items-center justify-between px-4 py-2.5 text-left text-sm transition hover:bg-slate-50 ${
                                isSelected ? 'bg-ocean-50 text-ocean-700' : 'text-slate-700'
                              }`}
                            >
                              <span>{category.name}</span>
                              {isSelected ? <Check className="size-4" /> : null}
                            </button>
                          )
                        })
                      ) : (
                        <div className="px-4 py-3 text-sm text-slate-500">No categories found.</div>
                      )}

                      {showCreateOption ? (
                        <button
                          type="button"
                          onMouseDown={(event) => event.preventDefault()}
                          onClick={handleCreateNew}
                          className="flex w-full items-center gap-2 border-t border-slate-100 px-4 py-2.5 text-left text-sm font-medium text-ocean-700 transition hover:bg-ocean-50"
                        >
                          <Plus className="size-4" />
                          Create &quot;{inputValue.trim()}&quot;
                        </button>
                      ) : null}
                    </div>
                  </div>
                ) : null}
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Transaction Date
                </label>
                <input
                  type="date"
                  value={transactionDate}
                  onChange={(event) => setTransactionDate(event.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-ocean-500 focus:ring-4 focus:ring-ocean-100"
                  required
                />
              </div>

              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  className="min-h-[110px] w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-ocean-500 focus:ring-4 focus:ring-ocean-100"
                  placeholder="Optional description"
                />
              </div>

              <div className="sm:col-span-2 flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Cancel
                </button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  className="rounded-xl bg-ocean-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-ocean-700"
                >
                  Save Record
                </motion.button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
