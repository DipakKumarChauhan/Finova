export type FormatDateOptions = Intl.DateTimeFormatOptions

export function formatDate(value: string | number | Date, options: FormatDateOptions = {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
}): string {
  return new Intl.DateTimeFormat('en-US', options).format(new Date(value))
}

export function formatDateTime(
  value: string | number | Date,
  options: FormatDateOptions = {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  },
): string {
  return new Intl.DateTimeFormat('en-US', options).format(new Date(value))
}