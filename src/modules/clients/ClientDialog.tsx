import { useEffect, useState } from 'react'
import { Dialog } from '@/components/ui/Dialog'
import { Input, Textarea, Field } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { useUpsertClient } from './queries'
import { BILLING_TYPES, CLIENT_STATUS_OPTIONS } from './constants'
import { toast } from '@/stores/toast'
import type { Client } from '@/types/database'

interface ClientDialogProps {
  open: boolean
  onClose: () => void
  initial?: Client | null
}

interface FormState {
  name: string
  contact_name: string
  email: string
  service: string
  client_status: string
  billing_type: string
  mrr: string
  setup_fee: string
  contract_start: string
  contract_value: string
  project_health: number
  description: string
}

const empty: FormState = {
  name: '',
  contact_name: '',
  email: '',
  service: '',
  client_status: 'prospect',
  billing_type: 'monthly',
  mrr: '0',
  setup_fee: '',
  contract_start: '',
  contract_value: '',
  project_health: 0,
  description: '',
}

function toForm(c?: Client | null): FormState {
  if (!c) return empty
  return {
    name: c.name,
    contact_name: c.contact_name ?? '',
    email: c.email ?? '',
    service: c.service ?? '',
    client_status: c.client_status ?? 'prospect',
    billing_type: c.billing_type ?? 'monthly',
    mrr: String(c.mrr ?? 0),
    setup_fee: c.setup_fee != null ? String(c.setup_fee) : '',
    contract_start: c.contract_start ?? '',
    contract_value: c.contract_value != null ? String(c.contract_value) : '',
    project_health: c.project_health ?? 0,
    description: c.description ?? '',
  }
}

export function ClientDialog({ open, onClose, initial }: ClientDialogProps) {
  const [form, setForm] = useState<FormState>(empty)
  const upsert = useUpsertClient()

  useEffect(() => {
    if (open) setForm(toForm(initial))
  }, [open, initial])

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) {
      toast.error('Namn krävs')
      return
    }
    try {
      const parseNumber = (v: string) => (v.trim() === '' ? null : Number(v))
      await upsert.mutateAsync({
        ...(initial?.id ? { id: initial.id } : {}),
        name: form.name.trim(),
        contact_name: form.contact_name || null,
        email: form.email || null,
        service: form.service || null,
        client_status: form.client_status,
        billing_type: form.billing_type,
        mrr: Number(form.mrr) || 0,
        setup_fee: parseNumber(form.setup_fee),
        contract_start: form.contract_start || null,
        contract_value: parseNumber(form.contract_value),
        project_health: Number(form.project_health) || 0,
        description: form.description || null,
      })
      toast.success(initial ? 'Kund uppdaterad' : 'Kund skapad')
      onClose()
    } catch (err) {
      toast.error('Något gick fel', err instanceof Error ? err.message : undefined)
    }
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={initial ? 'Redigera kund' : 'Ny kund'}
      description={initial ? initial.name : 'Lägg till en ny kund i systemet'}
      size="lg"
      footer={
        <>
          <Button type="button" variant="ghost" onClick={onClose} disabled={upsert.isPending}>
            Avbryt
          </Button>
          <Button
            type="submit"
            form="client-form"
            variant="primary"
            disabled={upsert.isPending}
          >
            {upsert.isPending ? 'Sparar…' : initial ? 'Spara' : 'Skapa kund'}
          </Button>
        </>
      }
    >
      <form id="client-form" onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
        <Field label="Kundnamn" className="col-span-2">
          <Input
            value={form.name}
            onChange={(e) => update('name', e.target.value)}
            placeholder="Företagsnamn AB"
            autoFocus
            required
          />
        </Field>
        <Field label="Kontaktperson">
          <Input
            value={form.contact_name}
            onChange={(e) => update('contact_name', e.target.value)}
            placeholder="Anna Andersson"
          />
        </Field>
        <Field label="E-post">
          <Input
            type="email"
            value={form.email}
            onChange={(e) => update('email', e.target.value)}
            placeholder="anna@exempel.se"
          />
        </Field>
        <Field label="Tjänst">
          <Input
            value={form.service}
            onChange={(e) => update('service', e.target.value)}
            placeholder="AI-konsultation"
          />
        </Field>
        <Field label="Status">
          <Select
            value={form.client_status}
            onChange={(e) => update('client_status', e.target.value)}
          >
            {CLIENT_STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="MRR (kr)">
          <Input
            type="number"
            min="0"
            value={form.mrr}
            onChange={(e) => update('mrr', e.target.value)}
          />
        </Field>
        <Field label="Faktureringsmodell">
          <Select
            value={form.billing_type}
            onChange={(e) => update('billing_type', e.target.value)}
          >
            {BILLING_TYPES.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Startavgift (kr)">
          <Input
            type="number"
            min="0"
            value={form.setup_fee}
            onChange={(e) => update('setup_fee', e.target.value)}
          />
        </Field>
        <Field label="Kontraktsstart">
          <Input
            type="date"
            value={form.contract_start}
            onChange={(e) => update('contract_start', e.target.value)}
          />
        </Field>
        <Field label="Kontraktsvärde (kr)">
          <Input
            type="number"
            min="0"
            value={form.contract_value}
            onChange={(e) => update('contract_value', e.target.value)}
          />
        </Field>
        <Field label={`Projekthälsa — ${form.project_health}%`} className="col-span-2">
          <input
            type="range"
            min="0"
            max="100"
            step="1"
            value={form.project_health}
            onChange={(e) => update('project_health', Number(e.target.value))}
            className="w-full accent-[var(--accent)]"
          />
        </Field>
        <Field label="Beskrivning" className="col-span-2">
          <Textarea
            value={form.description}
            onChange={(e) => update('description', e.target.value)}
            placeholder="Kort beskrivning av uppdraget…"
          />
        </Field>
      </form>
    </Dialog>
  )
}
