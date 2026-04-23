import { useMemo, useState } from 'react'
import {
  Search,
  ExternalLink,
  Code2,
  TestTube,
  Cpu,
  AlertTriangle,
  UserPlus,
  Check,
  X,
  UserX,
  Sparkles,
} from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { Dialog } from '@/components/ui/Dialog'
import { cn } from '@/lib/cn'
import { formatDate } from '@/lib/format'
import { toast } from '@/stores/toast'
import { useClients } from '@/modules/clients/queries'
import type { Client, TechRepoRow } from '@/types/database'
import {
  parseStringArray,
  parseSuggestions,
  useAssignRepoToClient,
  useTechRepos,
} from './repoQueries'

export function ReposGrid() {
  const { data: repos, isLoading } = useTechRepos()
  const { data: clients } = useClients()
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | 'unassigned' | 'assigned'>('all')
  const [assigning, setAssigning] = useState<TechRepoRow | null>(null)

  const clientById = useMemo(() => {
    const map = new Map<string, Client>()
    for (const c of clients ?? []) map.set(c.id, c)
    return map
  }, [clients])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return (repos ?? []).filter((r) => {
      if (filter === 'unassigned' && r.client_id !== null) return false
      if (filter === 'assigned' && r.client_id === null) return false
      if (!q) return true
      const stack = parseStringArray(r.stack).join(' ').toLowerCase()
      const deps = parseStringArray(r.key_dependencies).join(' ').toLowerCase()
      return (
        r.repo_name.toLowerCase().includes(q) ||
        r.github_owner.toLowerCase().includes(q) ||
        (r.primary_language ?? '').toLowerCase().includes(q) ||
        stack.includes(q) ||
        deps.includes(q)
      )
    })
  }, [repos, search, filter])

  const counts = {
    total: repos?.length ?? 0,
    assigned: repos?.filter((r) => r.client_id !== null).length ?? 0,
    unassigned: repos?.filter((r) => r.client_id === null).length ?? 0,
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-5 flex-wrap">
        <div className="relative flex-1 min-w-[260px] max-w-md">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--fg-subtle)] pointer-events-none"
          />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Sök repo, owner, stack…"
            className="pl-9"
          />
        </div>
        <div className="flex items-center gap-1">
          <FilterPill active={filter === 'all'} onClick={() => setFilter('all')}>
            Alla ({counts.total})
          </FilterPill>
          <FilterPill active={filter === 'assigned'} onClick={() => setFilter('assigned')}>
            Tilldelade ({counts.assigned})
          </FilterPill>
          <FilterPill
            active={filter === 'unassigned'}
            onClick={() => setFilter('unassigned')}
            warn
          >
            Otilldelade ({counts.unassigned})
          </FilterPill>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-[96px] rounded-[12px] bg-[var(--surface)] border border-[var(--border)] animate-pulse-soft"
            />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-[14px] border border-[var(--border)] bg-[var(--surface)]">
          <EmptyState
            icon={Search}
            title={repos?.length ? 'Inga träffar' : 'Inga repos synkade än'}
            description={
              repos?.length
                ? 'Prova att rensa filtren eller söka på något annat.'
                : 'Synka en kund från dess profil för att hämta repos hit.'
            }
          />
        </div>
      ) : (
        <div className="rounded-[14px] border border-[var(--border)] bg-[var(--surface)] divide-y divide-[var(--border)] overflow-hidden">
          {filtered.map((repo) => (
            <RepoRow
              key={repo.id}
              repo={repo}
              client={repo.client_id ? clientById.get(repo.client_id) : undefined}
              onAssign={() => setAssigning(repo)}
            />
          ))}
        </div>
      )}

      <AssignDialog
        repo={assigning}
        clients={clients ?? []}
        onClose={() => setAssigning(null)}
      />
    </div>
  )
}

function FilterPill({
  active,
  onClick,
  warn,
  children,
}: {
  active: boolean
  onClick: () => void
  warn?: boolean
  children: React.ReactNode
}) {
  const color = warn ? 'var(--color-warning)' : 'var(--accent)'
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

function RepoRow({
  repo,
  client,
  onAssign,
}: {
  repo: TechRepoRow
  client: Client | undefined
  onAssign: () => void
}) {
  const stack = parseStringArray(repo.stack)
  const suggestions = parseSuggestions(repo.suggestions)
  const highSev = suggestions.filter((s) => s.severity === 'high').length

  return (
    <div className="px-5 py-4 flex items-center gap-4 hover:bg-[var(--surface-2)]/40 transition-colors">
      {/* Name + owner + stack */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <a
            href={`https://github.com/${repo.github_owner}/${repo.repo_name}`}
            target="_blank"
            rel="noreferrer noopener"
            className="text-[14px] font-semibold text-[var(--fg)] hover:text-[var(--accent)] transition-colors inline-flex items-center gap-1"
          >
            {repo.repo_name}
            <ExternalLink size={11} className="opacity-60" />
          </a>
          <span className="text-[11.5px] font-mono text-[var(--fg-subtle)]">
            @{repo.github_owner}
          </span>
          {repo.primary_language && (
            <Badge variant="default" className="normal-case tracking-normal">
              {repo.primary_language}
            </Badge>
          )}
          {repo.architecture && (
            <span className="text-[11.5px] text-[var(--fg-subtle)]">· {repo.architecture}</span>
          )}
        </div>
        {repo.summary && (
          <p className="mt-1 text-[12.5px] text-[var(--fg-muted)] truncate">{repo.summary}</p>
        )}
        {stack.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {stack.slice(0, 5).map((s) => (
              <span
                key={s}
                className="inline-flex items-center h-5 px-1.5 rounded-[5px] bg-[color-mix(in_oklch,var(--accent)_8%,transparent)] border border-[color-mix(in_oklch,var(--accent)_20%,transparent)] text-[10.5px] font-medium text-[var(--accent)]"
              >
                {s}
              </span>
            ))}
            {stack.length > 5 && (
              <span className="text-[10.5px] text-[var(--fg-subtle)] self-center ml-0.5">
                +{stack.length - 5}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Meta indicators */}
      <div className="hidden sm:flex items-center gap-3 shrink-0 text-[var(--fg-subtle)]">
        {repo.has_typescript && <Code2 size={12} className="text-[var(--color-success)]" />}
        {repo.has_tests && <TestTube size={12} className="text-[var(--color-success)]" />}
        {repo.has_cicd && <Cpu size={12} className="text-[var(--color-success)]" />}
        {highSev > 0 && (
          <span className="inline-flex items-center gap-1 text-[11px] text-[var(--color-danger)]">
            <AlertTriangle size={11} />
            {highSev}
          </span>
        )}
      </div>

      {/* Client assignment */}
      <div className="shrink-0 min-w-[160px] text-right">
        {client ? (
          <button
            type="button"
            onClick={onAssign}
            className="group inline-flex items-center gap-2 h-8 px-3 rounded-[8px] text-[12.5px] font-medium bg-[var(--surface-2)]/60 border border-[var(--border)] hover:border-[color-mix(in_oklch,var(--accent)_40%,transparent)] transition-colors"
          >
            <span className="truncate max-w-[140px] text-[var(--fg)]">{client.name}</span>
            <span className="text-[10.5px] text-[var(--fg-subtle)] group-hover:text-[var(--fg)]">
              byt
            </span>
          </button>
        ) : (
          <Button size="sm" variant="secondary" onClick={onAssign}>
            <UserPlus size={13} />
            Tilldela
          </Button>
        )}
        <div className="text-[10.5px] text-[var(--fg-subtle)] mt-1">
          {formatDate(repo.last_synced_at)}
        </div>
      </div>
    </div>
  )
}

/* ============================================================
   AUTO-MATCH: score clients by name-similarity to repo
   ============================================================ */

const STOP_WORDS = new Set([
  'systems', 'system', 'ab', 'the', 'app', 'web', 'api', 'crm', 'site',
  'intranet', 'hub', 'portal', 'platform', 'io', 'co', 'com', 'se',
])

function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s\-_.]/g, '')
}

function tokenize(s: string): string[] {
  return normalize(s)
    .split(/[\s\-_.]+/)
    .filter((t) => t.length >= 3 && !STOP_WORDS.has(t))
}

function matchScore(repoName: string, client: Client): number {
  const repoTokens = tokenize(repoName)
  const clientTokens = [
    ...tokenize(client.name),
    ...tokenize(client.github_owner ?? ''),
  ]
  if (repoTokens.length === 0 || clientTokens.length === 0) return 0
  let score = 0
  for (const ct of clientTokens) {
    for (const rt of repoTokens) {
      if (ct === rt) score += 10
      else if (ct.length >= 4 && rt.includes(ct)) score += 6
      else if (rt.length >= 4 && ct.includes(rt)) score += 5
    }
  }
  return score
}

function suggestClient(repoName: string, clients: Client[]): { client: Client; score: number } | null {
  let best: { client: Client; score: number } | null = null
  for (const c of clients) {
    const score = matchScore(repoName, c)
    if (score > 0 && (!best || score > best.score)) best = { client: c, score }
  }
  return best && best.score >= 5 ? best : null
}

function AssignDialog({
  repo,
  clients,
  onClose,
}: {
  repo: TechRepoRow | null
  clients: Client[]
  onClose: () => void
}) {
  const assign = useAssignRepoToClient()
  const [query, setQuery] = useState('')

  const suggested = useMemo(() => {
    if (!repo) return null
    /* Don't suggest the currently-assigned client */
    const pool = clients.filter((c) => c.id !== repo.client_id)
    return suggestClient(repo.repo_name, pool)
  }, [repo, clients])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    const base = q
      ? clients.filter(
          (c) =>
            c.name.toLowerCase().includes(q) || (c.github_owner ?? '').toLowerCase().includes(q),
        )
      : clients
    /* If we have a suggestion and the query isn't narrowing, show suggestion first */
    if (!q && suggested) {
      const rest = base.filter((c) => c.id !== suggested.client.id)
      return [suggested.client, ...rest]
    }
    return base
  }, [clients, query, suggested])

  const handlePick = async (clientId: string | null) => {
    if (!repo) return
    try {
      await assign.mutateAsync({ repoId: repo.id, clientId })
      toast.success(
        clientId === null ? 'Repo frånkopplat' : 'Repo tilldelat',
        clientId === null
          ? 'Repon är nu otilldelad.'
          : `${repo.repo_name} → ${clients.find((c) => c.id === clientId)?.name ?? 'kunden'}`,
      )
      onClose()
    } catch (err) {
      toast.error(
        'Kunde inte tilldela',
        err instanceof Error ? err.message : undefined,
      )
    }
  }

  return (
    <Dialog
      open={!!repo}
      onClose={onClose}
      title="Tilldela repo till kund"
      description={repo ? `${repo.repo_name} @${repo.github_owner}` : undefined}
      size="md"
    >
      <div className="space-y-3">
        {suggested && (
          <button
            type="button"
            onClick={() => handlePick(suggested.client.id)}
            disabled={assign.isPending}
            className="w-full flex items-center gap-3 p-3 rounded-[10px] border text-left transition-all"
            style={{
              borderColor: 'color-mix(in oklch, var(--accent) 35%, transparent)',
              background: 'color-mix(in oklch, var(--accent) 8%, transparent)',
            }}
          >
            <div className="h-8 w-8 rounded-lg flex items-center justify-center bg-[color-mix(in_oklch,var(--accent)_15%,transparent)] border border-[color-mix(in_oklch,var(--accent)_30%,transparent)] text-[var(--accent)] shrink-0">
              <Sparkles size={14} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10.5px] font-semibold text-[var(--accent)] uppercase tracking-[0.16em]">
                  AI-förslag
                </span>
                <span className="text-[13px] font-semibold text-[var(--fg)] truncate">
                  {suggested.client.name}
                </span>
              </div>
              <div className="text-[11.5px] text-[var(--fg-muted)] mt-0.5">
                Baserat på matchning mellan repo-namnet och kundnamnet · klicka för att tilldela
              </div>
            </div>
            <Check size={14} className="text-[var(--accent)] shrink-0" />
          </button>
        )}

        <div className="relative">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--fg-subtle)] pointer-events-none"
          />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Sök kund…"
            className="pl-9"
            autoFocus
          />
        </div>

        <div className="rounded-[10px] border border-[var(--border)] bg-[var(--surface-2)]/40 max-h-[340px] overflow-y-auto divide-y divide-[var(--border)]">
          {repo?.client_id && (
            <button
              type="button"
              onClick={() => handlePick(null)}
              disabled={assign.isPending}
              className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-[var(--surface-2)] transition-colors"
            >
              <div className="h-7 w-7 rounded-full flex items-center justify-center bg-[color-mix(in_oklch,var(--color-warning)_10%,transparent)] border border-[color-mix(in_oklch,var(--color-warning)_25%,transparent)] text-[var(--color-warning)] shrink-0">
                <UserX size={12} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-medium text-[var(--fg)]">Koppla loss</div>
                <div className="text-[11.5px] text-[var(--fg-subtle)] mt-0.5">
                  Ta bort tilldelning — repon blir otilldelad
                </div>
              </div>
            </button>
          )}
          {filtered.length === 0 ? (
            <div className="px-4 py-6 text-center text-[13px] text-[var(--fg-subtle)]">
              Inga kunder matchade.
            </div>
          ) : (
            filtered.map((c) => {
              const isCurrent = repo?.client_id === c.id
              const isSuggested = suggested?.client.id === c.id
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => handlePick(c.id)}
                  disabled={assign.isPending}
                  className={cn(
                    'w-full flex items-center gap-3 px-4 py-3 text-left transition-colors',
                    isCurrent
                      ? 'bg-[color-mix(in_oklch,var(--accent)_6%,transparent)]'
                      : 'hover:bg-[var(--surface-2)]',
                  )}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[13px] font-medium text-[var(--fg)] truncate">
                        {c.name}
                      </span>
                      {isCurrent && (
                        <span className="inline-flex items-center gap-1 text-[10.5px] text-[var(--accent)] font-semibold uppercase tracking-wider">
                          <Check size={11} />
                          Nuvarande
                        </span>
                      )}
                      {isSuggested && !isCurrent && (
                        <span className="inline-flex items-center gap-1 text-[10.5px] font-semibold uppercase tracking-wider text-[var(--accent)]">
                          <Sparkles size={10} />
                          Föreslaget
                        </span>
                      )}
                    </div>
                    {c.github_owner && (
                      <div className="text-[11px] text-[var(--fg-subtle)] font-mono mt-0.5 truncate">
                        @{c.github_owner}
                      </div>
                    )}
                  </div>
                </button>
              )
            })
          )}
        </div>
      </div>

      <div className="mt-4 flex justify-end">
        <Button variant="ghost" onClick={onClose}>
          <X size={13} />
          Stäng
        </Button>
      </div>
    </Dialog>
  )
}
