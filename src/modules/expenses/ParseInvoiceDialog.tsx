import { useState, useRef, type DragEvent } from 'react'
import {
  Upload,
  Mail,
  FileText,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  X,
} from 'lucide-react'
import { Dialog } from '@/components/ui/Dialog'
import { Textarea, Input, Field } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { cn } from '@/lib/cn'
import { formatSEK, formatDate } from '@/lib/format'
import { toast } from '@/stores/toast'
import { fileToBase64, useParseInvoice, type ExtractedInvoice } from './parseQueries'

interface ParseInvoiceDialogProps {
  open: boolean
  onClose: () => void
  onExtracted: (extracted: ExtractedInvoice) => void
}

type Mode = 'pdf' | 'text'

export function ParseInvoiceDialog({ open, onClose, onExtracted }: ParseInvoiceDialogProps) {
  const [mode, setMode] = useState<Mode>('pdf')
  const [file, setFile] = useState<File | null>(null)
  const [emailSubject, setEmailSubject] = useState('')
  const [emailText, setEmailText] = useState('')
  const [extracted, setExtracted] = useState<ExtractedInvoice | null>(null)
  const [dragging, setDragging] = useState(false)
  const fileInput = useRef<HTMLInputElement>(null)

  const parse = useParseInvoice()

  const reset = () => {
    setFile(null)
    setEmailSubject('')
    setEmailText('')
    setExtracted(null)
    parse.reset()
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  const handleFile = (f: File) => {
    if (f.type !== 'application/pdf' && !f.name.toLowerCase().endsWith('.pdf')) {
      toast.error('Endast PDF stöds', 'Spara fakturan som PDF och försök igen.')
      return
    }
    if (f.size > 10 * 1024 * 1024) {
      toast.error('Filen är för stor', 'Maxstorlek 10 MB.')
      return
    }
    setFile(f)
    setExtracted(null)
  }

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragging(false)
    const f = e.dataTransfer.files?.[0]
    if (f) handleFile(f)
  }

  const handleAnalyze = async () => {
    try {
      let result: ExtractedInvoice
      if (mode === 'pdf') {
        if (!file) {
          toast.error('Ingen PDF vald')
          return
        }
        const base64 = await fileToBase64(file)
        result = await parse.mutateAsync({ mode: 'pdf', pdfBase64: base64, filename: file.name })
      } else {
        if (!emailText.trim()) {
          toast.error('Ingen mailtext')
          return
        }
        result = await parse.mutateAsync({
          mode: 'text',
          emailText: emailText.trim(),
          emailSubject: emailSubject.trim() || undefined,
        })
      }
      setExtracted(result)
    } catch (err) {
      toast.error('Parsning misslyckades', err instanceof Error ? err.message : undefined)
    }
  }

  const handleConfirm = () => {
    if (extracted) {
      onExtracted(extracted)
      reset()
      onClose()
    }
  }

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      title="Parsa leverantörsfaktura"
      description="Dra in en PDF eller klistra in ett fakturamail — AI extraherar data automatiskt."
      size="lg"
      footer={
        <>
          <Button variant="ghost" onClick={handleClose} disabled={parse.isPending}>
            Avbryt
          </Button>
          {extracted ? (
            <Button variant="primary" onClick={handleConfirm}>
              <CheckCircle2 size={14} />
              Öppna kostnad
            </Button>
          ) : (
            <Button
              variant="primary"
              onClick={handleAnalyze}
              disabled={parse.isPending || (mode === 'pdf' ? !file : !emailText.trim())}
            >
              {parse.isPending ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Analyserar…
                </>
              ) : (
                <>
                  <Sparkles size={14} />
                  Analysera
                </>
              )}
            </Button>
          )}
        </>
      }
    >
      {!extracted && (
        <>
          {/* Mode tabs */}
          <div className="flex items-center gap-1 p-1 rounded-[10px] bg-[var(--bg)] border border-[var(--border)] mb-5">
            <ModeTab active={mode === 'pdf'} onClick={() => setMode('pdf')} icon={FileText}>
              PDF-faktura
            </ModeTab>
            <ModeTab active={mode === 'text'} onClick={() => setMode('text')} icon={Mail}>
              Mailtext
            </ModeTab>
          </div>

          {mode === 'pdf' && (
            <div>
              {file ? (
                <div className="flex items-center gap-3 p-4 rounded-[12px] border border-[var(--border)] bg-[var(--surface-2)]/50">
                  <div className="h-10 w-10 rounded-lg flex items-center justify-center bg-[color-mix(in_oklch,var(--accent)_12%,transparent)] border border-[color-mix(in_oklch,var(--accent)_25%,transparent)] shrink-0">
                    <FileText size={16} className="text-[var(--accent)]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13.5px] font-medium text-[var(--fg)] truncate">
                      {file.name}
                    </div>
                    <div className="text-[11.5px] text-[var(--fg-subtle)] mt-0.5">
                      {(file.size / 1024).toFixed(1)} KB · PDF
                    </div>
                  </div>
                  <Button
                    size="icon-sm"
                    variant="ghost"
                    onClick={() => setFile(null)}
                    aria-label="Ta bort fil"
                  >
                    <X size={13} />
                  </Button>
                </div>
              ) : (
                <div
                  onDragOver={(e) => {
                    e.preventDefault()
                    setDragging(true)
                  }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInput.current?.click()}
                  className={cn(
                    'relative rounded-[12px] border-2 border-dashed p-10 text-center cursor-pointer transition-all',
                    dragging
                      ? 'border-[var(--accent)] bg-[color-mix(in_oklch,var(--accent)_6%,transparent)]'
                      : 'border-[var(--border-strong)] hover:border-[var(--accent)] hover:bg-[var(--surface-2)]/40',
                  )}
                >
                  <input
                    ref={fileInput}
                    type="file"
                    accept="application/pdf,.pdf"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0]
                      if (f) handleFile(f)
                    }}
                  />
                  <div className="inline-flex h-12 w-12 rounded-2xl bg-[var(--surface-2)] border border-[var(--border-strong)] items-center justify-center mb-3">
                    <Upload size={18} className="text-[var(--accent)]" strokeWidth={1.75} />
                  </div>
                  <div className="text-[14px] font-medium text-[var(--fg)]">
                    Dra in PDF-fakturan här
                  </div>
                  <div className="mt-1 text-[12.5px] text-[var(--fg-muted)]">
                    eller klicka för att välja fil · max 10 MB
                  </div>
                </div>
              )}
            </div>
          )}

          {mode === 'text' && (
            <div className="space-y-3">
              <Field label="Ämne (valfritt)">
                <Input
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  placeholder="Your Anthropic invoice for March 2026"
                />
              </Field>
              <Field label="Mailinnehåll">
                <Textarea
                  value={emailText}
                  onChange={(e) => setEmailText(e.target.value)}
                  placeholder="Klistra in hela mailet här — AI:n läser igenom det och extraherar belopp, leverantör, datum, valuta, etc."
                  rows={12}
                  className="min-h-[220px]"
                />
              </Field>
              <p className="text-[11.5px] text-[var(--fg-subtle)]">
                Tips: I Gmail, markera mailet → ⋮ → Visa original, eller bara ”Vidarebefordra” och
                kopiera kroppen.
              </p>
            </div>
          )}
        </>
      )}

      {extracted && <ExtractedPreview extracted={extracted} />}
    </Dialog>
  )
}

function ModeTab({
  active,
  onClick,
  icon: Icon,
  children,
}: {
  active: boolean
  onClick: () => void
  icon: React.ComponentType<{ size?: number; className?: string }>
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex-1 flex items-center justify-center gap-2 h-9 rounded-[8px] text-[13px] font-medium transition-all',
        active
          ? 'bg-[var(--surface-2)] text-[var(--fg)] shadow-[inset_0_0_0_1px_var(--border)]'
          : 'text-[var(--fg-muted)] hover:text-[var(--fg)]',
      )}
    >
      <Icon size={13} />
      {children}
    </button>
  )
}

function ExtractedPreview({ extracted }: { extracted: ExtractedInvoice }) {
  const confMeta = {
    high: { label: 'Hög säkerhet', tone: 'success' as const },
    medium: { label: 'Medel säkerhet', tone: 'warning' as const },
    low: { label: 'Låg säkerhet', tone: 'danger' as const },
  }[extracted.confidence]

  return (
    <div className="space-y-4 animate-slide-up">
      <div className="flex items-center gap-2">
        <CheckCircle2 size={14} className="text-[var(--color-success)]" />
        <span className="text-[13px] font-medium text-[var(--fg)]">Fakturadata extraherad</span>
        <Badge variant={confMeta.tone}>{confMeta.label}</Badge>
      </div>

      {extracted.confidence === 'low' && (
        <div className="flex items-start gap-2.5 p-3 rounded-[10px] border border-[color-mix(in_oklch,var(--color-warning)_30%,transparent)] bg-[color-mix(in_oklch,var(--color-warning)_10%,transparent)]">
          <AlertCircle size={14} className="text-[var(--color-warning)] shrink-0 mt-0.5" />
          <p className="text-[12.5px] text-[var(--fg)]">
            Osäker extraktion — granska alla fält noga innan du sparar.
          </p>
        </div>
      )}

      <div className="rounded-[12px] border border-[var(--border)] bg-[var(--surface-2)]/50 divide-y divide-[var(--border)]">
        <PreviewRow label="Leverantör" value={extracted.vendor || '—'} highlight />
        <PreviewRow
          label="Belopp"
          value={
            extracted.currency === 'SEK'
              ? formatSEK(extracted.amount_original)
              : `${extracted.amount_original.toLocaleString('sv-SE')} ${extracted.currency}`
          }
          highlight
        />
        {extracted.currency !== 'SEK' && (
          <PreviewRow
            label="Omräknat till SEK"
            value={
              extracted.fx_rate_used
                ? `${formatSEK(extracted.amount_sek)}  (kurs ${extracted.fx_rate_used.toFixed(3)})`
                : `${formatSEK(extracted.amount_sek)}  (fallback: originalvärde)`
            }
          />
        )}
        <PreviewRow label="Fakturadatum" value={extracted.date ? formatDate(extracted.date) : '—'} />
        <PreviewRow
          label="Typ"
          value={
            extracted.is_recurring
              ? `Återkommande · ${cycleLabel(extracted.billing_cycle)}`
              : 'Engångsutgift'
          }
        />
        <PreviewRow label="Föreslagen kategori" value={extracted.suggested_category} />
        {extracted.url && <PreviewRow label="URL" value={extracted.url} />}
        {extracted.description && <PreviewRow label="Beskrivning" value={extracted.description} />}
        {extracted.notes && <PreviewRow label="Anteckning" value={extracted.notes} />}
      </div>
    </div>
  )
}

function PreviewRow({
  label,
  value,
  highlight,
}: {
  label: string
  value: string
  highlight?: boolean
}) {
  return (
    <div className="flex items-start gap-4 px-4 py-3">
      <span className="text-[11px] font-semibold text-[var(--fg-subtle)] uppercase tracking-[0.12em] w-40 shrink-0 mt-0.5">
        {label}
      </span>
      <span
        className={cn(
          'text-[13.5px] flex-1 min-w-0 break-words',
          highlight ? 'text-[var(--fg)] font-semibold' : 'text-[var(--fg-muted)]',
        )}
      >
        {value}
      </span>
    </div>
  )
}

function cycleLabel(c: 'monthly' | 'yearly' | 'quarterly' | null) {
  if (c === 'yearly') return 'årligt'
  if (c === 'quarterly') return 'kvartalsvis'
  if (c === 'monthly') return 'månadsvis'
  return 'okänt intervall'
}
