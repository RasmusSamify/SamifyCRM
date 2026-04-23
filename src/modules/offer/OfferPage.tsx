import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import { Loader2, XCircle, Printer } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { formatDate } from '@/lib/format'
import type { Quote } from '@/types/database'
import {
  OfferHero,
  OfferROI,
  OfferTiers,
  OfferIncluded,
  OfferCompare,
  OfferTerms,
  OfferCTA,
  OfferSimpleCard,
  heroFromPremium,
} from './sections'
import {
  DEFAULT_TERMS,
  parsePremiumOffer,
  parseSimpleItems,
  type OfferTier,
} from './types'

function useOffer(token: string | undefined) {
  return useQuery({
    queryKey: ['offer', token],
    enabled: !!token,
    retry: false,
    queryFn: async (): Promise<Quote | null> => {
      if (!token) return null
      const { data, error } = await supabase
        .from('quotes')
        .select('*')
        .eq('public_token', token)
        .maybeSingle()
      if (error) throw error
      return data
    },
  })
}

export function OfferPage() {
  const { token } = useParams<{ token: string }>()
  const { data: quote, isLoading, error } = useOffer(token)

  const premium = useMemo(() => parsePremiumOffer(quote?.items), [quote])
  const simpleItems = useMemo(
    () => (premium ? [] : parseSimpleItems(quote?.items)),
    [premium, quote],
  )

  const defaultTier: OfferTier | null = useMemo(() => {
    if (premium || !quote) return null
    return {
      id: 'default',
      name: 'Paket',
      monthlyPrice: quote.monthly_fee ?? 0,
      setupFee: quote.setup_fee ?? 0,
      features: simpleItems.map((it) => ({ label: it.name })),
    }
  }, [premium, quote, simpleItems])

  const tiers = premium?.tiers ?? (defaultTier ? [defaultTier] : [])
  const initialSelected =
    tiers.find((t) => t.featured)?.id ?? tiers[0]?.id ?? 'default'
  const [selectedId, setSelectedId] = useState<string>(initialSelected)

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 size={22} className="animate-spin text-[var(--fg-subtle)]" />
      </div>
    )
  }

  if (error || !quote) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="text-center max-w-md animate-fade-in">
          <div className="inline-flex h-12 w-12 rounded-2xl bg-[var(--surface-2)] border border-[var(--border-strong)] items-center justify-center mb-4">
            <XCircle size={22} className="text-[var(--color-danger)]" strokeWidth={1.75} />
          </div>
          <h1 className="text-[20px] font-semibold text-[var(--fg)] tracking-tight">
            Offerten kunde inte hittas
          </h1>
          <p className="mt-2 text-[13.5px] text-[var(--fg-muted)]">
            Kontrollera länken eller hör av dig till din kontakt på Samify.
          </p>
        </div>
      </div>
    )
  }

  const selectedTier = tiers.find((t) => t.id === selectedId) ?? tiers[0]
  const heroCopy = heroFromPremium(premium, {
    clientName: quote.client_name,
    service: null,
    validUntil: quote.valid_until,
  })

  const defaultCTA = {
    heading: (
      <>
        Redo att gå vidare med <span className="font-display italic text-[var(--accent)]">Samify</span>?
      </>
    ),
    description:
      'Signera eller boka uppföljningsmöte så sätter vi igång. Projekt startar normalt inom 1–2 veckor efter avtal.',
    primaryLabel: 'Signera offerten',
    primaryHref: `mailto:rasmus@samify.se?subject=Signering%20av%20offert%20${encodeURIComponent(
      quote.client_name,
    )}`,
    secondaryLabel: 'Boka uppföljningsmöte',
    secondaryHref: 'mailto:rasmus@samify.se?subject=Bokning%20uppf%C3%B6ljningsm%C3%B6te',
  }

  return (
    <div className="min-h-screen">
      {/* Ambient glow */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          background:
            'radial-gradient(ellipse 55% 35% at 15% 0%, color-mix(in oklch, var(--accent) 10%, transparent), transparent 65%), radial-gradient(ellipse 55% 60% at 90% 100%, oklch(0.40 0.20 265 / 0.16), transparent 65%)',
        }}
      />

      <div className="relative max-w-[1120px] mx-auto px-8">
        {/* Header */}
        <header className="py-7 flex items-center justify-between sticky top-0 z-10 backdrop-blur-md bg-[var(--bg)]/70 border-b border-[var(--border)] -mx-8 px-8">
          <div className="flex items-baseline gap-2.5">
            <LogoMark />
            <span className="font-display italic text-[20px] text-[var(--fg)] tracking-tight leading-none">
              Samify
            </span>
            <span className="font-mono text-[10px] text-[var(--fg-subtle)] uppercase tracking-[0.14em]">
              / offert
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-[11px] font-semibold text-[var(--accent)] uppercase tracking-[0.18em] px-2.5 py-1 rounded-full border border-[color-mix(in_oklch,var(--accent)_25%,transparent)] bg-[color-mix(in_oklch,var(--accent)_8%,transparent)]">
              Konfidentiell offert
            </span>
            <span className="text-[12px] text-[var(--fg-muted)] hidden sm:inline">
              {formatDate(quote.created_at)}
            </span>
            <button
              type="button"
              onClick={() => window.print()}
              className="hidden md:inline-flex items-center gap-1.5 h-8 px-3 rounded-[8px] text-[12.5px] text-[var(--fg-muted)] hover:text-[var(--fg)] hover:bg-[var(--surface-2)] transition-colors"
            >
              <Printer size={13} />
              Skriv ut / PDF
            </button>
          </div>
        </header>

        {/* Hero */}
        <OfferHero
          eyebrow={heroCopy.eyebrow}
          heading={heroCopy.heading}
          subtitle={heroCopy.subtitle ?? quote.note ?? undefined}
          meta={[
            { label: 'Kund', value: quote.client_name },
            { label: 'Leverantör', value: 'Samify AB' },
            { label: 'Giltig t.o.m.', value: formatDate(quote.valid_until) },
            { label: 'Version', value: premium?.version ?? '1.0' },
          ]}
        />

        {/* ROI (premium only) */}
        {premium?.roi && (
          <OfferROI
            defaults={{
              bookings: premium.roi.baselineBookings,
              hours: premium.roi.baselineAdminHours,
              hourlyValue: premium.roi.baselineHourlyValue,
              automationRate: premium.roi.automationRate ?? 0.65,
              proMonthly: premium.roi.proMonthlyPrice ?? 9995,
              proSetup: premium.roi.proSetupFee ?? 35000,
            }}
          />
        )}

        {/* Tiers */}
        {tiers.length > 1 ? (
          <OfferTiers tiers={tiers} selectedId={selectedId} onSelect={setSelectedId} />
        ) : !premium && defaultTier ? (
          <OfferSimpleCard
            setupFee={quote.setup_fee}
            monthlyFee={quote.monthly_fee}
            total={quote.total}
            items={simpleItems}
          />
        ) : null}

        {/* Included */}
        {selectedTier && tiers.length > 1 && selectedTier.included && (
          <OfferIncluded tier={selectedTier} />
        )}

        {/* Compare */}
        {premium?.compare && premium.compare.length > 0 && tiers.length > 1 && (
          <OfferCompare tiers={tiers} rows={premium.compare} />
        )}

        {/* Terms */}
        <OfferTerms terms={premium?.terms ?? DEFAULT_TERMS} />

        {/* CTA */}
        <OfferCTA
          heading={
            premium?.cta?.heading ? (
              premium.cta.heading
            ) : (
              defaultCTA.heading
            )
          }
          description={premium?.cta?.description ?? defaultCTA.description}
          primaryLabel={premium?.cta?.primaryLabel ?? defaultCTA.primaryLabel}
          primaryHref={premium?.cta?.primaryHref ?? defaultCTA.primaryHref}
          secondaryLabel={premium?.cta?.secondaryLabel ?? defaultCTA.secondaryLabel}
          secondaryHref={premium?.cta?.secondaryHref ?? defaultCTA.secondaryHref}
        />

        {/* Footer */}
        <footer className="pt-12 pb-16 mt-16 border-t border-[var(--border)] flex flex-wrap justify-between items-center gap-6 text-[12.5px] text-[var(--fg-muted)]">
          <div>
            <span className="text-[var(--fg)] font-semibold">Samify AB</span>
            <span className="mx-1.5 text-[var(--fg-subtle)]">·</span>
            Kalmar, Sverige
          </div>
          <div className="flex flex-col sm:flex-row sm:gap-5 gap-1">
            <a
              href="mailto:rasmus@samify.se"
              className="text-[var(--accent)] hover:underline"
            >
              rasmus@samify.se
            </a>
            <a
              href="mailto:adnan@samify.se"
              className="text-[var(--accent)] hover:underline"
            >
              adnan@samify.se
            </a>
          </div>
        </footer>
      </div>
    </div>
  )
}

function LogoMark() {
  return (
    <svg width="24" height="24" viewBox="0 0 32 32" fill="none" aria-hidden>
      <defs>
        <linearGradient id="offer-logo" x1="4" y1="4" x2="28" y2="28" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="var(--accent)" />
          <stop offset="1" stopColor="var(--gold)" />
        </linearGradient>
      </defs>
      <path
        d="M8 6H20C24.4183 6 28 9.58172 28 14C28 16.2091 26.2091 18 24 18H12C9.79086 18 8 19.7909 8 22V26C8 27.1046 7.10457 28 6 28H4C2.89543 28 2 27.1046 2 26V12C2 8.68629 4.68629 6 8 6Z"
        fill="url(#offer-logo)"
      />
      <circle cx="22.5" cy="23.5" r="3.5" fill="var(--gold)" />
    </svg>
  )
}
