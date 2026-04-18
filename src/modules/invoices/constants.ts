export const INVOICE_STATUS = [
  { value: 'pending', label: 'Väntande', tone: 'warning' as const },
  { value: 'paid', label: 'Betald', tone: 'success' as const },
  { value: 'overdue', label: 'Försenad', tone: 'danger' as const },
  { value: 'draft', label: 'Utkast', tone: 'default' as const },
]

export function invoiceStatus(status: string | null | undefined) {
  return INVOICE_STATUS.find((s) => s.value === status) ?? INVOICE_STATUS[0]
}

/* Compute derived status: mark pending as overdue if due_date passed */
export function resolvedStatus(status: string, dueDate: string) {
  if (status === 'paid' || status === 'draft') return status
  const due = new Date(dueDate).getTime()
  if (Number.isFinite(due) && due < Date.now()) return 'overdue'
  return status
}
