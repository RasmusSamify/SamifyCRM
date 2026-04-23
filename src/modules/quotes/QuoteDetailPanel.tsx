import { useEffect, useMemo, useState } from 'react'
import { Plus, Trash2, Mail, X, ExternalLink } from 'lucide-react'
import { Input, Textarea, Field } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { useUpsertQuote, useDeleteQuote } from './queries'
import { scheduleFollowupReminders } from './coachQueries'
import { SalesCoachSection } from './SalesCoachSection'
import { FollowupEmailDialog } from './FollowupEmailDialog'
import { toast } from '@/stores/toast'
import { formatSEK } from '@/lib/format'
import type { Quote, Json } from '@/types/database'

const STATUSES = [
  { value: 'draft', label: 'Utkast' },
  { value: 'sent', label: 'Skickad' },
  { value: 'accepted', label: 'Accepterad' },
  { value: 'declined', label: 'Avböjd' },
]

const STATUS_META: Record<
  string,
  { label: string; tone: 'default' | 'success' | 'warning' | 'danger' | 'violet' }
> = {
  draft: { label: 'Utkast', tone: 'default' },
  sent: { label: 'Skickad', tone: 'violet' },
  accepted: { label: 'Accepterad', tone: 'success' },
  declined: { label: 'Avböjd', tone: 'danger' },
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
        return typeof name === 'string'
          ? [{ name, desc: typeof desc === 'string' ? desc : undefined }]
          : []
      }
      return []
    })
  }
  return []
}

interface Props {
  quote: Quote
  onClose: () => void
}

export function QuoteDetailPanel({ quote, onClose }: Props) {
  const [clientName, setClientName] = useState('')
  const [contactName, setContactName] = useState('')
  const [contactEmail, setContactEmail] = useState('')
  const [setupFee, setSetupFee] = useState('')
  const [monthlyFee, setMonthlyFee] = useState('')
  const [validUntil, setValidUntil] = useState('')
  const [status, setStatus] = useState('draft')
  const [note, setNote] = useState('')
  const [items, setItems] = useState<QuoteItem[]>([])
  const [emailOpen, setEmailOpen] = useState(false)

  const upsert = useUpsertQuote()
  const del = useDeleteQuote()

  /* Re-initialize form when a different quote is clicked */
  useEffect(() => {
    setClientName(quote.client_name ?? '')
    setContactName(quote.contact_name ?? '')
    setContactEmail(quote.contact_email ?? '')
    setSetupFee(quote.setup_fee != null ? String(quote.setup_fee) : '')
    setMonthlyFee(quote.monthly_fee != null ? String(quote.monthly_fee) : '')
    setValidUntil(quote.valid_until ?? '')
    setStatus(quote.status ?? 'draft')
    setNote(quote.note ?? '')
    setItems(parseItems(quote.items))
  }, [quote.id])

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
      const saved = await upsert.mutateAsync({
        id: quote.id,
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
      })

      const transitionedToSent =
        status === 'sent' && quote.status !== 'sent' && saved
      if (transitionedToSent) {
        try {
          const added = await scheduleFollowupReminders(saved as Quote)
          toast.success(
            'Offert uppdaterad',
            added > 0
              ? `${added} uppföljning${added === 1 ? '' : 'ar'} automatiskt schemalagda.`
              : undefined,
          )
        } catch {
          toast.success('Offert uppdaterad')
        }
      } else {
        toast.success('Offert uppdaterad')
      }
    } catch (err) {
      toast.error('Något gick fel', err instanceof Error ? err.message : undefined)
    }
  }

  const handleDelete = async () => {
    if (!confirm(`Ta bort offerten för ${quote.client_name}?`)) return
    try {
      await del.mutateAsync(quote.id)
      toast.success('Offert borttagen')
      onClose()
    } catch {
      toast.error('Kunde inte ta bort')
    }
  }

  const statusMeta = STATUS_META[quote.status ?? 'draft'] ?? STATUS_META.draft

  return (
    <>
      <aside
        className="sticky top-[80px] self-start max-h-[calc(100vh-100px)] rounded-[14px] border border-[var(--border-strong)] bg-[var(--surface)] shadow-[var(--shadow-md)] overflow-hidden flex flex-col animate-slide-up"
        aria-label={`Offert för ${quote.client_name}`}
      >
        {/* Header */}
        <div className="shrink-0 flex items-start justify-between gap-4 px-6 py-5 border-b border-[var(--border)]">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Badge
                variant={statusMeta.tone === 'default' ? 'default' : statusMeta.tone}
              >
                {statusMeta.label}
              </Badge>
              <span className="text-[11px] text-[var(--fg-subtle)] font-mono uppercase tracking-[0.12em]">
                Offert
              </span>
            </div>
            <h2 className="text-[18px] font-semibold text-[var(--fg)] tracking-tight truncate">
              {quote.client_name}
            </h2>
            {quote.contact_name && (
              <p className="mt-0.5 text-[13px] text-[var(--fg-muted)] truncate">
                {quote.contact_name}
                {quote.contact_email && (
                  <span className="text-[var(--fg-subtle)]"> · {quote.contact_email}</span>
                )}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {quote.public_token && (
              <a
                href={`/offer/${quote.public_token}`}
                target="_blank"
                rel="noreferrer noopener"
                className="h-8 w-8 rounded-md flex items-center justify-center text-[var(--fg-subtle)] hover:text-[var(--accent)] hover:bg-[var(--surface-2)] transition-colors"
                aria-label="Öppna publik offert"
                title="Öppna publik offert"
              >
                <ExternalLink size={14} />
              </a>
            )}
            <button
              type="button"
              onClick={onClose}
              aria-label="Stäng"
              className="h-8 w-8 rounded-md flex items-center justify-center text-[var(--fg-subtle)] hover:text-[var(--fg)] hover:bg-[var(--surface-2)] transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto">
          <form id="quote-panel-form" onSubmit={handleSubmit} className="p-5 grid grid-cols-2 gap-4">
            <Field label="Kund" className="col-span-2">
              <Input
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                required
              />
            </Field>
            <Field label="Kontaktperson">
              <Input
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
              />
            </Field>
            <Field label="E-post">
              <Input
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
              />
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

            {/* AI sales coach */}
            <SalesCoachSection quote={quote} />
          </form>
        </div>

        {/* Inline action bar */}
        <div className="shrink-0 flex items-center justify-between gap-2 px-5 py-3 border-t border-[var(--border)] bg-[var(--surface-2)]/40">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleDelete}
            className="text-[var(--color-danger)]"
          >
            <Trash2 size={13} />
            Ta bort
          </Button>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setEmailOpen(true)}
            >
              <Mail size={13} />
              Uppföljningsmejl
            </Button>
            <Button
              form="quote-panel-form"
              type="submit"
              variant="primary"
              size="sm"
              disabled={upsert.isPending}
            >
              {upsert.isPending ? 'Sparar…' : 'Spara'}
            </Button>
          </div>
        </div>
      </aside>

      <FollowupEmailDialog
        open={emailOpen}
        onClose={() => setEmailOpen(false)}
        quote={quote}
      />
    </>
  )
}
