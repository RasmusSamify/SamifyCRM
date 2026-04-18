import { useEffect, useState } from 'react'
import { Dialog } from '@/components/ui/Dialog'
import { Input, Textarea, Field } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { PHASES } from './constants'
import { useUpsertDeal, useDeleteDeal } from './queries'
import { toast } from '@/stores/toast'
import type { Pipeline } from '@/types/database'

interface DealDialogProps {
  open: boolean
  onClose: () => void
  initial?: Pipeline | null
  defaultPhase?: string
}

export function DealDialog({ open, onClose, initial, defaultPhase }: DealDialogProps) {
  const [company, setCompany] = useState('')
  const [contactName, setContactName] = useState('')
  const [value, setValue] = useState('0')
  const [phase, setPhase] = useState('prospekt')
  const [dealDate, setDealDate] = useState('')
  const [note, setNote] = useState('')

  const upsert = useUpsertDeal()
  const del = useDeleteDeal()

  useEffect(() => {
    if (!open) return
    setCompany(initial?.company ?? '')
    setContactName(initial?.contact_name ?? '')
    setValue(String(initial?.value ?? 0))
    setPhase(initial?.phase ?? defaultPhase ?? 'prospekt')
    setDealDate(initial?.deal_date ?? '')
    setNote(initial?.note ?? '')
  }, [open, initial, defaultPhase])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!company.trim()) {
      toast.error('Företagsnamn krävs')
      return
    }
    try {
      await upsert.mutateAsync({
        ...(initial?.id ? { id: initial.id } : {}),
        company: company.trim(),
        contact_name: contactName || null,
        value: Number(value) || 0,
        phase,
        deal_date: dealDate || null,
        note: note || null,
      })
      toast.success(initial ? 'Deal uppdaterad' : 'Deal skapad')
      onClose()
    } catch (err) {
      toast.error('Något gick fel', err instanceof Error ? err.message : undefined)
    }
  }

  const handleDelete = async () => {
    if (!initial) return
    if (!confirm(`Ta bort deal "${initial.company}"?`)) return
    try {
      await del.mutateAsync(initial.id)
      toast.success('Deal borttagen')
      onClose()
    } catch (err) {
      toast.error('Kunde inte ta bort', err instanceof Error ? err.message : undefined)
    }
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={initial ? 'Redigera deal' : 'Ny deal'}
      description={initial ? initial.company : 'Lägg till en ny deal i pipelinen'}
      size="md"
      footer={
        <>
          {initial && (
            <Button
              variant="ghost"
              onClick={handleDelete}
              disabled={upsert.isPending}
              className="text-[var(--color-danger)] mr-auto"
            >
              Ta bort
            </Button>
          )}
          <Button variant="ghost" onClick={onClose} disabled={upsert.isPending}>
            Avbryt
          </Button>
          <Button form="deal-form" type="submit" variant="primary" disabled={upsert.isPending}>
            {upsert.isPending ? 'Sparar…' : initial ? 'Spara' : 'Skapa'}
          </Button>
        </>
      }
    >
      <form id="deal-form" onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
        <Field label="Företag" className="col-span-2">
          <Input
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            placeholder="Exempel AB"
            autoFocus
            required
          />
        </Field>
        <Field label="Kontaktperson">
          <Input
            value={contactName}
            onChange={(e) => setContactName(e.target.value)}
            placeholder="Anna Andersson"
          />
        </Field>
        <Field label="Värde (kr)">
          <Input
            type="number"
            min="0"
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
        </Field>
        <Field label="Fas">
          <Select value={phase} onChange={(e) => setPhase(e.target.value)}>
            {PHASES.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Deal-datum">
          <Input
            type="date"
            value={dealDate}
            onChange={(e) => setDealDate(e.target.value)}
          />
        </Field>
        <Field label="Anteckning" className="col-span-2">
          <Textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Detaljer om dealen…"
          />
        </Field>
      </form>
    </Dialog>
  )
}
