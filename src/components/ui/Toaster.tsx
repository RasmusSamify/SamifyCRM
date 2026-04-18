import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react'
import { useToastStore, type ToastTone } from '@/stores/toast'
import { cn } from '@/lib/cn'

const toneMap: Record<ToastTone, { icon: typeof CheckCircle2; color: string }> = {
  success: { icon: CheckCircle2, color: 'var(--color-success)' },
  error: { icon: AlertCircle, color: 'var(--color-danger)' },
  info: { icon: Info, color: 'var(--color-info)' },
}

export function Toaster() {
  const { toasts, dismiss } = useToastStore()

  return (
    <div className="fixed bottom-5 right-5 z-[200] flex flex-col gap-2 pointer-events-none">
      {toasts.map((t) => {
        const { icon: Icon, color } = toneMap[t.tone]
        return (
          <div
            key={t.id}
            className={cn(
              'pointer-events-auto flex items-start gap-3 min-w-[280px] max-w-[400px]',
              'rounded-[12px] border border-[var(--border-strong)] bg-[var(--surface)]/95 backdrop-blur-xl',
              'px-4 py-3 shadow-[var(--shadow-lg)] animate-slide-up',
            )}
            role="status"
          >
            <Icon size={16} className="mt-0.5 shrink-0" style={{ color }} />
            <div className="flex-1 min-w-0">
              <div className="text-[13.5px] font-medium text-[var(--fg)]">{t.title}</div>
              {t.description && (
                <div className="mt-0.5 text-[12.5px] text-[var(--fg-muted)]">
                  {t.description}
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={() => dismiss(t.id)}
              aria-label="Stäng"
              className="shrink-0 h-6 w-6 rounded-md flex items-center justify-center text-[var(--fg-subtle)] hover:text-[var(--fg)] hover:bg-[var(--surface-2)] transition-colors"
            >
              <X size={13} />
            </button>
          </div>
        )
      })}
    </div>
  )
}
