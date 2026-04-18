import { cn } from '@/lib/cn'

interface ProgressProps {
  value: number
  max?: number
  className?: string
  tone?: 'auto' | 'brand' | 'success' | 'warning' | 'danger'
  showLabel?: boolean
}

export function Progress({
  value,
  max = 100,
  className,
  tone = 'auto',
  showLabel = false,
}: ProgressProps) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100))
  const resolvedTone =
    tone === 'auto'
      ? pct >= 85
        ? 'success'
        : pct >= 60
          ? 'brand'
          : pct >= 35
            ? 'warning'
            : 'danger'
      : tone

  const colorMap = {
    brand: 'var(--accent)',
    success: 'var(--color-success)',
    warning: 'var(--color-warning)',
    danger: 'var(--color-danger)',
  } as const

  const color = colorMap[resolvedTone as keyof typeof colorMap]

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className="flex-1 h-1 rounded-full bg-[var(--surface-3)] overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
      {showLabel && (
        <span className="text-num text-[11.5px] text-[var(--fg-muted)] w-8 text-right">
          {Math.round(pct)}
        </span>
      )}
    </div>
  )
}
