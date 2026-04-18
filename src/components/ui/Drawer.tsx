import { useEffect, type ReactNode } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/cn'

interface DrawerProps {
  open: boolean
  onClose: () => void
  title?: string
  subtitle?: string
  action?: ReactNode
  children: ReactNode
  width?: 'md' | 'lg' | 'xl'
}

const widthMap = {
  md: 'max-w-[520px]',
  lg: 'max-w-[680px]',
  xl: 'max-w-[860px]',
}

export function Drawer({
  open,
  onClose,
  title,
  subtitle,
  action,
  children,
  width = 'lg',
}: DrawerProps) {
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

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          'fixed inset-0 z-[70] transition-opacity duration-200',
          open
            ? 'bg-[var(--bg)]/60 backdrop-blur-md opacity-100'
            : 'opacity-0 pointer-events-none',
        )}
        onClick={onClose}
        aria-hidden
      />
      {/* Panel */}
      <aside
        className={cn(
          'fixed top-0 right-0 bottom-0 z-[71] w-full bg-[var(--surface)] border-l border-[var(--border-strong)] shadow-[var(--shadow-lg)] flex flex-col transition-transform duration-300 ease-out',
          widthMap[width],
          open ? 'translate-x-0' : 'translate-x-full',
        )}
        role="dialog"
        aria-modal="true"
      >
        {(title || action) && (
          <div className="shrink-0 flex items-start justify-between gap-4 px-6 py-5 border-b border-[var(--border)]">
            <div className="flex-1 min-w-0">
              {title && (
                <h2 className="text-[18px] font-semibold text-[var(--fg)] tracking-tight truncate">
                  {title}
                </h2>
              )}
              {subtitle && (
                <p className="mt-0.5 text-[13px] text-[var(--fg-muted)] truncate">{subtitle}</p>
              )}
            </div>
            <div className="flex items-center gap-2">
              {action}
              <button
                type="button"
                onClick={onClose}
                aria-label="Stäng"
                className="h-8 w-8 rounded-md flex items-center justify-center text-[var(--fg-subtle)] hover:text-[var(--fg)] hover:bg-[var(--surface-2)] transition-colors"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto">{children}</div>
      </aside>
    </>
  )
}
