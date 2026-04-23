import { useMemo, useState, type ReactNode } from 'react'
import {
  Calendar,
  Lock,
  Shield,
  FileText,
  Clock,
  RefreshCw,
  Zap,
  TrendingUp,
  Check,
  X,
  ArrowRight,
  Sparkles,
  type LucideIcon,
} from 'lucide-react'
import { cn } from '@/lib/cn'
import { formatSEK } from '@/lib/format'
import type { CompareRow, OfferTier, PremiumOfferData, TermItem } from './types'

const ICON_MAP: Record<TermItem['icon'], LucideIcon> = {
  Calendar,
  Lock,
  Shield,
  FileText,
  Clock,
  RefreshCw,
  Zap,
  TrendingUp,
}

/* ====================================================================
   HERO
   ==================================================================== */

export function OfferHero({
  eyebrow,
  heading,
  subtitle,
  meta,
}: {
  eyebrow: string
  heading: ReactNode
  subtitle?: string
  meta: Array<{ label: string; value: string }>
}) {
  return (
    <section className="relative pt-20 pb-16">
      <div className="text-[11px] font-semibold text-[var(--accent)] uppercase tracking-[0.22em] mb-5 flex items-center gap-2.5">
        <span className="h-px w-6 bg-[var(--accent)]" />
        {eyebrow}
      </div>
      <h1 className="text-display-1 text-[var(--fg)] max-w-[900px] leading-[1.02]">
        {heading}
      </h1>
      {subtitle && (
        <p className="mt-6 text-[18px] text-[var(--fg-muted)] max-w-[640px] leading-[1.5]">
          {subtitle}
        </p>
      )}
      <div className="mt-10 pt-8 border-t border-[var(--border)] grid grid-cols-2 sm:grid-cols-4 gap-6">
        {meta.map((m) => (
          <div key={m.label} className="flex flex-col gap-1">
            <span className="text-[10.5px] font-semibold text-[var(--fg-muted)] uppercase tracking-[0.14em]">
              {m.label}
            </span>
            <span className="text-[15px] font-medium text-[var(--fg)]">{m.value}</span>
          </div>
        ))}
      </div>
    </section>
  )
}

/* ====================================================================
   ROI CALCULATOR
   ==================================================================== */

interface ROIProps {
  defaults: {
    bookings: number
    hours: number
    hourlyValue: number
    automationRate: number
    proMonthly: number
    proSetup: number
  }
}

export function OfferROI({ defaults }: ROIProps) {
  const [bookings, setBookings] = useState(defaults.bookings)
  const [hours, setHours] = useState(defaults.hours)
  const [hourlyValue, setHourlyValue] = useState(defaults.hourlyValue)

  const calc = useMemo(() => {
    const autoRate = Math.min(0.85, defaults.automationRate + bookings / 600)
    const savedPerMonth = hours * autoRate * 4.33
    const monthlySavings = savedPerMonth * hourlyValue
    const annualSavings = monthlySavings * 12
    const denom = monthlySavings - defaults.proMonthly
    const payback = denom > 0 ? defaults.proSetup / denom : null
    return { autoRate, savedPerMonth, monthlySavings, annualSavings, payback }
  }, [bookings, hours, hourlyValue, defaults])

  return (
    <SectionWrap tone="surface">
      <SectionEyebrow>Värdekalkyl</SectionEyebrow>
      <SectionTitle>Vad paketet är värt — räkna själv.</SectionTitle>
      <SectionLead>
        Justera värdena nedan för att matcha er verklighet. Beräkningen uppdateras live.
      </SectionLead>

      <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-8 items-start">
        {/* Controls */}
        <div className="surface-glow rounded-[16px] bg-[var(--surface)] border border-[var(--border)] p-8">
          <Slider
            label="Uppdrag per månad"
            sublabel="Bokningar, leveranser, möten — totalt"
            value={bookings}
            onChange={setBookings}
            min={10}
            max={150}
            suffix=""
          />
          <Slider
            label="Admin-tid per vecka"
            sublabel="Mail, ringa, fakturaunderlag"
            value={hours}
            onChange={setHours}
            min={4}
            max={30}
            suffix="h"
            className="mt-7"
          />
          <Slider
            label="Värde per timme"
            sublabel="Vad er administrativa tid är värd"
            value={hourlyValue}
            onChange={setHourlyValue}
            min={250}
            max={1500}
            step={50}
            suffix="kr"
            className="mt-7"
          />
        </div>

        {/* Result */}
        <div className="relative overflow-hidden rounded-[16px] p-10 text-[var(--ink-0)]" style={{ background: 'linear-gradient(145deg, oklch(0.19 0.03 265) 0%, oklch(0.12 0.025 265) 100%)' }}>
          <div
            className="absolute -top-24 -right-16 w-80 h-80 rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle, var(--accent-soft), transparent 65%)' }}
          />
          <div className="relative">
            <div className="text-[11px] uppercase tracking-[0.22em] font-bold text-[var(--accent)] mb-3.5">
              Månatlig besparing
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-num font-semibold text-[58px] leading-none tracking-[-0.045em] text-white">
                {formatSEK(calc.monthlySavings).replace(' kr', '')}
              </span>
              <span className="text-[28px] font-medium text-white/70">kr</span>
            </div>
            <div className="mt-1.5 text-[15px] text-white/60">per månad, enligt era värden</div>

            <div className="mt-7 pt-5 border-t border-white/15 space-y-2.5 text-[13.5px]">
              <ResultRow label="Automatiseringsgrad" value={`${Math.round(calc.autoRate * 100)}%`} />
              <ResultRow label="Besparad tid per månad" value={`${Math.round(calc.savedPerMonth)} h`} />
              <ResultRow label="Årlig besparing" value={formatSEK(calc.annualSavings)} />
              <div className="pt-2.5 mt-1 border-t border-white/15">
                <ResultRow
                  label="Återbetalningstid setup"
                  value={calc.payback ? `${calc.payback.toFixed(1)} mån` : '—'}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <p className="mt-7 text-[12.5px] text-[var(--fg-subtle)] text-center px-5 py-3.5 rounded-[10px] bg-[var(--surface-2)]/50 border border-[var(--border)]">
        Beräkningen utgår från en genomsnittlig automatiseringsgrad som ökar med volymen. Faktisk besparing
        verifierar vi tillsammans på er riktiga data innan driftsättning.
      </p>
    </SectionWrap>
  )
}

function Slider({
  label,
  sublabel,
  value,
  onChange,
  min,
  max,
  step = 1,
  suffix,
  className,
}: {
  label: string
  sublabel?: string
  value: number
  onChange: (v: number) => void
  min: number
  max: number
  step?: number
  suffix: string
  className?: string
}) {
  return (
    <div className={className}>
      <div className="flex items-baseline justify-between mb-3">
        <div>
          <div className="text-[14px] font-semibold text-[var(--fg)]">{label}</div>
          {sublabel && (
            <div className="text-[12px] text-[var(--fg-subtle)] mt-0.5">{sublabel}</div>
          )}
        </div>
        <div className="text-num font-semibold text-[24px] tracking-[-0.02em] text-[var(--accent)]">
          {value.toLocaleString('sv-SE')}
          {suffix && <span className="text-[14px] text-[var(--fg-muted)] font-medium ml-1">{suffix}</span>}
        </div>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-[var(--accent)]"
      />
    </div>
  )
}

function ResultRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-white/70">{label}</span>
      <span className="text-num font-semibold text-white">{value}</span>
    </div>
  )
}

/* ====================================================================
   TIERS
   ==================================================================== */

interface TiersProps {
  tiers: OfferTier[]
  selectedId: string
  onSelect: (id: string) => void
}

export function OfferTiers({ tiers, selectedId, onSelect }: TiersProps) {
  return (
    <SectionWrap>
      <SectionEyebrow>Paket</SectionEyebrow>
      <SectionTitle>Välj det som passar er.</SectionTitle>
      <SectionLead>
        Alla paket inkluderar drift, hosting, support och framtida uppdateringar. Ingen timdebitering,
        inga dolda tillägg.
      </SectionLead>

      <div className={cn('grid gap-4', tiers.length === 3 ? 'lg:grid-cols-3' : 'lg:grid-cols-2', 'grid-cols-1')}>
        {tiers.map((tier) => (
          <TierCard
            key={tier.id}
            tier={tier}
            selected={tier.id === selectedId}
            onClick={() => onSelect(tier.id)}
          />
        ))}
      </div>
    </SectionWrap>
  )
}

function TierCard({
  tier,
  selected,
  onClick,
}: {
  tier: OfferTier
  selected: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'relative text-left rounded-[16px] p-9 pb-7 transition-all border',
        tier.featured
          ? 'bg-gradient-to-b from-[color-mix(in_oklch,var(--accent)_8%,var(--surface))] to-[var(--surface)]'
          : 'bg-[var(--surface)]',
        selected
          ? tier.featured
            ? 'border-[var(--accent)] shadow-[0_0_0_2px_var(--accent),_0_14px_40px_-10px_color-mix(in_oklch,var(--accent)_30%,transparent)] -translate-y-0.5'
            : 'border-[var(--fg)] shadow-[0_0_0_2px_var(--fg),_0_14px_40px_-10px_rgb(0_0_0_/_0.25)] -translate-y-0.5'
          : tier.featured
            ? 'border-[color-mix(in_oklch,var(--accent)_35%,transparent)] hover:border-[color-mix(in_oklch,var(--accent)_55%,transparent)]'
            : 'border-[var(--border)] hover:border-[var(--border-strong)]',
      )}
    >
      {tier.featured && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[var(--accent)] text-[var(--accent-fg)] px-3 py-1 rounded-full text-[10px] font-bold tracking-[0.14em] uppercase">
          Rekommenderas
        </span>
      )}
      {selected && (
        <span
          className={cn(
            'absolute top-4 right-4 h-7 w-7 rounded-full flex items-center justify-center',
            tier.featured
              ? 'bg-[var(--accent)] text-[var(--accent-fg)]'
              : 'bg-[var(--fg)] text-[var(--fg-inverse)]',
          )}
        >
          <Check size={14} strokeWidth={3} />
        </span>
      )}

      <div className="text-[22px] font-display italic text-[var(--fg)] tracking-tight">{tier.name}</div>
      {tier.description && (
        <p className="mt-1.5 text-[13px] text-[var(--fg-muted)] min-h-[40px]">{tier.description}</p>
      )}

      <div className="mt-7 pb-6 border-b border-[var(--border)]">
        <div className="flex items-baseline gap-1.5">
          <span className="text-num font-semibold text-[42px] tracking-[-0.04em] text-[var(--fg)] leading-none">
            {tier.monthlyPrice.toLocaleString('sv-SE')}
          </span>
          <span className="text-[22px] font-medium text-[var(--fg-muted)]">kr</span>
          <span className="text-[13.5px] text-[var(--fg-subtle)] ml-0.5">/mån</span>
        </div>
        <div className="mt-2.5 text-[12.5px] text-[var(--fg-muted)]">
          Engångskostnad: <span className="text-[var(--fg)] font-semibold">{formatSEK(tier.setupFee)}</span>
        </div>
      </div>

      <ul className="mt-6 space-y-2.5">
        {tier.features.map((f, i) => (
          <li
            key={i}
            className={cn(
              'relative pl-6 text-[13.5px] leading-[1.5]',
              f.disabled ? 'text-[var(--fg-subtle)]' : 'text-[var(--fg-muted)]',
            )}
          >
            {f.disabled ? (
              <X
                size={12}
                className="absolute left-0 top-[6px] text-[var(--fg-subtle)]"
                strokeWidth={2.25}
              />
            ) : (
              <Check
                size={12}
                className="absolute left-0 top-[6px] text-[var(--color-success)]"
                strokeWidth={2.5}
              />
            )}
            {f.bold ? (
              <strong className="text-[var(--fg)] font-semibold">{f.label}</strong>
            ) : (
              f.label
            )}
          </li>
        ))}
      </ul>
    </button>
  )
}

/* ====================================================================
   INCLUDED (What's in the selected tier)
   ==================================================================== */

export function OfferIncluded({ tier }: { tier: OfferTier }) {
  if (!tier.included) return null
  return (
    <SectionWrap tone="surface">
      <SectionEyebrow>Vad som ingår</SectionEyebrow>
      <SectionTitle>
        Transparent — det som visas är det som ingår i{' '}
        <span className="font-display italic text-[var(--accent)]">{tier.name}</span>.
      </SectionTitle>
      <SectionLead>
        Välj ett annat paket ovan så uppdateras listan. Ingen finstilt text.
      </SectionLead>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-7">
        <IncludedCard
          title="Engångskostnaden"
          priceLabel={`${formatSEK(tier.setupFee)} · betalas vid driftsättning`}
          items={tier.included.setup}
        />
        <IncludedCard
          title="Månadskostnaden"
          priceLabel={`${formatSEK(tier.monthlyPrice)}/mån · löpande`}
          items={tier.included.monthly}
        />
      </div>
    </SectionWrap>
  )
}

function IncludedCard({
  title,
  priceLabel,
  items,
}: {
  title: string
  priceLabel: string
  items: Array<{ title: string; description: string }>
}) {
  return (
    <div className="surface-glow rounded-[16px] bg-[var(--surface)] border border-[var(--border)] p-8">
      <h3 className="text-[19px] font-display italic text-[var(--fg)] tracking-tight">{title}</h3>
      <div className="mt-1.5 text-[13px] font-semibold text-[var(--accent)]">{priceLabel}</div>
      <div className="mt-5 divide-y divide-[var(--border)]">
        {items.map((it, i) => (
          <div key={i} className="py-3.5 flex gap-3.5 items-start">
            <span className="text-num font-semibold text-[15px] text-[var(--accent)] min-w-[28px] leading-none pt-0.5">
              {String(i + 1).padStart(2, '0')}
            </span>
            <div>
              <h4 className="text-[13.5px] font-semibold text-[var(--fg)]">{it.title}</h4>
              <p className="mt-1 text-[13px] text-[var(--fg-muted)] leading-[1.5]">{it.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ====================================================================
   COMPARE TABLE
   ==================================================================== */

export function OfferCompare({
  tiers,
  rows,
}: {
  tiers: OfferTier[]
  rows: CompareRow[]
}) {
  return (
    <SectionWrap>
      <SectionEyebrow>Jämförelse</SectionEyebrow>
      <SectionTitle>Funktion för funktion.</SectionTitle>

      <div className="rounded-[14px] border border-[var(--border)] bg-[var(--surface)] overflow-x-auto">
        <table className="w-full text-[13.5px] border-separate border-spacing-0">
          <thead>
            <tr>
              <th className="sticky left-0 bg-[var(--surface-2)]/80 backdrop-blur-md px-5 py-3 text-left text-[11px] font-semibold text-[var(--fg-muted)] uppercase tracking-[0.12em] border-b border-[var(--border)] min-w-[300px]">
                Funktion
              </th>
              {tiers.map((t) => (
                <th
                  key={t.id}
                  className={cn(
                    'px-5 py-3 text-center text-[12px] font-semibold uppercase tracking-[0.1em] border-b border-[var(--border)]',
                    t.featured
                      ? 'bg-[color-mix(in_oklch,var(--accent)_8%,transparent)] text-[var(--accent)]'
                      : 'bg-[var(--surface-2)]/80 backdrop-blur-md text-[var(--fg-muted)]',
                  )}
                >
                  {t.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i}>
                <td className="px-5 py-3 border-b border-[var(--border)] last:border-b-0 text-[var(--fg)]">
                  {row.feature}
                </td>
                {tiers.map((t) => {
                  const val = row.values[t.id]
                  const featured = t.featured
                  return (
                    <td
                      key={t.id}
                      className={cn(
                        'px-5 py-3 text-center border-b border-[var(--border)] last:border-b-0',
                        featured && 'bg-[color-mix(in_oklch,var(--accent)_4%,transparent)]',
                      )}
                    >
                      {val === true ? (
                        <Check size={15} className="inline text-[var(--color-success)]" strokeWidth={2.5} />
                      ) : val === false || val == null ? (
                        <span className="text-[var(--fg-subtle)]">—</span>
                      ) : (
                        <span className="text-[var(--fg)]">{val}</span>
                      )}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </SectionWrap>
  )
}

/* ====================================================================
   TERMS
   ==================================================================== */

export function OfferTerms({ terms }: { terms: TermItem[] }) {
  return (
    <SectionWrap tone="surface">
      <SectionEyebrow>Villkor</SectionEyebrow>
      <SectionTitle>Transparent och rimligt.</SectionTitle>

      <div className="surface-glow rounded-[16px] bg-[var(--surface)] border border-[var(--border)] p-9">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-5 gap-x-12">
          {terms.map((term, i) => {
            const Icon = ICON_MAP[term.icon] ?? FileText
            return (
              <div key={i} className="flex gap-3.5 items-start">
                <div className="h-9 w-9 rounded-lg flex items-center justify-center shrink-0 bg-[color-mix(in_oklch,var(--accent)_10%,transparent)] border border-[color-mix(in_oklch,var(--accent)_22%,transparent)] text-[var(--accent)]">
                  <Icon size={15} strokeWidth={2} />
                </div>
                <div>
                  <h4 className="text-[13.5px] font-semibold text-[var(--fg)]">{term.title}</h4>
                  <p className="mt-1 text-[13px] text-[var(--fg-muted)] leading-[1.5]">
                    {term.description}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </SectionWrap>
  )
}

/* ====================================================================
   CTA
   ==================================================================== */

export function OfferCTA({
  heading,
  description,
  primaryLabel,
  primaryHref,
  secondaryLabel,
  secondaryHref,
}: {
  heading: ReactNode
  description?: string
  primaryLabel: string
  primaryHref: string
  secondaryLabel?: string
  secondaryHref?: string
}) {
  return (
    <section className="mt-16">
      <div
        className="relative overflow-hidden rounded-[20px] px-12 py-16 text-center"
        style={{
          background:
            'linear-gradient(135deg, oklch(0.19 0.03 265) 0%, oklch(0.11 0.022 265) 100%)',
        }}
      >
        <div
          className="absolute -top-1/2 left-1/2 -translate-x-1/2 w-[640px] h-[640px] pointer-events-none"
          style={{
            background:
              'radial-gradient(circle, color-mix(in oklch, var(--accent) 14%, transparent), transparent 55%)',
          }}
        />
        <div className="relative">
          <div className="inline-flex items-center gap-2 text-[11px] font-semibold text-[var(--accent)] uppercase tracking-[0.22em] mb-5">
            <Sparkles size={13} />
            Nästa steg
          </div>
          <h2 className="text-display-2 text-white max-w-[680px] mx-auto">{heading}</h2>
          {description && (
            <p className="mt-4 text-[17px] text-white/70 max-w-[580px] mx-auto leading-[1.55]">
              {description}
            </p>
          )}
          <div className="mt-8 flex items-center justify-center gap-2.5 flex-wrap">
            <a
              href={primaryHref}
              className="inline-flex items-center gap-2 h-12 px-6 rounded-[10px] bg-[var(--accent)] text-[var(--accent-fg)] font-semibold text-[14.5px] transition-colors hover:bg-[var(--accent-hover)]"
            >
              {primaryLabel}
              <ArrowRight size={15} />
            </a>
            {secondaryLabel && secondaryHref && (
              <a
                href={secondaryHref}
                className="inline-flex items-center gap-2 h-12 px-6 rounded-[10px] border border-white/20 text-white font-semibold text-[14.5px] transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)]"
              >
                {secondaryLabel}
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

/* ====================================================================
   Shared helpers
   ==================================================================== */

function SectionWrap({
  tone,
  children,
}: {
  tone?: 'surface'
  children: ReactNode
}) {
  return (
    <section
      className={cn(
        'py-16 -mx-8 px-8 border-t border-b first:border-t-0',
        tone === 'surface' ? 'bg-[var(--surface-2)]/30 border-[var(--border)]' : 'border-[var(--border)]',
      )}
    >
      {children}
    </section>
  )
}

function SectionEyebrow({ children }: { children: ReactNode }) {
  return (
    <div className="text-[11px] font-semibold text-[var(--accent)] uppercase tracking-[0.22em] mb-3 flex items-center gap-2.5">
      <span className="h-px w-6 bg-[var(--accent)]" />
      {children}
    </div>
  )
}

function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <h2 className="text-display-2 text-[var(--fg)] max-w-[720px] leading-[1.05]">{children}</h2>
  )
}

function SectionLead({ children }: { children: ReactNode }) {
  return (
    <p className="mt-4 mb-10 text-[16px] text-[var(--fg-muted)] max-w-[640px] leading-[1.55]">
      {children}
    </p>
  )
}

/* ====================================================================
   SIMPLE (fallback for legacy quotes without premium data)
   ==================================================================== */

export function OfferSimpleCard({
  setupFee,
  monthlyFee,
  total,
  items,
}: {
  setupFee: number | null | undefined
  monthlyFee: number | null | undefined
  total: number | null | undefined
  items: Array<{ name: string; desc?: string }>
}) {
  return (
    <SectionWrap>
      <SectionEyebrow>Prissättning</SectionEyebrow>
      <SectionTitle>Paketets omfattning.</SectionTitle>

      <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-6 mt-6">
        <div className="surface-glow rounded-[16px] bg-[var(--surface)] border border-[var(--border)] p-8">
          <h3 className="text-[12px] font-semibold text-[var(--fg-muted)] uppercase tracking-[0.14em]">
            Ingår i leveransen
          </h3>
          {items.length > 0 ? (
            <ul className="mt-5 space-y-3">
              {items.map((it, i) => (
                <li key={i} className="flex gap-3 items-start">
                  <Check size={14} className="text-[var(--color-success)] mt-1 shrink-0" strokeWidth={2.5} />
                  <div>
                    <div className="text-[14px] font-medium text-[var(--fg)]">{it.name}</div>
                    {it.desc && <div className="text-[12.5px] text-[var(--fg-muted)] mt-0.5">{it.desc}</div>}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-5 text-[13px] text-[var(--fg-subtle)]">
              Detaljer om innehållet läggs till i offerten.
            </p>
          )}
        </div>

        <div
          className="relative overflow-hidden rounded-[16px] p-8 text-white"
          style={{
            background:
              'linear-gradient(145deg, oklch(0.19 0.03 265) 0%, oklch(0.12 0.025 265) 100%)',
          }}
        >
          <div
            className="absolute -top-20 -right-10 w-64 h-64 rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle, var(--accent-soft), transparent 65%)' }}
          />
          <div className="relative space-y-4">
            <PriceRow label="Startavgift" value={formatSEK(setupFee)} />
            <PriceRow label="Månadsavgift" value={`${formatSEK(monthlyFee)}/mån`} />
            <div className="pt-5 border-t border-white/15">
              <div className="text-[11px] uppercase tracking-[0.2em] font-semibold text-[var(--accent)]">
                Totalt år 1
              </div>
              <div className="mt-1 text-num font-semibold text-[40px] leading-none tracking-[-0.035em] text-white">
                {formatSEK(total)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </SectionWrap>
  )
}

function PriceRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[11.5px] uppercase tracking-[0.14em] font-semibold text-white/60">
        {label}
      </div>
      <div className="mt-1 text-num text-[22px] font-semibold text-white tracking-[-0.02em]">
        {value}
      </div>
    </div>
  )
}

/* ====================================================================
   EXPORTED PREMIUM DEFAULTS
   ==================================================================== */

export function heroFromPremium(
  premium: PremiumOfferData | null,
  fallback: { clientName: string; service: string | null; validUntil: string | null },
) {
  const eyebrow = premium?.hero?.eyebrow ?? (fallback.service ? `Offert · ${fallback.service}` : 'Offert')
  const heading =
    premium?.hero?.heading ?? `Ett skräddarsytt paket för ${fallback.clientName}.`
  const subtitle = premium?.hero?.subtitle
  return { eyebrow, heading, subtitle }
}
