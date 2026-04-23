import { useEffect, useMemo, useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { Dialog } from '@/components/ui/Dialog'
import { Input, Textarea, Field } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { useUpsertQuote, useDeleteQuote } from './queries'
import { toast } from '@/stores/toast'
import { formatSEK } from '@/lib/format'
import type { Quote, Json } from '@/types/database'

const STATUSES = [
  { value: 'draft', label: 'Utkast' },
  { value: 'sent', label: 'Skickad' },
  { value: 'accepted', label: 'Accepterad' },
  { value: 'declined', label: 'Avböjd' },
]

function generatePublicToken(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID().replace(/-/g, '').slice(0, 24)
  }
  return Array.from({ length: 24 }, () => Math.floor(Math.random() * 36).toString(36)).join('')
}

interface QuoteItem {
  name: string
  desc?: string
}

function parseItems(raw: Json | null | undefined): QuoteItem[] {
  if (!raw) return []
  if (Array.isArray(raw)) {
    return raw.flatMap((item) => {
      if (typeof item === 'string') return [{ name: item }]
      if (item && typeof item === 'object' && 'name' in item) {
        const { name, desc } = item as { name?: unknown; desc?: unknown }
        return typeof name === 'string' ? [{ name, desc: typeof desc === 'string' ? desc : undefined }] : []
      }
      return []
    })
  }
  return []
}

interface QuoteDialogProps {
  open: boolean
  onClose: () => void
  initial?: Quote | null
}

export function QuoteDialog({ open, onClose, initial }: QuoteDialogProps) {
  const [clientName, setClientName] = useState('')
  const [contactName, setContactName] = useState('')
  const [contactEmail, setContactEmail] = useState('')
  const [setupFee, setSetupFee] = useState('')
  const [monthlyFee, setMonthlyFee] = useState('')
  const [validUntil, setValidUntil] = useState('')
  const [status, setStatus] = useState('draft')
  const [note, setNote] = useState('')
  const [items, setItems] = useState<QuoteItem[]>([])

  const upsert = useUpsertQuote()
  const del = useDeleteQuote()

  useEffect(() => {
    if (!open) return
    setClientName(initial?.client_name ?? '')
    setContactName(initial?.contact_name ?? '')
    setContactEmail(initial?.contact_email ?? '')
    setSetupFee(initial?.setup_fee != null ? String(initial.setup_fee) : '')
    setMonthlyFee(initial?.monthly_fee != null ? String(initial.monthly_fee) : '')
    setValidUntil(initial?.valid_until ?? '')
    setStatus(initial?.status ?? 'draft')
    setNote(initial?.note ?? '')
    setItems(parseItems(initial?.items))
  }, [open, initial])

  const yearOneTotal = useMemo(() => {
    const setup = Number(setupFee) || 0
    const monthly = Number(monthlyFee) || 0
    return setup + monthly * 12
  }, [setupFee, monthlyFee])

  const updateItem = (index: number, patch: Partial<QuoteItem>) =>
    setItems((arr) => arr.map((it, i) => (i === index ? { ...it, ...patch } : it)))
  const removeItem = (index: number) =>
    setItems((arr) => arr.filter((_, i) => i !== index))
  const addItem = () => setItems((arr) => [...arr, { name: '' }])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!clientName.trim()) {
      toast.error('Kund krävs')
      return
    }
    const cleanItems = items.filter((it) => it.name.trim())
    try {
      await upsert.mutateAsync({
        ...(initial?.id ? { id: initial.id } : {}),
        client_name: clientName.trim(),
        contact_name: contactName || null,
        contact_email: contactEmail || null,
        setup_fee: setupFee.trim() === '' ? null : Number(setupFee),
        monthly_fee: monthlyFee.trim() === '' ? null : Number(monthlyFee),
        total: yearOneTotal,
        valid_until: validUntil || null,
        status,
        note: note || null,
        items: cleanItems as unknown as Json,
        ...(initial?.public_token
          ? {}
          : { public_token: generatePublicToken() }),
      })
      toast.success(initial ? 'Offert uppdaterad' : 'Offert skapad')
      onClose()
    } catch (err) {
      toast.error('Något gick fel', err instanceof Error ? err.message : undefined)
    }
  }

  const handleDelete = async () => {
    if (!initial) return
    if (!confirm(`Ta bort offerten för ${initial.client_name}?`)) return
    try {
      await del.mutateAsync(initial.id)
      toast.success('Offert borttagen')
      onClose()
    } catch {
      toast.error('Kunde inte ta bort')
    }
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={initial ? 'Redigera offert' : 'Ny offert'}
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
          <Button form="quote-form" type="submit" variant="primary" disabled={upsert.isPending}>
            {upsert.isPending ? 'Sparar…' : initial ? 'Spara' : 'Skapa'}
          </Button>
        </>
      }
    >
      <form id="quote-form" onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
        <Field label="Kund" className="col-span-2">
          <Input value={clientName} onChange={(e) => setClientName(e.target.value)} required autoFocus />
        </Field>
        <Field label="Kontaktperson">
          <Input value={contactName} onChange={(e) => setContactName(e.target.value)} />
        </Field>
        <Field label="E-post">
          <Input type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} />
        </Field>
        <Field label="Startavgift (kr)">
          <Input
            type="number"
            min="0"
            value={setupFee}
            onChange={(e) => setSetupFee(e.target.value)}
          />
        </Field>
        <Field label="Månadsavgift (kr)">
          <Input
            type="number"
            min="0"
            value={monthlyFee}
            onChange={(e) => setMonthlyFee(e.target.value)}
          />
        </Field>
        <Field label="Giltig till">
          <Input
            type="date"
            value={validUntil}
            onChange={(e) => setValidUntil(e.target.value)}
          />
        </Field>
        <Field label="Status">
          <Select value={status} onChange={(e) => setStatus(e.target.value)}>
            {STATUSES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </Select>
        </Field>

        {/* Items */}
        <div className="col-span-2">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11.5px] font-medium text-[var(--fg-muted)] uppercase tracking-[0.12em]">
              Artiklar
            </span>
            <Button type="button" variant="ghost" size="sm" onClick={addItem}>
              <Plus size={13} />
              Lägg till rad
            </Button>
          </div>
          <div className="space-y-2">
            {items.length === 0 && (
              <p className="text-[12.5px] text-[var(--fg-subtle)] py-2">
                Inga artiklar tillagda än.
              </p>
            )}
            {items.map((it, i) => (
              <div key={i} className="flex items-start gap-2">
                <Input
                  value={it.name}
                  onChange={(e) => updateItem(i, { name: e.target.value })}
                  placeholder="Artikelnamn"
                  className="flex-1"
                />
                <Input
                  value={it.desc ?? ''}
                  onChange={(e) => updateItem(i, { desc: e.target.value })}
                  placeholder="Beskrivning"
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeItem(i)}
                  aria-label="Ta bort rad"
                >
                  <Trash2 size={13} className="text-[var(--fg-subtle)]" />
                </Button>
              </div>
            ))}
          </div>
        </div>

        <Field label="Anteckning" className="col-span-2">
          <Textarea value={note} onChange={(e) => setNote(e.target.value)} />
        </Field>

        <div className="col-span-2 flex items-center justify-between px-4 py-3 rounded-[10px] border border-[var(--border)] bg-[var(--surface-2)]/50">
          <span className="text-[12.5px] text-[var(--fg-muted)]">
            Totalt år 1 (startavgift + 12 × månad)
          </span>
          <span className="text-num text-[17px] font-semibold text-[var(--accent)]">
            {formatSEK(yearOneTotal)}
          </span>
        </div>
      </form>
    </Dialog>
  )
}
