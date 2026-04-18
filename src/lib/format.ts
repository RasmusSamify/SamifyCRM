const sekFormatter = new Intl.NumberFormat('sv-SE', {
  style: 'currency',
  currency: 'SEK',
  maximumFractionDigits: 0,
})

const numberFormatter = new Intl.NumberFormat('sv-SE', {
  maximumFractionDigits: 0,
})

const dateFormatter = new Intl.DateTimeFormat('sv-SE', {
  year: 'numeric',
  month: 'short',
  day: '2-digit',
})

export const formatSEK = (value: number | null | undefined) =>
  value == null ? '—' : sekFormatter.format(value)

export const formatNumber = (value: number | null | undefined) =>
  value == null ? '—' : numberFormatter.format(value)

export const formatDate = (value: string | Date | null | undefined) => {
  if (!value) return '—'
  const date = typeof value === 'string' ? new Date(value) : value
  return dateFormatter.format(date)
}

export const formatRelativeDays = (from: string | Date | null | undefined) => {
  if (!from) return '—'
  const date = typeof from === 'string' ? new Date(from) : from
  const diff = Math.round((date.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
  if (diff === 0) return 'Idag'
  if (diff === 1) return 'Imorgon'
  if (diff === -1) return 'Igår'
  if (diff > 0) return `Om ${diff} dagar`
  return `${Math.abs(diff)} dagar sedan`
}
