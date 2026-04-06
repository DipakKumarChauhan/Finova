export type FormatCurrencyOptions = {
  negative?: boolean
  minimumFractionDigits?: number
  maximumFractionDigits?: number
}

export function formatCurrency(
  value: number,
  options: FormatCurrencyOptions = {},
): string {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: options.minimumFractionDigits ?? 0,
    maximumFractionDigits: options.maximumFractionDigits ?? 0,
  })

  const formatted = formatter.format(Math.abs(value))

  if (options.negative) {
    return `-${formatted}`
  }

  return value < 0 ? `-${formatted}` : formatted
}