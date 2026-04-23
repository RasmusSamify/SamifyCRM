import { forwardRef, type InputHTMLAttributes, type TextareaHTMLAttributes } from 'react'
import { cn } from '@/lib/cn'

const base =
  'w-full bg-[var(--bg)] border border-[var(--border)] rounded-[10px] px-3.5 text-[14px] text-[var(--fg)] placeholder:text-[var(--fg-subtle)] transition-colors outline-none focus:border-[color-mix(in_oklch,var(--accent)_40%,transparent)] focus:ring-1 focus:ring-[color-mix(in_oklch,var(--accent)_25%,transparent)]'

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input ref={ref} className={cn(base, 'h-10', className)} {...props} />
  ),
)
Input.displayName = 'Input'

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    rows={4}
    className={cn(base, 'py-2.5 resize-y min-h-[80px]', className)}
    {...props}
  />
))
Textarea.displayName = 'Textarea'

interface FieldProps {
  label: React.ReactNode
  hint?: string
  children: React.ReactNode
  className?: string
}

export function Field({ label, hint, children, className }: FieldProps) {
  return (
    <label className={cn('block', className)}>
      <span className="block text-[11.5px] font-medium text-[var(--fg-muted)] uppercase tracking-[0.12em] mb-1.5">
        {label}
      </span>
      {children}
      {hint && <span className="mt-1 block text-[11.5px] text-[var(--fg-subtle)]">{hint}</span>}
    </label>
  )
}
