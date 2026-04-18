import { useQuery } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import { CheckCircle2, Loader2, XCircle } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { Progress } from '@/components/ui/Progress'
import { formatDate, formatSEK } from '@/lib/format'
import type { Client, Quote } from '@/types/database'
import { phaseFor } from '@/modules/clients/constants'
import { cn } from '@/lib/cn'

interface StatusPayload {
  quote: Quote
  client: Client | null
}

const PHASE_STEPS = [
  { key: 'kartlaggning', label: 'Kartläggning', min: 0 },
  { key: 'prototyp', label: 'Prototyp', min: 25 },
  { key: 'driftsattning', label: 'Driftsättning', min: 50 },
  { key: 'support', label: 'Löpande support', min: 75 },
]

export function StatusPage() {
  const { token } = useParams<{ token: string }>()

  const { data, isLoading, error } = useQuery({
    queryKey: ['status', token],
    enabled: !!token,
    retry: false,
    queryFn: async (): Promise<StatusPayload | null> => {
      if (!token) return null
      const { data: quote, error: qErr } = await supabase
        .from('quotes')
        .select('*')
        .eq('public_token', token)
        .maybeSingle()
      if (qErr) throw qErr
      if (!quote) return null
      const { data: client } = await supabase
        .from('clients')
        .select('*')
        .eq('name', quote.client_name)
        .maybeSingle()
      return { quote, client }
    },
  })

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 size={22} className="animate-spin text-[var(--fg-subtle)]" />
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="text-center max-w-md animate-fade-in">
          <div className="inline-flex h-12 w-12 rounded-2xl bg-[var(--surface-2)] border border-[var(--border-strong)] items-center justify-center mb-4">
            <XCircle size={22} className="text-[var(--color-danger)]" strokeWidth={1.75} />
          </div>
          <h1 className="text-[20px] font-semibold text-[var(--fg)] tracking-tight">
            Länken är ogiltig
          </h1>
          <p className="mt-2 text-[13.5px] text-[var(--fg-muted)]">
            Statussidan kunde inte hittas. Kontrollera länken eller kontakta din kontakt på Samify.
          </p>
        </div>
      </div>
    )
  }

  const { quote, client } = data
  const phase = phaseFor(client?.project_health ?? 0)
  const currentStepIndex = PHASE_STEPS.findIndex((s) => phase.label === s.label)

  return (
    <div className="min-h-screen py-10 px-6">
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          background:
            'radial-gradient(ellipse 50% 40% at 50% 0%, oklch(0.72 0.18 62 / 0.08), transparent 65%), radial-gradient(ellipse 60% 60% at 50% 100%, oklch(0.40 0.20 265 / 0.18), transparent 60%)',
        }}
      />

      <div className="relative max-w-[760px] mx-auto animate-slide-up">
        {/* Brand */}
        <div className="mb-8 flex items-center gap-2.5">
          <LogoMark />
          <div className="flex items-baseline gap-2">
            <span className="font-display italic text-[22px] text-[var(--fg)] tracking-tight leading-none">
              Samify
            </span>
            <span className="font-mono text-[10.5px] text-[var(--fg-subtle)] uppercase tracking-[0.14em]">
              / status
            </span>
          </div>
        </div>

        {/* Hero */}
        <div className="surface-glow rounded-[18px] bg-[var(--surface)] border border-[var(--border)] p-8">
          <div className="text-[11.5px] font-semibold text-[var(--accent)] uppercase tracking-[0.14em]">
            Projektstatus
          </div>
          <h1 className="mt-2 text-display-2 text-[var(--fg)]">{quote.client_name}</h1>
          {quote.contact_name && (
            <p className="mt-2 text-[14px] text-[var(--fg-muted)]">
              Till: {quote.contact_name}
              {quote.contact_email && (
                <span className="text-[var(--fg-subtle)]"> · {quote.contact_email}</span>
              )}
            </p>
          )}

          {/* Project health */}
          {client && (
            <div className="mt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11.5px] font-medium text-[var(--fg-muted)] uppercase tracking-[0.12em]">
                  Nuvarande fas · {phase.label}
                </span>
                <span className="text-num text-[12px] text-[var(--fg)]">
                  {client.project_health}%
                </span>
              </div>
              <Progress value={client.project_health ?? 0} />
            </div>
          )}

          {/* Phase steps */}
          <div className="mt-6 grid grid-cols-4 gap-2">
            {PHASE_STEPS.map((step, i) => {
              const isComplete = i < currentStepIndex
              const isCurrent = i === currentStepIndex
              return (
                <div
                  key={step.key}
                  className={cn(
                    'rounded-[10px] border px-3 py-3 transition-colors',
                    isCurrent
                      ? 'border-[color-mix(in_oklch,var(--accent)_40%,transparent)] bg-[color-mix(in_oklch,var(--accent)_10%,transparent)]'
                      : isComplete
                        ? 'border-[color-mix(in_oklch,var(--color-success)_30%,transparent)] bg-[color-mix(in_oklch,var(--color-success)_8%,transparent)]'
                        : 'border-[var(--border)] bg-[var(--surface-2)]/40',
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-num text-[11px] text-[var(--fg-subtle)]">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    {isComplete && (
                      <CheckCircle2 size={13} className="text-[var(--color-success)]" />
                    )}
                    {isCurrent && (
                      <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)] animate-pulse-soft" />
                    )}
                  </div>
                  <div
                    className={cn(
                      'mt-2 text-[12.5px] font-medium',
                      isCurrent
                        ? 'text-[var(--fg)]'
                        : isComplete
                          ? 'text-[var(--fg)]'
                          : 'text-[var(--fg-muted)]',
                    )}
                  >
                    {step.label}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Quote summary */}
        <div className="mt-5 surface-glow rounded-[18px] bg-[var(--surface)] border border-[var(--border)] p-8">
          <div className="text-[11.5px] font-semibold text-[var(--fg-muted)] uppercase tracking-[0.14em]">
            Offertöversikt
          </div>
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Metric label="Startavgift" value={formatSEK(quote.setup_fee)} />
            <Metric label="Månadsavgift" value={formatSEK(quote.monthly_fee)} />
            <Metric
              label="Total år 1"
              value={formatSEK(quote.total)}
              emphasize
            />
          </div>
          {quote.valid_until && (
            <p className="mt-5 text-[12.5px] text-[var(--fg-subtle)]">
              Giltig till {formatDate(quote.valid_until)}
            </p>
          )}
          {quote.note && (
            <p className="mt-4 text-[13.5px] text-[var(--fg)] leading-relaxed">{quote.note}</p>
          )}
        </div>

        <p className="mt-6 text-center text-[11.5px] text-[var(--fg-subtle)]">
          Publik delbar status · Samify CRM
        </p>
      </div>
    </div>
  )
}

function Metric({
  label,
  value,
  emphasize,
}: {
  label: string
  value: string
  emphasize?: boolean
}) {
  return (
    <div className="rounded-[10px] border border-[var(--border)] bg-[var(--surface-2)]/50 p-4">
      <div className="text-[10.5px] font-medium text-[var(--fg-muted)] uppercase tracking-[0.12em]">
        {label}
      </div>
      <div
        className={cn(
          'mt-1 text-num font-semibold',
          emphasize ? 'text-[var(--accent)] text-[22px]' : 'text-[var(--fg)] text-[17px]',
        )}
      >
        {value}
      </div>
    </div>
  )
}

function LogoMark() {
  return (
    <svg width="26" height="26" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="logo-grad-status" x1="4" y1="4" x2="28" y2="28" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="var(--accent)" />
          <stop offset="1" stopColor="var(--gold)" />
        </linearGradient>
      </defs>
      <path
        d="M8 6H20C24.4183 6 28 9.58172 28 14C28 16.2091 26.2091 18 24 18H12C9.79086 18 8 19.7909 8 22V26C8 27.1046 7.10457 28 6 28H4C2.89543 28 2 27.1046 2 26V12C2 8.68629 4.68629 6 8 6Z"
        fill="url(#logo-grad-status)"
      />
      <circle cx="22.5" cy="23.5" r="3.5" fill="var(--gold)" />
    </svg>
  )
}
