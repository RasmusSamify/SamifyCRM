import { useState } from 'react'
import {
  Sparkles,
  Loader2,
  RefreshCw,
  AlertTriangle,
  Check,
  Target,
  Copy,
  type LucideIcon,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/cn'
import { toast } from '@/stores/toast'
import type { Quote } from '@/types/database'
import { useSalesCoach, type CoachResult } from './coachQueries'

interface Props {
  quote: Quote
}

export function SalesCoachSection({ quote }: Props) {
  const [result, setResult] = useState<CoachResult | null>(null)
  const coach = useSalesCoach()

  const generate = async () => {
    try {
      const res = await coach.mutateAsync(quote)
      setResult(res)
    } catch (err) {
      toast.error(
        'Coach misslyckades',
        err instanceof Error ? err.message : undefined,
      )
    }
  }

  return (
    <section className="col-span-2 rounded-[12px] border border-[color-mix(in_oklch,var(--accent)_22%,transparent)] bg-[color-mix(in_oklch,var(--accent)_5%,var(--surface))] overflow-hidden">
      {/* Header */}
      <header className="flex items-center justify-between gap-3 px-4 py-3 border-b border-[color-mix(in_oklch,var(--accent)_18%,transparent)]">
        <div className="flex items-center gap-2">
          <div
            className="h-7 w-7 rounded-md flex items-center justify-center"
            style={{
              background: 'color-mix(in oklch, var(--accent) 15%, transparent)',
              color: 'var(--accent)',
            }}
          >
            <Sparkles size={13} />
          </div>
          <div>
            <div className="text-[12px] font-semibold text-[var(--fg)]">
              AI-säljcoach
            </div>
            <div className="text-[11px] text-[var(--fg-muted)]">
              Adrian · SPIN / Challenger / svensk B2B SaaS
            </div>
          </div>
        </div>
        <Button
          type="button"
          size="sm"
          variant={result ? 'ghost' : 'primary'}
          onClick={generate}
          disabled={coach.isPending}
        >
          {coach.isPending ? (
            <>
              <Loader2 size={13} className="animate-spin" />
              Analyserar…
            </>
          ) : result ? (
            <>
              <RefreshCw size={13} />
              Generera igen
            </>
          ) : (
            <>
              <Sparkles size={13} />
              Analysera offerten
            </>
          )}
        </Button>
      </header>

      {/* Body */}
      <div className="p-4 space-y-4">
        {!result && !coach.isPending && (
          <p className="text-[12.5px] text-[var(--fg-muted)] leading-[1.55]">
            Få en skarp säljanalys av offerten: vad är styrkorna, var finns
            risken, och exakt vilket nästa steg ger dig bäst chans att stänga?
            Adrian läser in allt — pris, paket, dagar sedan skickad, giltighet
            — och ger ett telefonmanus du kan använda direkt.
          </p>
        )}

        {coach.isPending && (
          <div className="flex items-center gap-3 py-6 text-[13px] text-[var(--fg-muted)]">
            <Loader2 size={16} className="animate-spin text-[var(--accent)]" />
            Läser in offerten och formulerar rådgivning…
          </div>
        )}

        {result && <CoachBody result={result} />}
      </div>
    </section>
  )
}

/* ============================================================
   Body
   ============================================================ */

function CoachBody({ result }: { result: CoachResult }) {
  return (
    <div className="space-y-4">
      {/* Analysis */}
      <p className="text-[14px] text-[var(--fg)] leading-[1.55] italic">
        "{result.analysis}"
      </p>

      {/* Strengths & Concerns */}
      <div className="grid grid-cols-2 gap-3">
        <BulletCard
          icon={Check}
          title="Styrkor"
          items={result.strengths}
          color="var(--color-success)"
        />
        <BulletCard
          icon={AlertTriangle}
          title="Risker att hantera"
          items={result.concerns}
          color="var(--color-warning)"
        />
      </div>

      {/* Next action — featured */}
      <div
        className="rounded-[10px] p-4 border"
        style={{
          background:
            'linear-gradient(135deg, color-mix(in oklch, var(--accent) 12%, transparent), color-mix(in oklch, var(--accent) 4%, transparent))',
          borderColor: 'color-mix(in oklch, var(--accent) 30%, transparent)',
        }}
      >
        <div className="flex items-center gap-2 mb-2">
          <Target size={13} className="text-[var(--accent)]" />
          <span className="text-[10.5px] font-semibold text-[var(--accent)] uppercase tracking-[0.14em]">
            Nästa steg
          </span>
        </div>
        <div className="text-[14.5px] font-semibold text-[var(--fg)] leading-tight">
          {result.nextAction.title}
        </div>
        <p className="mt-1.5 text-[12.5px] text-[var(--fg-muted)] leading-[1.55]">
          {result.nextAction.why}
        </p>

        <div className="mt-3 pt-3 border-t border-[color-mix(in_oklch,var(--accent)_20%,transparent)]">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10.5px] font-semibold text-[var(--fg-muted)] uppercase tracking-[0.14em]">
              Öppningsrepliken
            </span>
            <CopyButton text={result.nextAction.script} />
          </div>
          <blockquote className="text-[13px] text-[var(--fg)] leading-[1.6] italic border-l-2 border-[var(--accent)] pl-3">
            {result.nextAction.script}
          </blockquote>
        </div>
      </div>

      {/* Risks */}
      {result.risks.length > 0 && (
        <div className="space-y-1.5">
          <div className="text-[10.5px] font-semibold text-[var(--fg-muted)] uppercase tracking-[0.14em]">
            Signaler
          </div>
          {result.risks.map((r, i) => (
            <RiskBadge key={i} level={r.level} text={r.text} />
          ))}
        </div>
      )}
    </div>
  )
}

function BulletCard({
  icon: Icon,
  title,
  items,
  color,
}: {
  icon: LucideIcon
  title: string
  items: string[]
  color: string
}) {
  return (
    <div className="rounded-[10px] border border-[var(--border)] bg-[var(--surface)]/60 p-3">
      <div className="flex items-center gap-1.5 mb-2">
        <Icon size={12} style={{ color }} />
        <span className="text-[10.5px] font-semibold text-[var(--fg-muted)] uppercase tracking-[0.14em]">
          {title}
        </span>
      </div>
      <ul className="space-y-1.5">
        {items.map((it, i) => (
          <li
            key={i}
            className="text-[12.5px] text-[var(--fg)] leading-[1.5] relative pl-3 before:absolute before:left-0 before:top-[9px] before:h-1 before:w-1 before:rounded-full"
            style={
              {
                '--bullet-color': color,
              } as React.CSSProperties
            }
          >
            <span
              className="absolute left-0 top-[9px] h-1 w-1 rounded-full"
              style={{ background: color }}
            />
            {it}
          </li>
        ))}
      </ul>
    </div>
  )
}

function RiskBadge({
  level,
  text,
}: {
  level: 'high' | 'medium' | 'low'
  text: string
}) {
  const color =
    level === 'high'
      ? 'var(--color-danger)'
      : level === 'medium'
        ? 'var(--color-warning)'
        : 'var(--color-info)'
  return (
    <div
      className={cn(
        'flex items-start gap-2 px-2.5 py-1.5 rounded-[7px] text-[12px] leading-[1.5]',
      )}
      style={{
        background: `color-mix(in oklch, ${color} 9%, transparent)`,
        color: 'var(--fg)',
      }}
    >
      <span
        className="mt-1 h-1.5 w-1.5 rounded-full shrink-0"
        style={{ background: color }}
      />
      <span>{text}</span>
    </div>
  )
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      toast.error('Kunde inte kopiera')
    }
  }
  return (
    <button
      type="button"
      onClick={copy}
      className="inline-flex items-center gap-1 text-[10.5px] font-medium text-[var(--fg-muted)] hover:text-[var(--fg)] transition-colors"
    >
      {copied ? <Check size={11} /> : <Copy size={11} />}
      {copied ? 'Kopierad' : 'Kopiera'}
    </button>
  )
}
