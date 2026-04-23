import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Search, Palette, Check, Bell, Sparkles } from 'lucide-react'
import { THEMES, useThemeStore, type ThemeMeta } from '@/stores/theme'
import { useCommandPalette } from '@/stores/commandPalette'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/cn'

interface TopbarProps {
  title: string
  subtitle?: string
  action?: React.ReactNode
}

export function Topbar({ title, subtitle, action }: TopbarProps) {
  const openPalette = useCommandPalette((s) => s.setOpen)

  return (
    <header className="h-[60px] shrink-0 border-b border-[var(--border)] bg-[var(--bg)]/80 backdrop-blur-md sticky top-0 z-30">
      <div className="h-full px-6 flex items-center justify-between gap-6">
        {/* Title */}
        <div className="flex items-center gap-4 min-w-0">
          <div className="min-w-0">
            <h1 className="text-[17px] font-semibold text-[var(--fg)] tracking-tight truncate">
              {title}
            </h1>
            {subtitle && (
              <p className="text-[12px] text-[var(--fg-subtle)] truncate">{subtitle}</p>
            )}
          </div>
        </div>

        {/* Search */}
        <div className="flex-1 max-w-md mx-auto">
          <button
            type="button"
            onClick={() => openPalette(true)}
            className="w-full group flex items-center gap-2.5 h-9 px-3 rounded-[10px] border border-[var(--border)] bg-[var(--surface)] hover:border-[var(--border-strong)] transition-colors text-left"
          >
            <Search size={14} className="text-[var(--fg-subtle)] shrink-0" />
            <span className="flex-1 text-[13px] text-[var(--fg-subtle)]">
              Sök kunder, deals, fakturor…
            </span>
            <kbd className="hidden sm:inline-flex items-center gap-0.5 h-5 px-1.5 rounded-[5px] border border-[var(--border)] bg-[var(--surface-2)] text-[10.5px] font-mono text-[var(--fg-subtle)]">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1.5">
          {action}

          <Button variant="ghost" size="icon-sm" aria-label="AI-assistent">
            <Sparkles size={15} className="text-[var(--accent)]" />
          </Button>

          <Button variant="ghost" size="icon-sm" aria-label="Notiser">
            <Bell size={15} />
          </Button>

          <ThemePicker />

          {/* Avatar */}
          <div className="ml-2 h-8 w-8 rounded-full bg-gradient-to-br from-[var(--accent)] to-[var(--color-violet)] flex items-center justify-center text-[11px] font-semibold text-[var(--accent-fg)] cursor-pointer select-none">
            RS
          </div>
        </div>
      </div>
    </header>
  )
}

function ThemePicker() {
  const { theme, setTheme } = useThemeStore()
  const [open, setOpen] = useState(false)
  const [coords, setCoords] = useState<{ top: number; right: number } | null>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const popoverRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    if (!open || !triggerRef.current) return
    const measure = () => {
      if (!triggerRef.current) return
      const r = triggerRef.current.getBoundingClientRect()
      setCoords({
        top: r.bottom + 8,
        right: window.innerWidth - r.right,
      })
    }
    measure()
    window.addEventListener('resize', measure)
    window.addEventListener('scroll', measure, true)
    return () => {
      window.removeEventListener('resize', measure)
      window.removeEventListener('scroll', measure, true)
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const onClick = (e: MouseEvent) => {
      const target = e.target as Node
      if (triggerRef.current?.contains(target)) return
      if (popoverRef.current?.contains(target)) return
      setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <>
      <Button
        ref={triggerRef}
        variant="ghost"
        size="icon-sm"
        aria-label="Byt tema"
        onClick={() => setOpen((o) => !o)}
      >
        <Palette size={15} />
      </Button>

      {open &&
        coords &&
        createPortal(
          <div
            ref={popoverRef}
            style={{
              position: 'fixed',
              top: coords.top,
              right: coords.right,
              zIndex: 100,
            }}
            className="w-[244px] surface-glow bg-[var(--surface)]/95 backdrop-blur-xl border border-[var(--border-strong)] rounded-[12px] p-1.5 shadow-[0_14px_40px_-10px_rgb(0_0_0_/_0.45)] animate-slide-up"
          >
            <div className="px-3 py-2 text-[10.5px] font-semibold text-[var(--fg-subtle)] uppercase tracking-[0.14em]">
              Tema
            </div>
            {THEMES.map((t) => {
              const active = t.id === theme
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTheme(t.id)}
                  className={cn(
                    'w-full flex items-center gap-3 h-11 px-2.5 rounded-[8px] text-left transition-colors',
                    active ? 'bg-[var(--surface-2)]' : 'hover:bg-[var(--surface-2)]/60',
                  )}
                >
                  <ThemeSwatch theme={t} />
                  <div className="flex-1 min-w-0">
                    <div className="text-[12.5px] font-medium text-[var(--fg)]">{t.label}</div>
                    <div className="text-[11px] text-[var(--fg-subtle)] truncate">{t.tagline}</div>
                  </div>
                  {active && <Check size={14} className="text-[var(--accent)] shrink-0" />}
                </button>
              )
            })}
          </div>,
          document.body,
        )}
    </>
  )
}

function ThemeSwatch({ theme }: { theme: ThemeMeta }) {
  return (
    <div
      className="h-7 w-7 rounded-md overflow-hidden border border-[var(--border)] shrink-0 relative"
      style={{ background: theme.swatchBg }}
    >
      <div
        className="absolute bottom-1 right-1 h-2.5 w-2.5 rounded-full"
        style={{ background: theme.swatchAccent }}
      />
    </div>
  )
}
