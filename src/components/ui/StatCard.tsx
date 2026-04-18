import type { LucideIcon } from 'lucide-react'
import { ArrowDownRight, ArrowUpRight } from 'lucide-react'
import { cn } from '@/lib/cn'

interface StatCardProps {
  label: string
  value: string
  delta?: { value: string; positive: boolean }
  icon?: LucideIcon
  accent?: 'brand' | 'violet' | 'success' | 'warning' | 'danger' | 'neutral'
  hint?: string
}

const accentMap = {
  brand: 'var(--accent)',
  violet: 'var(--color-violet)',
  success: 'var(--color-success)',
  warning: 'var(--color-warning)',
  danger: 'var(--color-danger)',
  neutral: 'var(--fg-muted)',
}

export function StatCard({
  label,
  value,
  delta,
  icon: Icon,
  accent = 'brand',
  hint,
}: StatCardProps) {
  const color = accentMap[accent]
  return (
    <div
      className="surface-glow relative overflow-hidden rounded-[14px] bg-[var(--surface)] border border-[var(--border)] p-5 hover:border-[var(--border-strong)] transition-colors"
      style={{ ['--card-accent' as string]: color }}
    >
      {/* Accent bar */}
      <div
        className="absolute top-0 left-0 right-0 h-px opacity-60"
        style={{ background: `linear-gradient(90deg, transparent, ${color}, transparent)` }}
      />

      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          {Icon && (
            <div
              className="h-7 w-7 rounded-lg flex items-center justify-center border"
              style={{
                background: `color-mix(in oklch, ${color} 10%, transparent)`,
                borderColor: `color-mix(in oklch, ${color} 25%, transparent)`,
                color,
              }}
            >
              <Icon size={14} strokeWidth={2} />
            </div>
          )}
          <span className="text-[11.5px] font-medium text-[var(--fg-muted)] uppercase tracking-wider">
            {label}
          </span>
        </div>
        {delta && (
          <span
            className={cn(
              'inline-flex items-center gap-0.5 text-[11px] font-medium tabular-nums',
              delta.positive ? 'text-[var(--color-success)]' : 'text-[var(--color-danger)]',
            )}
          >
            {delta.positive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
            {delta.value}
          </span>
        )}
      </div>

      <div className="mt-4">
        <div className="text-display-2 text-[var(--fg)]">{value}</div>
        {hint && (
          <div className="mt-1.5 text-[12.5px] text-[var(--fg-subtle)]">{hint}</div>
        )}
      </div>
    </div>
  )
}
