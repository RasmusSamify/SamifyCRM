import { Command } from 'cmdk'
import { useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import { Search, Check, ArrowRight, CornerDownLeft } from 'lucide-react'
import { useCommandPalette } from '@/stores/commandPalette'
import { THEMES, useThemeStore, type ThemeMeta } from '@/stores/theme'
import { navRoutes } from '@/lib/navigation'

export function CommandPalette() {
  const { open, setOpen } = useCommandPalette()
  const navigate = useNavigate()
  const { theme, setTheme } = useThemeStore()

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, setOpen])

  const handleNavigate = (to: string) => {
    setOpen(false)
    navigate(to)
  }

  const groups = ['Översikt', 'CRM', 'Ekonomi', 'Planering', 'Analys', 'System'] as const

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-[90] bg-[var(--bg)]/60 backdrop-blur-md animate-fade-in"
          onClick={() => setOpen(false)}
          aria-hidden
        />
      )}

      <Command.Dialog
        open={open}
        onOpenChange={setOpen}
        label="Command palette"
        className="fixed left-1/2 top-[22%] z-[100] w-[640px] max-w-[90vw] -translate-x-1/2"
      >
        <div className="surface-glow bg-[var(--surface)]/95 border border-[var(--border-strong)] rounded-[16px] shadow-[0_24px_60px_-16px_rgb(0_0_0_/_0.55),_0_8px_16px_-8px_rgb(0_0_0_/_0.40)] overflow-hidden backdrop-blur-xl animate-slide-up">
          {/* Input */}
          <div className="flex items-center gap-3 px-5 h-[52px] border-b border-[var(--border)]">
            <Search size={15} className="text-[var(--fg-subtle)] shrink-0" />
            <Command.Input
              placeholder="Sök eller hoppa till…"
              className="flex-1 bg-transparent border-0 outline-0 text-[14.5px] text-[var(--fg)] placeholder:text-[var(--fg-subtle)] focus:ring-0"
              autoFocus
            />
            <kbd className="hidden sm:inline-flex items-center h-5 px-1.5 rounded-[5px] border border-[var(--border)] bg-[var(--surface-2)] text-[10.5px] font-mono text-[var(--fg-subtle)]">
              esc
            </kbd>
          </div>

          {/* List */}
          <Command.List className="max-h-[420px] overflow-y-auto py-2 px-2">
            <Command.Empty className="py-12 text-center text-[13px] text-[var(--fg-subtle)]">
              Inga träffar.
            </Command.Empty>

            {/* Theme picker */}
            <Command.Group
              heading="Tema"
              className="[&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-2 [&_[cmdk-group-heading]]:text-[10.5px] [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-[0.14em] [&_[cmdk-group-heading]]:text-[var(--fg-subtle)]"
            >
              {THEMES.map((t) => (
                <ThemeCommandRow
                  key={t.id}
                  theme={t}
                  active={t.id === theme}
                  onSelect={() => setTheme(t.id)}
                />
              ))}
            </Command.Group>

            {/* Navigation */}
            {groups.map((group) => {
              const items = navRoutes.filter((r) => r.group === group)
              if (items.length === 0) return null
              return (
                <Command.Group
                  key={group}
                  heading={group}
                  className="[&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-2 [&_[cmdk-group-heading]]:mt-1 [&_[cmdk-group-heading]]:text-[10.5px] [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-[0.14em] [&_[cmdk-group-heading]]:text-[var(--fg-subtle)]"
                >
                  {items.map((route) => (
                    <CommandRow
                      key={route.to}
                      icon={route.icon}
                      label={route.label}
                      description={route.description}
                      value={[route.label, route.description, ...(route.keywords ?? [])].join(' ')}
                      shortcut={route.shortcut}
                      onSelect={() => handleNavigate(route.to)}
                    />
                  ))}
                </Command.Group>
              )
            })}
          </Command.List>

          {/* Footer */}
          <div className="flex items-center justify-between px-5 h-[38px] border-t border-[var(--border)] bg-[var(--surface-2)]/50 text-[11px] text-[var(--fg-subtle)]">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <ArrowRight size={11} className="rotate-90" />
                Navigera
              </span>
              <span className="flex items-center gap-1.5">
                <CornerDownLeft size={11} />
                Välj
              </span>
            </div>
            <span className="font-mono">Samify CRM</span>
          </div>
        </div>
      </Command.Dialog>
    </>
  )
}

interface CommandRowProps {
  icon: React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>
  label: string
  description?: string
  value: string
  shortcut?: string
  onSelect: () => void
}

function CommandRow({
  icon: Icon,
  label,
  description,
  value,
  shortcut,
  onSelect,
}: CommandRowProps) {
  return (
    <Command.Item
      value={value}
      onSelect={onSelect}
      className="group flex items-center gap-3 h-11 px-3 rounded-[9px] cursor-pointer text-[13.5px] text-[var(--fg-muted)] data-[selected=true]:bg-[var(--surface-2)] data-[selected=true]:text-[var(--fg)] transition-colors"
    >
      <div className="h-7 w-7 rounded-md flex items-center justify-center border border-[var(--border)] bg-[var(--surface)] group-data-[selected=true]:border-[color-mix(in_oklch,var(--accent)_30%,transparent)] group-data-[selected=true]:bg-[color-mix(in_oklch,var(--accent)_10%,transparent)] transition-colors">
        <Icon
          size={14}
          strokeWidth={2}
          className="text-[var(--fg-subtle)] group-data-[selected=true]:text-[var(--accent)] transition-colors"
        />
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-medium truncate">{label}</div>
        {description && (
          <div className="text-[11.5px] text-[var(--fg-subtle)] truncate mt-0.5">
            {description}
          </div>
        )}
      </div>
      {shortcut && (
        <kbd className="inline-flex items-center h-5 px-1.5 rounded-[5px] border border-[var(--border)] bg-[var(--surface)] text-[10.5px] font-mono text-[var(--fg-subtle)]">
          ⌘{shortcut}
        </kbd>
      )}
    </Command.Item>
  )
}

function ThemeCommandRow({
  theme,
  active,
  onSelect,
}: {
  theme: ThemeMeta
  active: boolean
  onSelect: () => void
}) {
  return (
    <Command.Item
      value={`tema ${theme.id} ${theme.label} ${theme.tagline}`}
      onSelect={onSelect}
      className="group flex items-center gap-3 h-11 px-3 rounded-[9px] cursor-pointer text-[13.5px] text-[var(--fg-muted)] data-[selected=true]:bg-[var(--surface-2)] data-[selected=true]:text-[var(--fg)] transition-colors"
    >
      <div
        className="h-7 w-7 rounded-md overflow-hidden border border-[var(--border)] shrink-0 relative"
        style={{ background: theme.swatchBg }}
      >
        <div
          className="absolute bottom-1 right-1 h-2.5 w-2.5 rounded-full"
          style={{ background: theme.swatchAccent }}
        />
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-medium truncate">{theme.label}</div>
        <div className="text-[11.5px] text-[var(--fg-subtle)] truncate mt-0.5">
          {theme.tagline}
        </div>
      </div>
      {active && <Check size={14} className="text-[var(--accent)] shrink-0" />}
    </Command.Item>
  )
}
