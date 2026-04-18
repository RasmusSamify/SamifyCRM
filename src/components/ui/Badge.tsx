import { cva, type VariantProps } from 'class-variance-authority'
import type { HTMLAttributes } from 'react'
import { cn } from '@/lib/cn'

const badgeStyles = cva(
  'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11.5px] font-medium uppercase tracking-wider',
  {
    variants: {
      variant: {
        default:
          'bg-[var(--surface-2)] text-[var(--fg-muted)] border border-[var(--border)]',
        accent:
          'bg-[color-mix(in_oklch,var(--accent)_15%,transparent)] text-[var(--accent)] border border-[color-mix(in_oklch,var(--accent)_30%,transparent)]',
        success:
          'bg-[color-mix(in_oklch,var(--color-success)_15%,transparent)] text-[var(--color-success)] border border-[color-mix(in_oklch,var(--color-success)_30%,transparent)]',
        warning:
          'bg-[color-mix(in_oklch,var(--color-warning)_15%,transparent)] text-[var(--color-warning)] border border-[color-mix(in_oklch,var(--color-warning)_30%,transparent)]',
        danger:
          'bg-[color-mix(in_oklch,var(--color-danger)_15%,transparent)] text-[var(--color-danger)] border border-[color-mix(in_oklch,var(--color-danger)_30%,transparent)]',
        violet:
          'bg-[color-mix(in_oklch,var(--color-violet)_15%,transparent)] text-[var(--color-violet)] border border-[color-mix(in_oklch,var(--color-violet)_30%,transparent)]',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

export interface BadgeProps
  extends HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeStyles> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeStyles({ variant }), className)} {...props} />
}
