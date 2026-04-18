import { useEffect, useState } from 'react'
import { Dialog } from '@/components/ui/Dialog'
import { Input, Field } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { useUpsertReminder, useDeleteReminder } from './queries'
import { toast } from '@/stores/toast'
import type { Reminder } from '@/types/database'

interface ReminderDialogProps {
  open: boolean
  onClose: () => void
  initial?: Reminder | null
}

export function ReminderDialog({ open, onClose, initial }: ReminderDialogProps) {
  const [title, setTitle] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [clientName, setClientName] = useState('')
  const [dealCompany, setDealCompany] = useState('')

  const upsert = useUpsertReminder()
  const del = useDeleteReminder()

  useEffect(() => {
    if (!open) return
    setTitle(initial?.title ?? '')
    setDueDate(initial?.due_date ?? '')
    setClientName(initial?.client_name ?? '')
    setDealCompany(initial?.deal_company ?? '')
  }, [open, initial])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !dueDate) {
      toast.error('Titel och datum krävs')
      return
    }
    try {
      await upsert.mutateAsync({
        ...(initial?.id ? { id: initial.id } : {}),
        title: title.trim(),
        due_date: dueDate,
        client_name: clientName || null,
        deal_company: dealCompany || null,
      })
      toast.success(initial ? 'Påminnelse uppdaterad' : 'Påminnelse skapad')
      onClose()
    } catch (err) {
      toast.error('Något gick fel', err instanceof Error ? err.message : undefined)
    }
  }

  const handleDelete = async () => {
    if (!initial) return
    if (!confirm(`Ta bort "${initial.title}"?`)) return
    try {
      await del.mutateAsync(initial.id)
      toast.success('Borttagen')
      onClose()
    } catch {
      toast.error('Kunde inte ta bort')
    }
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={initial ? 'Redigera påminnelse' : 'Ny påminnelse'}
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
          <Button form="reminder-form" type="submit" variant="primary">
            {initial ? 'Spara' : 'Skapa'}
          </Button>
        </>
      }
    >
      <form id="reminder-form" onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
        <Field label="Titel" className="col-span-2">
          <Input value={title} onChange={(e) => setTitle(e.target.value)} required autoFocus />
        </Field>
        <Field label="Förfaller">
          <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} required />
        </Field>
        <Field label="Kund (valfritt)">
          <Input value={clientName} onChange={(e) => setClientName(e.target.value)} />
        </Field>
        <Field label="Deal-företag (valfritt)" className="col-span-2">
          <Input value={dealCompany} onChange={(e) => setDealCompany(e.target.value)} />
        </Field>
      </form>
    </Dialog>
  )
}
