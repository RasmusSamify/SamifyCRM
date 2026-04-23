import { useState, type FormEvent } from 'react'
import { Navigate } from 'react-router-dom'
import { Mail, Lock, Loader2, ArrowRight, CheckCircle2 } from 'lucide-react'
import { signIn, signUp, useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/cn'

type Mode = 'signin' | 'signup'

export function LoginPage() {
  const { isAuthenticated, loading } = useAuth()
  const [mode, setMode] = useState<Mode>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 size={22} className="animate-spin text-[var(--fg-subtle)]" />
      </div>
    )
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />
  }

  const switchMode = (next: Mode) => {
    setMode(next)
    setError(null)
    setInfo(null)
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setInfo(null)
    setSubmitting(true)
    if (mode === 'signin') {
      const { error } = await signIn(email, password)
      setSubmitting(false)
      if (error) setError(mapError(error.message))
    } else {
      if (password.length < 6) {
        setSubmitting(false)
        setError('Lösenordet måste vara minst 6 tecken.')
        return
      }
      const { data, error } = await signUp(email, password)
      setSubmitting(false)
      if (error) {
        setError(mapError(error.message))
      } else if (data.session) {
        /* auto-signed in */
      } else {
        setInfo('Konto skapat! Kolla din e-post för bekräftelselänk och logga sedan in.')
        setMode('signin')
      }
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-10">
      {/* Ambient accents */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          background:
            'radial-gradient(ellipse 50% 40% at 50% 0%, oklch(0.72 0.18 62 / 0.10), transparent 65%), radial-gradient(ellipse 60% 60% at 50% 100%, oklch(0.40 0.20 265 / 0.20), transparent 60%)',
        }}
      />

      <div className="relative w-full max-w-[420px] animate-slide-up">
        {/* Brand */}
        <div className="mb-10 text-center">
          <div className="inline-flex items-baseline gap-2.5 mb-3">
            <LogoMark />
            <span className="font-display italic text-[32px] text-[var(--fg)] tracking-tight leading-none">
              Samify
            </span>
            <span className="font-mono text-[11px] text-[var(--fg-subtle)] uppercase tracking-[0.14em]">
              / crm
            </span>
          </div>
          <p className="text-[14px] text-[var(--fg-muted)]">
            {mode === 'signin'
              ? 'Välkommen tillbaka. Logga in för att fortsätta.'
              : 'Skapa ett konto för att komma igång.'}
          </p>
        </div>

        {/* Card */}
        <form
          onSubmit={handleSubmit}
          className="surface-glow bg-[var(--surface)]/95 border border-[var(--border)] rounded-[18px] p-8 backdrop-blur-xl shadow-[0_24px_60px_-16px_rgb(0_0_0_/_0.55)]"
        >
          {/* Mode tabs */}
          <div className="mb-5 flex items-center gap-1 p-1 rounded-[10px] bg-[var(--bg)] border border-[var(--border)]">
            <ModeTab active={mode === 'signin'} onClick={() => switchMode('signin')}>
              Logga in
            </ModeTab>
            <ModeTab active={mode === 'signup'} onClick={() => switchMode('signup')}>
              Skapa konto
            </ModeTab>
          </div>

          <div className="space-y-4">
            <Field
              label="E-post"
              icon={Mail}
              type="email"
              value={email}
              onChange={setEmail}
              placeholder="du@exempel.se"
              autoComplete="email"
              autoFocus
            />
            <Field
              label="Lösenord"
              icon={Lock}
              type="password"
              value={password}
              onChange={setPassword}
              placeholder={mode === 'signup' ? 'Minst 6 tecken' : '••••••••'}
              autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
            />
          </div>

          {info && (
            <div className="mt-4 px-3 py-2.5 rounded-[8px] border border-[color-mix(in_oklch,var(--color-success)_30%,transparent)] bg-[color-mix(in_oklch,var(--color-success)_10%,transparent)] text-[12.5px] text-[var(--color-success)] flex items-start gap-2">
              <CheckCircle2 size={14} className="mt-0.5 shrink-0" />
              <span>{info}</span>
            </div>
          )}

          {error && (
            <div className="mt-4 px-3 py-2 rounded-[8px] border border-[color-mix(in_oklch,var(--color-danger)_30%,transparent)] bg-[color-mix(in_oklch,var(--color-danger)_10%,transparent)] text-[12.5px] text-[var(--color-danger)]">
              {error}
            </div>
          )}

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="mt-6 w-full"
            disabled={submitting || !email || !password}
          >
            {submitting ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <>
                {mode === 'signin' ? 'Logga in' : 'Skapa konto'}
                <ArrowRight size={15} />
              </>
            )}
          </Button>
        </form>

        <p className="mt-6 text-center text-[11.5px] text-[var(--fg-subtle)]">
          Skyddad av Supabase · Samify Workspace
        </p>
      </div>
    </div>
  )
}

function ModeTab({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex-1 h-8 rounded-[7px] text-[12.5px] font-medium transition-all',
        active
          ? 'bg-[var(--surface-2)] text-[var(--fg)] shadow-[inset_0_0_0_1px_var(--border)]'
          : 'text-[var(--fg-muted)] hover:text-[var(--fg)]',
      )}
    >
      {children}
    </button>
  )
}

interface FieldProps {
  label: string
  icon: React.ComponentType<{ size?: number; className?: string; strokeWidth?: number }>
  type: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  autoComplete?: string
  autoFocus?: boolean
}

function Field({
  label,
  icon: Icon,
  type,
  value,
  onChange,
  placeholder,
  autoComplete,
  autoFocus,
}: FieldProps) {
  return (
    <label className="block">
      <span className="block text-[11.5px] font-medium text-[var(--fg-muted)] uppercase tracking-[0.12em] mb-1.5">
        {label}
      </span>
      <div
        className={cn(
          'group flex items-center gap-2.5 h-11 px-3.5 rounded-[10px] border border-[var(--border)] bg-[var(--bg)] transition-colors',
          'focus-within:border-[color-mix(in_oklch,var(--accent)_40%,transparent)] focus-within:ring-1 focus-within:ring-[color-mix(in_oklch,var(--accent)_25%,transparent)]',
        )}
      >
        <Icon size={14} strokeWidth={2} className="text-[var(--fg-subtle)] shrink-0" />
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          autoFocus={autoFocus}
          className="flex-1 bg-transparent border-0 outline-0 text-[14px] text-[var(--fg)] placeholder:text-[var(--fg-subtle)]"
        />
      </div>
    </label>
  )
}

function LogoMark() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="logo-grad-login" x1="4" y1="4" x2="28" y2="28" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="var(--accent)" />
          <stop offset="1" stopColor="var(--gold)" />
        </linearGradient>
      </defs>
      <path
        d="M8 6H20C24.4183 6 28 9.58172 28 14C28 16.2091 26.2091 18 24 18H12C9.79086 18 8 19.7909 8 22V26C8 27.1046 7.10457 28 6 28H4C2.89543 28 2 27.1046 2 26V12C2 8.68629 4.68629 6 8 6Z"
        fill="url(#logo-grad-login)"
      />
      <circle cx="22.5" cy="23.5" r="3.5" fill="var(--gold)" />
    </svg>
  )
}

function mapError(message: string) {
  if (/invalid.*credentials/i.test(message)) return 'Fel e-post eller lösenord.'
  if (/rate/i.test(message)) return 'För många försök. Försök igen om en stund.'
  if (/network|fetch/i.test(message)) return 'Nätverksfel. Kontrollera din uppkoppling.'
  return message
}
