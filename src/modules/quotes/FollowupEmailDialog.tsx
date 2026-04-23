import { useEffect, useState } from 'react'
import { Loader2, Copy, Check, Mail, Sparkles, RefreshCw } from 'lucide-react'
import { Dialog } from '@/components/ui/Dialog'
import { Input, Textarea, Field } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { toast } from '@/stores/toast'
import type { Quote } from '@/types/database'
import { useFollowupEmail, type EmailResult } from './coachQueries'

interface Props {
  open: boolean
  onClose: () => void
  quote: Quote
}

export function FollowupEmailDialog({ open, onClose, quote }: Props) {
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [copiedField, setCopiedField] = useState<'subject' | 'body' | null>(null)
  const gen = useFollowupEmail()

  const generate = async () => {
    try {
      const res: EmailResult = await gen.mutateAsync(quote)
      setSubject(res.subject)
      setBody(res.body)
    } catch (err) {
      toast.error(
        'Kunde inte generera mejl',
        err instanceof Error ? err.message : undefined,
      )
    }
  }

  /* Auto-generate when dialog opens and there's no draft yet */
  useEffect(() => {
    if (open && !subject && !body && !gen.isPending) {
      generate()
    }
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, [open])

  /* Reset when closing */
  useEffect(() => {
    if (!open) {
      setSubject('')
      setBody('')
      setCopiedField(null)
    }
  }, [open])

  const copy = async (field: 'subject' | 'body', value: string) => {
    try {
      await navigator.clipboard.writeText(value)
      setCopiedField(field)
      setTimeout(() => setCopiedField(null), 1800)
    } catch {
      toast.error('Kunde inte kopiera')
    }
  }

  const openInMail = () => {
    if (!quote.contact_email) {
      toast.error('Ingen e-post angiven på offerten')
      return
    }
    const url = `mailto:${encodeURIComponent(quote.contact_email)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    window.location.href = url
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="AI-genererat uppföljningsmejl"
      size="lg"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Stäng
          </Button>
          <Button
            variant="secondary"
            onClick={generate}
            disabled={gen.isPending}
          >
            <RefreshCw size={13} />
            Generera igen
          </Button>
          <Button
            variant="primary"
            onClick={openInMail}
            disabled={!subject || !body || !quote.contact_email}
          >
            <Mail size={13} />
            Öppna i mail
          </Button>
        </>
      }
    >
      <div className="space-y-3">
        <div className="flex items-start gap-2.5 p-3 rounded-[10px] bg-[color-mix(in_oklch,var(--accent)_6%,transparent)] border border-[color-mix(in_oklch,var(--accent)_18%,transparent)]">
          <Sparkles
            size={14}
            className="text-[var(--accent)] mt-0.5 shrink-0"
          />
          <div className="text-[12.5px] text-[var(--fg-muted)] leading-[1.5]">
            <span className="text-[var(--fg)] font-medium">Adrian</span> skriver
            ett konsultativt uppföljningsmejl på svenska — kort, värde-öppnare,
            en specifik fråga. Anpassat efter hur länge offerten legat och när
            den löper ut.
          </div>
        </div>

        {gen.isPending && !subject && !body ? (
          <div className="flex items-center justify-center gap-3 py-12 text-[13px] text-[var(--fg-muted)]">
            <Loader2 size={16} className="animate-spin text-[var(--accent)]" />
            Skriver första utkastet…
          </div>
        ) : (
          <>
            <Field
              label={
                <span className="flex items-center justify-between w-full">
                  <span>Ämnesrad</span>
                  <button
                    type="button"
                    onClick={() => copy('subject', subject)}
                    disabled={!subject}
                    className="inline-flex items-center gap-1 text-[10.5px] font-medium text-[var(--fg-muted)] hover:text-[var(--fg)] transition-colors disabled:opacity-40"
                  >
                    {copiedField === 'subject' ? (
                      <Check size={11} />
                    ) : (
                      <Copy size={11} />
                    )}
                    {copiedField === 'subject' ? 'Kopierad' : 'Kopiera'}
                  </button>
                </span>
              }
            >
              <Input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="—"
              />
            </Field>

            <Field
              label={
                <span className="flex items-center justify-between w-full">
                  <span>Meddelande</span>
                  <button
                    type="button"
                    onClick={() => copy('body', body)}
                    disabled={!body}
                    className="inline-flex items-center gap-1 text-[10.5px] font-medium text-[var(--fg-muted)] hover:text-[var(--fg)] transition-colors disabled:opacity-40"
                  >
                    {copiedField === 'body' ? (
                      <Check size={11} />
                    ) : (
                      <Copy size={11} />
                    )}
                    {copiedField === 'body' ? 'Kopierad' : 'Kopiera'}
                  </button>
                </span>
              }
            >
              <Textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={10}
                placeholder="—"
                className="font-sans"
              />
            </Field>

            {!quote.contact_email && (
              <p className="text-[11.5px] text-[var(--color-warning)]">
                Ingen e-postadress finns på offerten — lägg till kontaktens
                e-post för att kunna öppna direkt i mailklienten.
              </p>
            )}
          </>
        )}
      </div>
    </Dialog>
  )
}
