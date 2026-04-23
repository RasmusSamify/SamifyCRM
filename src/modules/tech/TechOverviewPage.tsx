import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  GitBranch,
  Search,
  AlertTriangle,
  Package,
  Layers,
  ArrowUpRight,
  Sparkles,
  FileWarning,
  Users,
  GitFork,
} from 'lucide-react'
import { PageShell } from '@/components/layout/PageShell'
import { StatCard } from '@/components/ui/StatCard'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/EmptyState'
import { Avatar } from '@/components/ui/Avatar'
import { cn } from '@/lib/cn'
import { formatDate } from '@/lib/format'
import { useClients } from '@/modules/clients/queries'
import {
  isTechProfile,
  type SuggestionSeverity,
  type TechProfile,
} from '@/modules/clients/techQueries'
import type { Client } from '@/types/database'
import { ReposGrid } from './ReposGrid'
import { useTechRepos } from './repoQueries'

interface Enriched {
  client: Client
  profile: TechProfile | null
  repoCount: number
  uniqueStack: string[]
  highSeverity: number
  mediumSeverity: number
  lowSeverity: number
}

function enrich(client: Client): Enriched {
  const profile = isTechProfile(client.tech_profile) ? client.tech_profile : null
  const repos = profile?.repos ?? []
  const uniqueStack = Array.from(
    new Set(repos.flatMap((r) => r.stack ?? []).filter(Boolean)),
  ).sort()
  const suggestions = profile?.suggestions ?? []
  const countBy = (sev: SuggestionSeverity) =>
    suggestions.filter((s) => s.severity === sev).length
  return {
    client,
    profile,
    repoCount: repos.length,
    uniqueStack,
    highSeverity: countBy('high'),
    mediumSeverity: countBy('medium'),
    lowSeverity: countBy('low'),
  }
}

type Tab = 'clients' | 'repos'

export function TechOverviewPage() {
  const { data: clients, isLoading } = useClients()
  const { data: repos } = useTechRepos()
  const [tab, setTab] = useState<Tab>('clients')
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | 'synced' | 'unsynced' | 'high'>('all')

  const enriched = useMemo(() => (clients ?? []).map(enrich), [clients])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return enriched.filter((e) => {
      if (filter === 'synced' && !e.profile) return false
      if (filter === 'unsynced' && e.profile) return false
      if (filter === 'high' && e.highSeverity === 0) return false
      if (!q) return true
      return (
        e.client.name.toLowerCase().includes(q) ||
        (e.client.github_owner ?? '').toLowerCase().includes(q) ||
        e.uniqueStack.some((s) => s.toLowerCase().includes(q))
      )
    })
  }, [enriched, search, filter])

  const stats = useMemo(() => {
    const synced = enriched.filter((e) => !!e.profile).length
    const configured = enriched.filter((e) => !!e.client.github_owner).length
    const totalRepos = repos?.length ?? 0
    const unassigned = (repos ?? []).filter((r) => r.client_id === null).length
    const totalSuggestions = enriched.reduce(
      (sum, e) => sum + (e.profile?.suggestions?.length ?? 0),
      0,
    )
    const totalHigh = enriched.reduce((sum, e) => sum + e.highSeverity, 0)
    return { synced, configured, totalRepos, totalSuggestions, totalHigh, unassigned }
  }, [enriched, repos])

  return (
    <PageShell
      title="Teknik"
      subtitle="Teknisk översikt av era kunder — stack, beroenden och förbättringsförslag från AI"
    >
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <StatCard
          label="Synkade kunder"
          value={String(stats.synced)}
          icon={GitBranch}
          accent="brand"
          hint={`${stats.configured} konfigurerade totalt`}
        />
        <StatCard
          label="Repos analyserade"
          value={String(stats.totalRepos)}
          icon={Package}
          accent="violet"
        />
        <StatCard
          label="Förbättringsförslag"
          value={String(stats.totalSuggestions)}
          icon={Sparkles}
          accent="success"
          hint="från AI-analys"
        />
        <StatCard
          label="Hög prioritet"
          value={String(stats.totalHigh)}
          icon={AlertTriangle}
          accent={stats.totalHigh > 0 ? 'danger' : 'neutral'}
          hint={stats.unassigned > 0 ? `${stats.unassigned} repos otilldelade` : 'alla repos tilldelade'}
        />
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-[var(--border)] mb-5">
        <TabButton active={tab === 'clients'} onClick={() => setTab('clients')} icon={Users}>
          Kunder
          <span className="ml-1.5 text-num text-[11px] text-[var(--fg-subtle)]">
            {enriched.length}
          </span>
        </TabButton>
        <TabButton active={tab === 'repos'} onClick={() => setTab('repos')} icon={GitFork}>
          Repos
          <span className="ml-1.5 text-num text-[11px] text-[var(--fg-subtle)]">
            {stats.totalRepos}
          </span>
          {stats.unassigned > 0 && (
            <span className="ml-1.5 inline-flex items-center h-4 px-1.5 rounded-[4px] bg-[color-mix(in_oklch,var(--color-warning)_12%,transparent)] text-[10px] font-semibold text-[var(--color-warning)] uppercase tracking-[0.08em]">
              {stats.unassigned} nya
            </span>
          )}
        </TabButton>
      </div>

      {tab === 'repos' && <ReposGrid />}

      {tab === 'clients' && (
        <>
      {/* Filters */}
      <div className="flex items-center gap-2 mb-5 flex-wrap">
        <div className="relative flex-1 min-w-[260px] max-w-md">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--fg-subtle)] pointer-events-none"
          />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Sök kund, github-org eller stack…"
            className="pl-9"
          />
        </div>
        <div className="flex items-center gap-1">
          <FilterPill active={filter === 'all'} onClick={() => setFilter('all')}>
            Alla ({enriched.length})
          </FilterPill>
          <FilterPill active={filter === 'synced'} onClick={() => setFilter('synced')}>
            Synkade ({stats.synced})
          </FilterPill>
          <FilterPill active={filter === 'unsynced'} onClick={() => setFilter('unsynced')}>
            Ej synkade ({enriched.length - stats.synced})
          </FilterPill>
          {stats.totalHigh > 0 && (
            <FilterPill
              active={filter === 'high'}
              onClick={() => setFilter('high')}
              danger
            >
              Hög prio ({stats.totalHigh})
            </FilterPill>
          )}
        </div>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="h-[220px] rounded-[14px] bg-[var(--surface)] border border-[var(--border)] animate-pulse-soft"
            />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        clients?.length ? (
          <div className="rounded-[14px] border border-[var(--border)] bg-[var(--surface)]">
            <EmptyState
              icon={GitBranch}
              title="Inga träffar"
              description="Prova att rensa filter eller söka på något annat."
            />
          </div>
        ) : (
          <div className="rounded-[14px] border border-[var(--border)] bg-[var(--surface)]">
            <EmptyState
              icon={GitBranch}
              title="Inga kunder än"
              description="Lägg till kunder i Kunder-modulen, koppla deras GitHub, och synka teknikstacken härifrån."
            />
          </div>
        )
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((e) => (
            <TechCard key={e.client.id} enriched={e} />
          ))}
        </div>
      )}
        </>
      )}
    </PageShell>
  )
}

function TabButton({
  active,
  onClick,
  icon: Icon,
  children,
}: {
  active: boolean
  onClick: () => void
  icon: React.ComponentType<{ size?: number; className?: string }>
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'relative h-10 px-4 flex items-center gap-2 text-[13px] font-medium transition-colors',
        active
          ? 'text-[var(--fg)]'
          : 'text-[var(--fg-muted)] hover:text-[var(--fg)]',
      )}
    >
      <Icon size={13} />
      {children}
      {active && (
        <span
          className="absolute left-3 right-3 bottom-0 h-[2px] rounded-full"
          style={{ background: 'var(--accent)' }}
        />
      )}
    </button>
  )
}

function FilterPill({
  active,
  onClick,
  danger,
  children,
}: {
  active: boolean
  onClick: () => void
  danger?: boolean
  children: React.ReactNode
}) {
  const color = danger ? 'var(--color-danger)' : 'var(--accent)'
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'h-8 px-3 rounded-[8px] text-[12.5px] font-medium transition-colors border',
        active
          ? 'text-[var(--fg)]'
          : 'text-[var(--fg-muted)] hover:text-[var(--fg)] border-transparent',
      )}
      style={
        active
          ? { borderColor: color, background: `color-mix(in oklch, ${color} 10%, transparent)` }
          : undefined
      }
    >
      {children}
    </button>
  )
}

function TechCard({ enriched }: { enriched: Enriched }) {
  const { client, profile, repoCount, uniqueStack, highSeverity, mediumSeverity } = enriched
  const hasConfig = !!client.github_owner
  const hasProfile = !!profile

  return (
    <Link
      to={`/teknik/${client.id}`}
      className="group surface-glow block rounded-[14px] border border-[var(--border)] bg-[var(--surface)] p-5 hover:border-[var(--border-strong)] transition-all"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <Avatar name={client.name} size="md" />
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-[14.5px] font-semibold text-[var(--fg)] truncate">
                {client.name}
              </h3>
              <ArrowUpRight
                size={13}
                className="text-[var(--fg-subtle)] group-hover:text-[var(--accent)] transition-colors shrink-0"
              />
            </div>
            {client.github_owner && (
              <div className="text-[11.5px] text-[var(--fg-subtle)] font-mono truncate mt-0.5">
                @{client.github_owner}
              </div>
            )}
          </div>
        </div>
        <StatusBadge hasConfig={hasConfig} hasProfile={hasProfile} />
      </div>

      {/* Content */}
      {hasProfile ? (
        <>
          <div className="mt-4 flex items-center gap-4 text-[12.5px] text-[var(--fg-muted)]">
            <span className="flex items-center gap-1.5">
              <Package size={11} />
              {repoCount} repos
            </span>
            {uniqueStack.length > 0 && (
              <span className="flex items-center gap-1.5">
                <Layers size={11} />
                {uniqueStack.length} tekniker
              </span>
            )}
            <span className="flex items-center gap-1.5 ml-auto">
              {formatDate(client.tech_synced_at)}
            </span>
          </div>

          {uniqueStack.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {uniqueStack.slice(0, 6).map((s) => (
                <span
                  key={s}
                  className="inline-flex items-center h-5.5 px-2 rounded-[5px] bg-[color-mix(in_oklch,var(--accent)_9%,transparent)] border border-[color-mix(in_oklch,var(--accent)_22%,transparent)] text-[11px] font-medium text-[var(--accent)]"
                >
                  {s}
                </span>
              ))}
              {uniqueStack.length > 6 && (
                <span className="text-[11px] text-[var(--fg-subtle)] self-center ml-1">
                  +{uniqueStack.length - 6} till
                </span>
              )}
            </div>
          )}

          {(highSeverity > 0 || mediumSeverity > 0) && (
            <div className="mt-4 pt-3 border-t border-[var(--border)] flex items-center gap-2.5">
              {highSeverity > 0 && (
                <Badge variant="danger">
                  <AlertTriangle size={10} strokeWidth={2.5} />
                  {highSeverity} hög
                </Badge>
              )}
              {mediumSeverity > 0 && (
                <Badge variant="warning">
                  {mediumSeverity} medel
                </Badge>
              )}
            </div>
          )}
        </>
      ) : hasConfig ? (
        <div className="mt-5 flex items-center gap-2.5 text-[13px] text-[var(--fg-muted)]">
          <FileWarning size={13} className="text-[var(--fg-subtle)]" />
          <span>Konfigurerad men ej synkad. Klicka för att köra första analysen.</span>
        </div>
      ) : (
        <div className="mt-5 flex items-center gap-2.5 text-[13px] text-[var(--fg-subtle)]">
          <GitBranch size={13} />
          <span>Koppla GitHub-org för att komma igång.</span>
        </div>
      )}
    </Link>
  )
}

function StatusBadge({ hasConfig, hasProfile }: { hasConfig: boolean; hasProfile: boolean }) {
  if (hasProfile) {
    return (
      <span className="inline-flex items-center gap-1.5 text-[10.5px] font-semibold text-[var(--color-success)] uppercase tracking-[0.12em] shrink-0 mt-1">
        <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-success)]" />
        Synkad
      </span>
    )
  }
  if (hasConfig) {
    return (
      <span className="inline-flex items-center gap-1.5 text-[10.5px] font-semibold text-[var(--color-warning)] uppercase tracking-[0.12em] shrink-0 mt-1">
        <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-warning)]" />
        Väntar
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1.5 text-[10.5px] font-semibold text-[var(--fg-subtle)] uppercase tracking-[0.12em] shrink-0 mt-1">
      <span className="h-1.5 w-1.5 rounded-full bg-[var(--fg-subtle)]" />
      Ej konfigurerad
    </span>
  )
}
