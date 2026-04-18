import { useEffect, type ReactNode } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/cn'

interface DialogProps {
  open: boolean
  onClose: () => void
  title: string
  description?: string
  children: ReactNode
  footer?: ReactNode
  size?: 'sm' | 'md' | 'lg'
}

const sizeMap = {
  sm: 'max-w-[440px]',
  md: 'max-w-[560px]',
  lg: 'max-w-[720px]',
}

export function Dialog({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = 'md',
}: DialogProps) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="dialog-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-[var(--bg)]/70 backdrop-blur-md animate-fade-in"
        onClick={onClose}
        aria-hidden
      />

      {/* Panel */}
      <div
        className={cn(
          'relative w-full surface-glow bg-[var(--surface)]/95 border border-[var(--border-strong)] rounded-[16px] shadow-[0_24px_60px_-16px_rgb(0_0_0_/_0.55),_0_8px_16px_-8px_rgb(0_0_0_/_0.40)] backdrop-blur-xl animate-slide-up',
          sizeMap[size],
        )}
      >
        <div className="flex items-start justify-between gap-4 p-6 pb-4">
          <div className="flex-1 min-w-0">
            <h2
              id="dialog-title"
              className="text-[18px] font-semibold text-[var(--fg)] tracking-tight"
            >
              {title}
            </h2>
            {description && (
              <p className="mt-1 text-[13.5px] text-[var(--fg-muted)]">{description}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Stäng"
            className="shrink-0 h-8 w-8 rounded-md flex items-center justify-center text-[var(--fg-subtle)] hover:text-[var(--fg)] hover:bg-[var(--surface-2)] transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <div className="px-6 pb-6 max-h-[70vh] overflow-y-auto">{children}</div>

        {footer && (
          <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-[var(--border)] bg-[var(--surface-2)]/40 rounded-b-[16px]">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}
