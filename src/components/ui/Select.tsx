import { forwardRef, type SelectHTMLAttributes } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/cn'

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className, children, ...props }, ref) => (
    <div className="relative">
      <select
        ref={ref}
        className={cn(
          'w-full appearance-none h-10 pl-3.5 pr-9 rounded-[10px] bg-[var(--bg)] border border-[var(--border)] text-[14px] text-[var(--fg)] transition-colors outline-none',
          'focus:border-[color-mix(in_oklch,var(--accent)_40%,transparent)] focus:ring-1 focus:ring-[color-mix(in_oklch,var(--accent)_25%,transparent)]',
          className,
        )}
        {...props}
      >
        {children}
      </select>
      <ChevronDown
        size={14}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--fg-subtle)] pointer-events-none"
      />
    </div>
  ),
)
Select.displayName = 'Select'
