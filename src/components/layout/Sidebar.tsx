import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  GitBranch,
  Receipt,
  FileText,
  Wallet,
  FileSignature,
  PenLine,
  Calendar,
  BellRing,
  TrendingUp,
  Settings,
  ChevronsUpDown,
  Sparkles,
  LogOut,
  type LucideIcon,
} from 'lucide-react'
import { cn } from '@/lib/cn'
import { signOut, useAuth } from '@/hooks/useAuth'

interface NavItem {
  to: string
  label: string
  icon: LucideIcon
  shortcut?: string
  badge?: number
}

interface NavSection {
  title: string
  items: NavItem[]
}

const sections: NavSection[] = [
  {
    title: 'Översikt',
    items: [{ to: '/', label: 'Dashboard', icon: LayoutDashboard, shortcut: '1' }],
  },
  {
    title: 'CRM',
    items: [
      { to: '/kunder', label: 'Kunder', icon: Users, shortcut: '2', badge: 14 },
      { to: '/pipeline', label: 'Pipeline', icon: GitBranch, shortcut: '3', badge: 8 },
      { to: '/offerter', label: 'Offerter', icon: PenLine, shortcut: '4' },
    ],
  },
  {
    title: 'Ekonomi',
    items: [
      { to: '/fakturor', label: 'Fakturor', icon: Receipt, shortcut: '5', badge: 2 },
      { to: '/avtal', label: 'Avtal', icon: FileText, shortcut: '6' },
      { to: '/kostnader', label: 'Kostnader', icon: Wallet, shortcut: '7' },
    ],
  },
  {
    title: 'Planering',
    items: [
      { to: '/kalender', label: 'Kalender', icon: Calendar, shortcut: '8' },
      { to: '/paminnelser', label: 'Påminnelser', icon: BellRing, shortcut: '9', badge: 3 },
      { to: '/scrive', label: 'Scrive', icon: FileSignature },
    ],
  },
  {
    title: 'Analys',
    items: [{ to: '/mrr', label: 'MRR-historik', icon: TrendingUp }],
  },
]

export function Sidebar() {
  const { user } = useAuth()
  const email = user?.email ?? ''
  const displayName =
    (user?.user_metadata?.display_name as string | undefined) ||
    email.split('@')[0] ||
    'Användare'
  const initials = displayName
    .split(/[\s.@]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || 'U'

  return (
    <aside className="h-screen w-[248px] shrink-0 bg-[var(--bg)] flex flex-col relative">
      {/* Right-edge gradient border */}
      <div
        className="absolute top-0 right-0 bottom-0 w-px pointer-events-none"
        style={{
          background:
            'linear-gradient(180deg, transparent 0%, var(--border-strong) 15%, var(--border-strong) 85%, transparent 100%)',
        }}
      />

      {/* Brand */}
      <div className="h-[60px] px-5 flex items-center">
        <div className="flex items-baseline gap-2">
          <LogoMark />
          <span className="font-display italic text-[22px] text-[var(--fg)] tracking-tight leading-none">
            Samify
          </span>
          <span className="font-mono text-[10.5px] text-[var(--fg-subtle)] uppercase tracking-[0.12em]">
            / crm
          </span>
        </div>
      </div>

      {/* Gradient divider */}
      <div
        className="h-px mx-5"
        style={{
          background:
            'linear-gradient(90deg, transparent, var(--border-strong), transparent)',
        }}
      />

      {/* Workspace switcher teaser */}
      <button
        type="button"
        className="group mx-3 mt-3 mb-1 flex items-center gap-2.5 h-10 px-2.5 rounded-[10px] border border-transparent hover:border-[var(--border)] hover:bg-[var(--surface)] transition-colors"
      >
        <div className="relative shrink-0">
          <div className="h-6 w-6 rounded-md bg-gradient-to-br from-[var(--accent)] to-[var(--gold)] flex items-center justify-center text-[10px] font-bold text-[var(--accent-fg)]">
            S
          </div>
          <div className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full bg-[var(--color-success)] border-2 border-[var(--bg)]" />
        </div>
        <div className="flex-1 min-w-0 text-left">
          <div className="text-[12.5px] font-medium text-[var(--fg)] truncate leading-tight">
            Samify Workspace
          </div>
          <div className="text-[10.5px] text-[var(--fg-subtle)] truncate leading-tight mt-0.5">
            Aktiv · Pro
          </div>
        </div>
        <ChevronsUpDown
          size={13}
          className="text-[var(--fg-subtle)] group-hover:text-[var(--fg-muted)] transition-colors shrink-0"
        />
      </button>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 pt-3 pb-3">
        {sections.map((section, sIdx) => (
          <div key={section.title} className={cn(sIdx > 0 && 'mt-5')}>
            <div className="px-3 mb-1.5 flex items-center gap-2">
              <span className="text-[10px] font-semibold text-[var(--fg-subtle)] uppercase tracking-[0.16em]">
                {section.title}
              </span>
              <div
                className="flex-1 h-px"
                style={{
                  background:
                    'linear-gradient(90deg, var(--border), transparent)',
                }}
              />
            </div>
            <div className="space-y-[2px]">
              {section.items.map((item) => (
                <NavItemLink key={item.to} item={item} />
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Bottom user card */}
      <div className="p-3 pt-2">
        {/* AI hint card */}
        <div className="mb-2 relative overflow-hidden rounded-[10px] border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5">
          <div
            className="absolute inset-0 opacity-[0.08] pointer-events-none"
            style={{
              background:
                'radial-gradient(circle at 100% 0%, var(--accent), transparent 60%)',
            }}
          />
          <div className="relative flex items-center gap-2">
            <Sparkles size={12} className="text-[var(--accent)] shrink-0" />
            <span className="text-[11px] text-[var(--fg-muted)] leading-tight">
              <span className="text-[var(--fg)] font-medium">AI-brief</span> tillgänglig
              <br />
              för 3 möten idag
            </span>
          </div>
        </div>

        {/* User card */}
        <div className="group w-full flex items-center gap-2.5 p-2 rounded-[10px] border border-transparent hover:border-[var(--border)] hover:bg-[var(--surface)] transition-colors">
          <div className="relative shrink-0">
            <div className="h-8 w-8 rounded-full p-[1.5px] bg-gradient-to-br from-[var(--accent)] via-[var(--gold)] to-[var(--color-violet)]">
              <div className="h-full w-full rounded-full bg-[var(--bg)] flex items-center justify-center text-[11px] font-semibold text-[var(--fg)]">
                {initials}
              </div>
            </div>
          </div>
          <div className="flex-1 min-w-0 text-left">
            <div className="text-[12.5px] font-medium text-[var(--fg)] truncate leading-tight">
              {displayName}
            </div>
            <div className="text-[10.5px] text-[var(--fg-subtle)] truncate leading-tight mt-0.5">
              {email}
            </div>
          </div>
          <NavLink
            to="/installningar"
            className="shrink-0 h-7 w-7 rounded-md flex items-center justify-center text-[var(--fg-subtle)] hover:text-[var(--fg)] hover:bg-[var(--surface-2)] transition-colors"
            aria-label="Inställningar"
          >
            <Settings size={14} />
          </NavLink>
          <button
            type="button"
            onClick={() => signOut()}
            className="shrink-0 h-7 w-7 rounded-md flex items-center justify-center text-[var(--fg-subtle)] hover:text-[var(--color-danger)] hover:bg-[var(--surface-2)] transition-colors"
            aria-label="Logga ut"
          >
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </aside>
  )
}

function NavItemLink({ item }: { item: NavItem }) {
  return (
    <NavLink
      to={item.to}
      end={item.to === '/'}
      className={({ isActive }) =>
        cn(
          'group relative flex items-center gap-2.5 h-9 pl-3 pr-2 rounded-[9px] text-[13px] font-medium transition-all duration-150',
          isActive
            ? 'text-[var(--fg)]'
            : 'text-[var(--fg-muted)] hover:text-[var(--fg)] hover:bg-[var(--surface)]',
        )
      }
    >
      {({ isActive }) => (
        <>
          {/* Active background: subtle gradient */}
          {isActive && (
            <span
              aria-hidden
              className="absolute inset-0 rounded-[9px] pointer-events-none"
              style={{
                background:
                  'linear-gradient(90deg, color-mix(in oklch, var(--accent) 14%, transparent) 0%, color-mix(in oklch, var(--accent) 4%, transparent) 60%, transparent 100%)',
                boxShadow:
                  'inset 0 0 0 1px color-mix(in oklch, var(--accent) 18%, transparent)',
              }}
            />
          )}
          {/* Active left-edge bar */}
          {isActive && (
            <span
              aria-hidden
              className="absolute left-0 top-1.5 bottom-1.5 w-[2px] rounded-r-full"
              style={{
                background: 'var(--accent)',
                boxShadow: '0 0 8px var(--accent)',
              }}
            />
          )}

          <item.icon
            size={15}
            strokeWidth={2}
            className={cn(
              'relative shrink-0 transition-colors',
              isActive
                ? 'text-[var(--accent)]'
                : 'text-[var(--fg-subtle)] group-hover:text-[var(--fg-muted)]',
            )}
          />
          <span className="relative flex-1 truncate">{item.label}</span>

          {/* Badge */}
          {item.badge !== undefined && (
            <span
              className={cn(
                'relative shrink-0 inline-flex items-center justify-center h-[17px] min-w-[17px] px-1 rounded-full text-[10px] font-semibold tabular-nums',
                isActive
                  ? 'bg-[color-mix(in_oklch,var(--accent)_25%,transparent)] text-[var(--accent)]'
                  : 'bg-[var(--surface-2)] text-[var(--fg-muted)] group-hover:bg-[var(--surface-3)]',
              )}
            >
              {item.badge}
            </span>
          )}

          {/* Keyboard shortcut — visible on hover when no badge */}
          {item.shortcut && item.badge === undefined && (
            <kbd
              className={cn(
                'relative shrink-0 inline-flex items-center justify-center h-[17px] min-w-[26px] px-1 rounded-[5px] border text-[10px] font-mono tabular-nums transition-opacity',
                isActive
                  ? 'border-[color-mix(in_oklch,var(--accent)_25%,transparent)] text-[var(--accent)] opacity-70'
                  : 'border-[var(--border)] text-[var(--fg-subtle)] opacity-0 group-hover:opacity-100',
              )}
            >
              ⌘{item.shortcut}
            </kbd>
          )}
        </>
      )}
    </NavLink>
  )
}

function LogoMark() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0"
      aria-hidden
    >
      <defs>
        <linearGradient id="logo-grad-sb" x1="4" y1="4" x2="28" y2="28" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="var(--accent)" />
          <stop offset="1" stopColor="var(--gold)" />
        </linearGradient>
      </defs>
      <path
        d="M8 6H20C24.4183 6 28 9.58172 28 14C28 16.2091 26.2091 18 24 18H12C9.79086 18 8 19.7909 8 22V26C8 27.1046 7.10457 28 6 28H4C2.89543 28 2 27.1046 2 26V12C2 8.68629 4.68629 6 8 6Z"
        fill="url(#logo-grad-sb)"
      />
      <circle cx="22.5" cy="23.5" r="3.5" fill="var(--gold)" />
    </svg>
  )
}
