import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

interface EmptyStateProps {
  icon?: LucideIcon
  title: string
  description?: string
  action?: ReactNode
  className?: string
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div className={cn('text-center px-8 py-16', className)}>
      {Icon && (
        <div className="inline-flex h-12 w-12 rounded-2xl bg-[var(--surface-2)] border border-[var(--border-strong)] items-center justify-center mb-4">
          <Icon size={20} className="text-[var(--fg-subtle)]" strokeWidth={1.75} />
        </div>
      )}
      <h3 className="text-[16px] font-semibold text-[var(--fg)] tracking-tight">{title}</h3>
      {description && (
        <p className="mt-1.5 text-[13.5px] text-[var(--fg-muted)] max-w-sm mx-auto">
          {description}
        </p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}
