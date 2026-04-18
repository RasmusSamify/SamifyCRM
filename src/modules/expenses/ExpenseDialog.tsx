import { useEffect, useState } from 'react'
import { Dialog } from '@/components/ui/Dialog'
import { Input, Textarea, Field } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { useUpsertExpense, useDeleteExpense } from './queries'
import { toast } from '@/stores/toast'
import type { Expense } from '@/types/database'

interface ExpenseDialogProps {
  open: boolean
  onClose: () => void
  initial?: Expense | null
}

const CATEGORIES = [
  'Mjukvara',
  'Infrastruktur',
  'AI / API',
  'Marknadsföring',
  'Kontor',
  'Resor',
  'Övrigt',
]
const CURRENCIES = ['SEK', 'EUR', 'USD']
const CYCLES = [
  { value: 'monthly', label: 'Månad' },
  { value: 'yearly', label: 'År' },
  { value: 'quarterly', label: 'Kvartal' },
]
const TYPES = [
  { value: 'recurring', label: 'Återkommande' },
  { value: 'onetime', label: 'Engångsutgift' },
]

export function ExpenseDialog({ open, onClose, initial }: ExpenseDialogProps) {
  const [name, setName] = useState('')
  const [category, setCategory] = useState('Mjukvara')
  const [amountSek, setAmountSek] = useState('0')
  const [amountOriginal, setAmountOriginal] = useState('')
  const [currency, setCurrency] = useState('SEK')
  const [expenseType, setExpenseType] = useState('recurring')
  const [billingCycle, setBillingCycle] = useState('monthly')
  const [nextDate, setNextDate] = useState('')
  const [expenseMonth, setExpenseMonth] = useState('')
  const [note, setNote] = useState('')
  const [url, setUrl] = useState('')
  const [status, setStatus] = useState('active')

  const upsert = useUpsertExpense()
  const del = useDeleteExpense()

  useEffect(() => {
    if (!open) return
    setName(initial?.name ?? '')
    setCategory(initial?.category ?? 'Mjukvara')
    setAmountSek(String(initial?.amount_sek ?? 0))
    setAmountOriginal(initial?.amount_original != null ? String(initial.amount_original) : '')
    setCurrency(initial?.currency ?? 'SEK')
    setExpenseType(initial?.expense_type ?? 'recurring')
    setBillingCycle(initial?.billing_cycle ?? 'monthly')
    setNextDate(initial?.next_date ?? '')
    setExpenseMonth(initial?.expense_month ?? '')
    setNote(initial?.note ?? '')
    setUrl(initial?.url ?? '')
    setStatus(initial?.status ?? 'active')
  }, [open, initial])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      toast.error('Namn krävs')
      return
    }
    const parseNum = (v: string) => (v.trim() === '' ? null : Number(v))
    try {
      await upsert.mutateAsync({
        ...(initial?.id ? { id: initial.id } : {}),
        name: name.trim(),
        category,
        amount_sek: Number(amountSek) || 0,
        amount_original: parseNum(amountOriginal),
        currency,
        expense_type: expenseType,
        billing_cycle: expenseType === 'recurring' ? billingCycle : null,
        next_date: expenseType === 'recurring' ? nextDate || null : null,
        expense_month: expenseType === 'onetime' ? expenseMonth || null : null,
        note: note || null,
        url: url || null,
        status,
      })
      toast.success(initial ? 'Kostnad uppdaterad' : 'Kostnad skapad')
      onClose()
    } catch (err) {
      toast.error('Något gick fel', err instanceof Error ? err.message : undefined)
    }
  }

  const handleDelete = async () => {
    if (!initial) return
    if (!confirm(`Ta bort kostnaden "${initial.name}"?`)) return
    try {
      await del.mutateAsync(initial.id)
      toast.success('Kostnad borttagen')
      onClose()
    } catch (err) {
      toast.error('Kunde inte ta bort', err instanceof Error ? err.message : undefined)
    }
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={initial ? 'Redigera kostnad' : 'Ny kostnad'}
      size="lg"
      footer={
        <>
          {initial && (
            <Button variant="ghost" onClick={handleDelete} className="text-[var(--color-danger)] mr-auto">
              Ta bort
            </Button>
          )}
          <Button variant="ghost" onClick={onClose}>
            Avbryt
          </Button>
          <Button form="expense-form" type="submit" variant="primary" disabled={upsert.isPending}>
            {upsert.isPending ? 'Sparar…' : initial ? 'Spara' : 'Skapa'}
          </Button>
        </>
      }
    >
      <form id="expense-form" onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
        <Field label="Namn" className="col-span-2">
          <Input value={name} onChange={(e) => setName(e.target.value)} required autoFocus />
        </Field>
        <Field label="Kategori">
          <Select value={category} onChange={(e) => setCategory(e.target.value)}>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Typ">
          <Select value={expenseType} onChange={(e) => setExpenseType(e.target.value)}>
            {TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Belopp (SEK)">
          <Input
            type="number"
            min="0"
            value={amountSek}
            onChange={(e) => setAmountSek(e.target.value)}
          />
        </Field>
        <Field label="Valuta">
          <Select value={currency} onChange={(e) => setCurrency(e.target.value)}>
            {CURRENCIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>
        </Field>
        {currency !== 'SEK' && (
          <Field label={`Originalbelopp (${currency})`}>
            <Input
              type="number"
              min="0"
              value={amountOriginal}
              onChange={(e) => setAmountOriginal(e.target.value)}
            />
          </Field>
        )}
        {expenseType === 'recurring' ? (
          <>
            <Field label="Intervall">
              <Select value={billingCycle} onChange={(e) => setBillingCycle(e.target.value)}>
                {CYCLES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Nästa debitering">
              <Input type="date" value={nextDate} onChange={(e) => setNextDate(e.target.value)} />
            </Field>
          </>
        ) : (
          <Field label="Månad">
            <Input
              type="month"
              value={expenseMonth}
              onChange={(e) => setExpenseMonth(e.target.value)}
            />
          </Field>
        )}
        <Field label="URL" className="col-span-2">
          <Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://..." />
        </Field>
        <Field label="Anteckning" className="col-span-2">
          <Textarea value={note} onChange={(e) => setNote(e.target.value)} />
        </Field>
      </form>
    </Dialog>
  )
}
