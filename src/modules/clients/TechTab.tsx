import { useMemo, useState } from 'react'
import {
  GitBranch,
  Loader2,
  RefreshCw,
  Sparkles,
  Code2,
  TestTube,
  Cpu,
  AlertTriangle,
  ExternalLink,
  Settings2,
  Shield,
  Zap,
  Wrench,
  Package,
  Layers,
  Eye,
  Copy,
  Check,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input, Field } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/EmptyState'
import { cn } from '@/lib/cn'
import { formatDate } from '@/lib/format'
import { toast } from '@/stores/toast'
import type { Client } from '@/types/database'
import {
  isTechProfile,
  useSyncClientTech,
  type TechProfile,
  type TechRepo,
  type TechSuggestion,
  type SuggestionCategory,
  type SuggestionSeverity,
} from './techQueries'

interface TechTabProps {
  client: Client
}

export function TechTab({ client }: TechTabProps) {
  const [owner, setOwner] = useState(client.github_owner ?? '')
  const [pat, setPat] = useState('')
  const [showSettings, setShowSettings] = useState(!client.github_owner)

  const sync = useSyncClientTech()
  const profile = isTechProfile(client.tech_profile) ? client.tech_profile : null
  const hasConfig = !!client.github_owner
  const hasPat = !!client.github_pat

  const aggregated = useMemo(() => (profile ? aggregate(profile) : null), [profile])

  const handleSync = async () => {
    const resolvedOwner = owner.trim() || client.github_owner
    if (!resolvedOwner) {
      toast.error('Ange GitHub-användare eller organisation')
      setShowSettings(true)
      return
    }
    try {
      const result = await sync.mutateAsync({
        clientId: client.id,
        githubOwner: resolvedOwner,
        githubPat: pat.trim() || undefined,
        savePat: pat.trim() ? true : undefined,
      })
      toast.success(
        'Tech-profil synkad',
        `${result.reposAnalyzed ?? 0} repos analyserade, ${
          result.techProfile?.suggestions?.length ?? 0
        } förbättringsförslag genererade.`,
      )
      setShowSettings(false)
      setPat('')
    } catch (err) {
      toast.error('Synk misslyckades', err instanceof Error ? err.message : undefined)
    }
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="h-9 w-9 rounded-lg flex items-center justify-center bg-[var(--surface-2)] border border-[var(--border)] shrink-0">
            <GitBranch size={15} className="text-[var(--fg-muted)]" />
          </div>
          <div className="min-w-0">
            <div className="text-[13.5px] font-semibold text-[var(--fg)]">
              {client.github_owner ? (
                <a
                  href={`https://github.com/${client.github_owner}`}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="hover:text-[var(--accent)] transition-colors inline-flex items-center gap-1"
                >
                  {client.github_owner}
                  <ExternalLink size={11} />
                </a>
              ) : (
                <span className="text-[var(--fg-muted)]">Ingen GitHub-koppling</span>
              )}
            </div>
            <div className="text-[11.5px] text-[var(--fg-subtle)] mt-0.5">
              {client.tech_synced_at ? `Senast synkad ${formatDate(client.tech_synced_at)}` : 'Inte synkad än'}
              {hasPat && <span className="ml-2 text-[var(--color-success)]">· Token sparad</span>}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <Button size="sm" variant="ghost" onClick={() => setShowSettings((s) => !s)} aria-label="Inställningar">
            <Settings2 size={13} />
          </Button>
          <Button size="sm" variant={profile ? 'secondary' : 'primary'} onClick={handleSync} disabled={sync.isPending}>
            {sync.isPending ? (
              <>
                <Loader2 size={13} className="animate-spin" />
                Analyserar…
              </>
            ) : (
              <>
                <RefreshCw size={13} />
                {profile ? 'Synka igen' : 'Synka nu'}
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Settings panel */}
      {showSettings && (
        <div className="surface-glow rounded-[12px] border border-[var(--border)] bg-[var(--surface-2)]/40 p-5 animate-slide-up">
          <div className="text-[11.5px] font-semibold text-[var(--fg-muted)] uppercase tracking-[0.12em] mb-3">
            GitHub-konfiguration
          </div>
          <div className="space-y-3">
            <Field label="GitHub-användare eller organisation">
              <Input
                value={owner}
                onChange={(e) => setOwner(e.target.value)}
                placeholder="t.ex. RasmusSamify eller vercel"
              />
            </Field>
            <Field
              label="Personal Access Token (valfritt, för privata repos)"
              hint="Skapa på github.com/settings/tokens med scope 'repo' (read-only räcker)."
            >
              <Input
                type="password"
                value={pat}
                onChange={(e) => setPat(e.target.value)}
                placeholder={hasPat ? '••••••••  (token redan sparad)' : 'ghp_...'}
              />
            </Field>
          </div>
          <p className="mt-3 text-[12px] text-[var(--fg-subtle)] leading-[1.5]">
            AI:n läser upp till 10 mest aktiva repos, aggregerar unik teknikstack och genererar
            förbättringsförslag. Tar ca 30–60 sekunder.
          </p>
        </div>
      )}

      {/* Narrative */}
      {profile && (
        <div className="relative overflow-hidden rounded-[14px] border border-[var(--border)] bg-[var(--surface)] p-5">
          <div
            className="absolute inset-0 opacity-[0.06] pointer-events-none"
            style={{ background: 'radial-gradient(circle at 100% 0%, var(--accent), transparent 60%)' }}
          />
          <div className="relative">
            <div className="flex items-center gap-2 mb-2.5">
              <Sparkles size={13} className="text-[var(--accent)]" />
              <span className="text-[11px] font-semibold text-[var(--accent)] uppercase tracking-[0.16em]">
                AI-sammanfattning
              </span>
            </div>
            <p className="text-[14px] text-[var(--fg)] leading-[1.6]">{profile.narrative}</p>
          </div>
        </div>
      )}

      {/* Aggregated stack */}
      {aggregated && (
        <div className="rounded-[14px] border border-[var(--border)] bg-[var(--surface)] p-5 space-y-4">
          <div className="flex items-center gap-2">
            <Layers size={13} className="text-[var(--fg-muted)]" />
            <span className="text-[11px] font-semibold text-[var(--fg-muted)] uppercase tracking-[0.14em]">
              Teknikstack · {aggregated.repoCount} repos
            </span>
          </div>

          <StackRow label="Språk" items={aggregated.languages} tone="accent" />
          <StackRow label="Frameworks & verktyg" items={aggregated.stack} tone="accent" />
          <StackRow label="Hosting" items={aggregated.hosts} tone="violet" />
          <StackRow label="Arkitektur" items={aggregated.architectures} tone="violet" />
          <StackRow label="Nyckelberoenden" items={aggregated.dependencies} tone="neutral" mono />

          {/* Overall health indicators */}
          <div className="pt-3 border-t border-[var(--border)] flex items-center gap-5 flex-wrap text-[12.5px]">
            <HealthChip label="TypeScript" ratio={aggregated.tsRatio} />
            <HealthChip label="Tester" ratio={aggregated.testsRatio} />
            <HealthChip label="CI/CD" ratio={aggregated.cicdRatio} />
          </div>
        </div>
      )}

      {/* Suggestions */}
      {profile?.suggestions && profile.suggestions.length > 0 && (
        <SuggestionsSection suggestions={profile.suggestions} />
      )}

      {/* Compact repo list */}
      {profile && profile.repos.length > 0 && (
        <div className="rounded-[14px] border border-[var(--border)] bg-[var(--surface)] overflow-hidden">
          <div className="px-4 py-3 border-b border-[var(--border)] flex items-center gap-2">
            <Eye size={13} className="text-[var(--fg-muted)]" />
            <span className="text-[11px] font-semibold text-[var(--fg-muted)] uppercase tracking-[0.14em]">
              Repos · {profile.repos.length}
            </span>
          </div>
          <div className="divide-y divide-[var(--border)]">
            {profile.repos.map((repo) => (
              <CompactRepoRow key={repo.name} repo={repo} owner={client.github_owner ?? ''} />
            ))}
          </div>
        </div>
      )}

      {/* Empty states */}
      {!profile && !sync.isPending && hasConfig && (
        <EmptyState
          icon={GitBranch}
          title="Redo att synka"
          description="Klicka på ”Synka nu” så hämtar AI:n repos från GitHub och bygger tech-profilen."
        />
      )}
      {!profile && !hasConfig && !showSettings && (
        <EmptyState
          icon={GitBranch}
          title="Ingen GitHub-koppling"
          description="Öppna inställningarna och ange kundens GitHub-användare eller organisation."
          action={
            <Button size="sm" onClick={() => setShowSettings(true)}>
              <Settings2 size={13} />
              Konfigurera
            </Button>
          }
        />
      )}
    </div>
  )
}

/* ============================================================
   AGGREGATION
   ============================================================ */

interface Aggregated {
  repoCount: number
  languages: string[]
  stack: string[]
  hosts: string[]
  architectures: string[]
  dependencies: string[]
  tsRatio: number
  testsRatio: number
  cicdRatio: number
}

function aggregate(profile: TechProfile): Aggregated {
  const repos = profile.repos ?? []
  const count = repos.length || 1
  const unique = (arr: Array<string | null | undefined>) =>
    Array.from(new Set(arr.filter((v): v is string => typeof v === 'string' && v.trim().length > 0))).sort()

  return {
    repoCount: repos.length,
    languages: unique(repos.map((r) => r.primaryLanguage)),
    stack: unique(repos.flatMap((r) => r.stack ?? [])),
    hosts: unique(repos.map((r) => r.host)),
    architectures: unique(repos.map((r) => r.architecture)),
    dependencies: unique(repos.flatMap((r) => r.keyDependencies ?? [])).slice(0, 20),
    tsRatio: repos.filter((r) => r.hasTypescript).length / count,
    testsRatio: repos.filter((r) => r.hasTests).length / count,
    cicdRatio: repos.filter((r) => r.hasCicd).length / count,
  }
}

/* ============================================================
   SUB-COMPONENTS
   ============================================================ */

function StackRow({
  label,
  items,
  tone,
  mono,
}: {
  label: string
  items: string[]
  tone: 'accent' | 'violet' | 'neutral'
  mono?: boolean
}) {
  if (items.length === 0) return null
  const toneClass = {
    accent:
      'bg-[color-mix(in_oklch,var(--accent)_9%,transparent)] border-[color-mix(in_oklch,var(--accent)_22%,transparent)] text-[var(--accent)]',
    violet:
      'bg-[color-mix(in_oklch,var(--color-violet)_9%,transparent)] border-[color-mix(in_oklch,var(--color-violet)_22%,transparent)] text-[var(--color-violet)]',
    neutral: 'bg-[var(--surface-2)] border-[var(--border)] text-[var(--fg-muted)]',
  }[tone]
  return (
    <div>
      <div className="text-[10.5px] font-semibold text-[var(--fg-subtle)] uppercase tracking-[0.14em] mb-1.5">
        {label}
      </div>
      <div className="flex flex-wrap gap-1.5">
        {items.map((item) => (
          <span
            key={item}
            className={cn(
              'inline-flex items-center h-6 px-2 rounded-[6px] border text-[11.5px] font-medium',
              toneClass,
              mono && 'font-mono text-[11px]',
            )}
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  )
}

function HealthChip({ label, ratio }: { label: string; ratio: number }) {
  const pct = Math.round(ratio * 100)
  const color = pct >= 80 ? 'var(--color-success)' : pct >= 40 ? 'var(--color-warning)' : 'var(--color-danger)'
  return (
    <div className="flex items-center gap-2">
      <span className="text-[var(--fg-muted)]">{label}</span>
      <div className="flex items-center gap-1.5">
        <div className="w-12 h-1 rounded-full bg-[var(--surface-3)] overflow-hidden">
          <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
        </div>
        <span className="text-num text-[11px]" style={{ color }}>
          {pct}%
        </span>
      </div>
    </div>
  )
}

function CompactRepoRow({ repo, owner }: { repo: TechRepo; owner: string }) {
  return (
    <div className="px-4 py-3 flex items-center gap-3 hover:bg-[var(--surface-2)]/40 transition-colors">
      <a
        href={owner ? `https://github.com/${owner}/${repo.name}` : '#'}
        target="_blank"
        rel="noreferrer noopener"
        className="text-[13.5px] font-medium text-[var(--fg)] hover:text-[var(--accent)] transition-colors shrink-0 min-w-[140px] truncate"
      >
        {repo.name}
      </a>
      {repo.primaryLanguage && (
        <Badge variant="default" className="normal-case tracking-normal shrink-0">
          {repo.primaryLanguage}
        </Badge>
      )}
      <p className="flex-1 min-w-0 text-[12.5px] text-[var(--fg-muted)] truncate">
        {repo.summary || repo.description || '—'}
      </p>
      <div className="flex items-center gap-3 shrink-0 text-[var(--fg-subtle)]">
        {repo.hasTypescript && <Code2 size={11} className="text-[var(--color-success)]" />}
        {repo.hasTests && <TestTube size={11} className="text-[var(--color-success)]" />}
        {repo.hasCicd && <Cpu size={11} className="text-[var(--color-success)]" />}
      </div>
    </div>
  )
}

/* ============================================================
   SUGGESTIONS
   ============================================================ */

const categoryMeta: Record<
  SuggestionCategory,
  { icon: React.ComponentType<{ size?: number; className?: string }>; label: string }
> = {
  security: { icon: Shield, label: 'Säkerhet' },
  performance: { icon: Zap, label: 'Prestanda' },
  quality: { icon: TestTube, label: 'Kvalitet' },
  architecture: { icon: Layers, label: 'Arkitektur' },
  dependencies: { icon: Package, label: 'Beroenden' },
  dx: { icon: Wrench, label: 'DX' },
  accessibility: { icon: Eye, label: 'Tillgänglighet' },
}

const severityMeta: Record<SuggestionSeverity, { label: string; color: string; bg: string }> = {
  high: {
    label: 'Hög',
    color: 'var(--color-danger)',
    bg: 'color-mix(in oklch, var(--color-danger) 10%, transparent)',
  },
  medium: {
    label: 'Medel',
    color: 'var(--color-warning)',
    bg: 'color-mix(in oklch, var(--color-warning) 10%, transparent)',
  },
  low: {
    label: 'Låg',
    color: 'var(--color-info)',
    bg: 'color-mix(in oklch, var(--color-info) 10%, transparent)',
  },
}

function SuggestionsSection({ suggestions }: { suggestions: TechSuggestion[] }) {
  const [filter, setFilter] = useState<'all' | SuggestionSeverity>('all')
  const filtered = filter === 'all' ? suggestions : suggestions.filter((s) => s.severity === filter)

  const counts = {
    high: suggestions.filter((s) => s.severity === 'high').length,
    medium: suggestions.filter((s) => s.severity === 'medium').length,
    low: suggestions.filter((s) => s.severity === 'low').length,
  }

  return (
    <div className="rounded-[14px] border border-[var(--border)] bg-[var(--surface)] overflow-hidden">
      <div className="px-4 py-3 border-b border-[var(--border)] flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <AlertTriangle size={13} className="text-[var(--accent)]" />
          <span className="text-[11px] font-semibold text-[var(--accent)] uppercase tracking-[0.14em]">
            Förbättringsförslag · {suggestions.length}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <FilterPill active={filter === 'all'} onClick={() => setFilter('all')}>
            Alla ({suggestions.length})
          </FilterPill>
          {counts.high > 0 && (
            <FilterPill active={filter === 'high'} onClick={() => setFilter('high')} severity="high">
              Hög ({counts.high})
            </FilterPill>
          )}
          {counts.medium > 0 && (
            <FilterPill
              active={filter === 'medium'}
              onClick={() => setFilter('medium')}
              severity="medium"
            >
              Medel ({counts.medium})
            </FilterPill>
          )}
          {counts.low > 0 && (
            <FilterPill active={filter === 'low'} onClick={() => setFilter('low')} severity="low">
              Låg ({counts.low})
            </FilterPill>
          )}
        </div>
      </div>
      <div className="divide-y divide-[var(--border)]">
        {filtered.map((s) => (
          <SuggestionCard key={s.id} suggestion={s} />
        ))}
      </div>
    </div>
  )
}

function FilterPill({
  active,
  onClick,
  children,
  severity,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
  severity?: SuggestionSeverity
}) {
  const color = severity ? severityMeta[severity].color : 'var(--accent)'
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'h-6 px-2.5 rounded-[6px] text-[11px] font-medium transition-colors border',
        active
          ? 'text-[var(--fg)]'
          : 'text-[var(--fg-muted)] hover:text-[var(--fg)] border-transparent',
      )}
      style={active ? { borderColor: color, background: `color-mix(in oklch, ${color} 10%, transparent)` } : undefined}
    >
      {children}
    </button>
  )
}

function SuggestionCard({ suggestion }: { suggestion: TechSuggestion }) {
  const [expanded, setExpanded] = useState(false)
  const [copied, setCopied] = useState(false)
  const cat = categoryMeta[suggestion.category]
  const sev = severityMeta[suggestion.severity]
  const CatIcon = cat.icon

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(suggestion.prompt)
      setCopied(true)
      toast.success('Prompt kopierad', 'Klistra in i Claude Code, Cursor eller valfri AI-agent.')
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error('Kunde inte kopiera')
    }
  }

  return (
    <div className="px-4 py-3.5">
      <div className="flex items-start gap-3">
        <div
          className="h-7 w-7 rounded-md flex items-center justify-center shrink-0 border"
          style={{ background: sev.bg, borderColor: `color-mix(in oklch, ${sev.color} 22%, transparent)`, color: sev.color }}
        >
          <CatIcon size={13} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="text-[13.5px] font-semibold text-[var(--fg)]">{suggestion.title}</h4>
                <span
                  className="inline-flex items-center h-4.5 px-1.5 rounded-[4px] text-[10px] font-semibold uppercase tracking-[0.08em]"
                  style={{ color: sev.color, background: sev.bg }}
                >
                  {sev.label}
                </span>
                <span className="text-[11px] text-[var(--fg-subtle)]">· {cat.label}</span>
                {suggestion.repo && (
                  <span className="text-[11px] font-mono text-[var(--fg-subtle)]">
                    {suggestion.repo}
                  </span>
                )}
              </div>
              <p className="mt-1 text-[12.5px] text-[var(--fg-muted)] leading-[1.5]">
                {suggestion.rationale}
              </p>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setExpanded((e) => !e)}
                aria-label={expanded ? 'Dölj prompt' : 'Visa prompt'}
              >
                <Eye size={12} />
                {expanded ? 'Dölj' : 'Visa'}
              </Button>
              <Button size="sm" variant="secondary" onClick={handleCopy}>
                {copied ? <Check size={12} /> : <Copy size={12} />}
                {copied ? 'Kopierad' : 'Kopiera prompt'}
              </Button>
            </div>
          </div>

          {expanded && (
            <pre className="mt-3 p-3 rounded-[8px] bg-[var(--bg)] border border-[var(--border)] text-[12px] font-mono text-[var(--fg)] whitespace-pre-wrap break-words leading-[1.55] max-h-[320px] overflow-y-auto">
              {suggestion.prompt}
            </pre>
          )}
        </div>
      </div>
    </div>
  )
}

