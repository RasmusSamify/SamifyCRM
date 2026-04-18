import type { LucideIcon } from 'lucide-react'
import { Construction } from 'lucide-react'
import { PageShell } from './PageShell'
import { Card } from '@/components/ui/Card'

interface PlaceholderPageProps {
  title: string
  subtitle?: string
  icon?: LucideIcon
  description?: string
}

export function PlaceholderPage({
  title,
  subtitle,
  icon: Icon = Construction,
  description,
}: PlaceholderPageProps) {
  return (
    <PageShell title={title} subtitle={subtitle}>
      <Card className="relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{
            background:
              'radial-gradient(circle at 50% 0%, var(--accent), transparent 60%)',
          }}
        />
        <div className="relative px-10 py-20 text-center flex flex-col items-center">
          <div className="h-14 w-14 rounded-2xl flex items-center justify-center bg-[var(--surface-2)] border border-[var(--border-strong)]">
            <Icon size={24} className="text-[var(--accent)]" strokeWidth={1.75} />
          </div>
          <h2 className="mt-6 text-display-2 text-[var(--fg)]">{title}</h2>
          <p className="mt-3 max-w-md text-[14px] text-[var(--fg-muted)] leading-relaxed">
            {description ??
              'Den här modulen migreras just nu från den tidigare CRM-versionen. Designen är på plats — funktionaliteten byggs upp steg för steg.'}
          </p>
          <div className="mt-6 flex items-center gap-2 text-[11.5px] text-[var(--fg-subtle)] uppercase tracking-[0.14em]">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)] animate-pulse-soft" />
            Under byggnation
          </div>
        </div>
      </Card>
    </PageShell>
  )
}
