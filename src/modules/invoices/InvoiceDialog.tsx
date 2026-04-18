import { useEffect, useState } from 'react'
import { Dialog } from '@/components/ui/Dialog'
import { Input, Field } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { INVOICE_STATUS } from './constants'
import { useUpsertInvoice, useDeleteInvoice } from './queries'
import { toast } from '@/stores/toast'
import type { Invoice } from '@/types/database'

interface InvoiceDialogProps {
  open: boolean
  onClose: () => void
  initial?: Invoice | null
}

export function InvoiceDialog({ open, onClose, initial }: InvoiceDialogProps) {
  const [clientName, setClientName] = useState('')
  const [amount, setAmount] = useState('0')
  const [dueDate, setDueDate] = useState('')
  const [status, setStatus] = useState('pending')
  const [category, setCategory] = useState('')

  const upsert = useUpsertInvoice()
  const del = useDeleteInvoice()

  useEffect(() => {
    if (!open) return
    setClientName(initial?.client_name ?? '')
    setAmount(String(initial?.amount ?? 0))
    setDueDate(initial?.due_date ?? '')
    setStatus(initial?.status ?? 'pending')
    setCategory(initial?.category ?? '')
  }, [open, initial])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!clientName.trim() || !dueDate) {
      toast.error('Kund och förfallodatum krävs')
      return
    }
    try {
      await upsert.mutateAsync({
        ...(initial?.id ? { id: initial.id } : {}),
        client_name: clientName.trim(),
        amount: Number(amount) || 0,
        due_date: dueDate,
        status,
        category: category || null,
      })
      toast.success(initial ? 'Faktura uppdaterad' : 'Faktura skapad')
      onClose()
    } catch (err) {
      toast.error('Något gick fel', err instanceof Error ? err.message : undefined)
    }
  }

  const handleDelete = async () => {
    if (!initial) return
    if (!confirm(`Ta bort fakturan för ${initial.client_name}?`)) return
    try {
      await del.mutateAsync(initial.id)
      toast.success('Faktura borttagen')
      onClose()
    } catch (err) {
      toast.error('Kunde inte ta bort', err instanceof Error ? err.message : undefined)
    }
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={initial ? 'Redigera faktura' : 'Ny faktura'}
      size="md"
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
          <Button form="invoice-form" type="submit" variant="primary" disabled={upsert.isPending}>
            {upsert.isPending ? 'Sparar…' : initial ? 'Spara' : 'Skapa'}
          </Button>
        </>
      }
    >
      <form id="invoice-form" onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
        <Field label="Kund" className="col-span-2">
          <Input value={clientName} onChange={(e) => setClientName(e.target.value)} required autoFocus />
        </Field>
        <Field label="Belopp (kr)">
          <Input type="number" min="0" value={amount} onChange={(e) => setAmount(e.target.value)} />
        </Field>
        <Field label="Förfallodatum">
          <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} required />
        </Field>
        <Field label="Status">
          <Select value={status} onChange={(e) => setStatus(e.target.value)}>
            {INVOICE_STATUS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Kategori">
          <Input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="t.ex. Konsult" />
        </Field>
      </form>
    </Dialog>
  )
}
