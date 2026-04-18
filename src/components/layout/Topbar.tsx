import { Search, Moon, Sun, Bell, Sparkles } from 'lucide-react'
import { useThemeStore } from '@/stores/theme'
import { useCommandPalette } from '@/stores/commandPalette'
import { Button } from '@/components/ui/Button'

interface TopbarProps {
  title: string
  subtitle?: string
  action?: React.ReactNode
}

export function Topbar({ title, subtitle, action }: TopbarProps) {
  const { theme, toggle } = useThemeStore()
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

          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Växla tema"
            onClick={toggle}
          >
            {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
          </Button>

          {/* Avatar */}
          <div className="ml-2 h-8 w-8 rounded-full bg-gradient-to-br from-[var(--accent)] to-[var(--color-violet)] flex items-center justify-center text-[11px] font-semibold text-[var(--accent-fg)] cursor-pointer select-none">
            RS
          </div>
        </div>
      </div>
    </header>
  )
}
