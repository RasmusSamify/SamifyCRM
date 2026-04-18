import { useMemo } from 'react'
import {
  TrendingUp,
  Receipt,
  GitBranch,
  Users,
  ArrowUpRight,
  Sparkles,
  Zap,
  BellRing,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { PageShell } from '@/components/layout/PageShell'
import { StatCard } from '@/components/ui/StatCard'
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Progress } from '@/components/ui/Progress'
import { EmptyState } from '@/components/ui/EmptyState'
import { formatSEK, formatRelativeDays } from '@/lib/format'
import { useAuth } from '@/hooks/useAuth'
import { useDashboardData } from './queries'
import { phaseFor } from '@/modules/clients/constants'
import { resolvedStatus } from '@/modules/invoices/constants'

export function DashboardPage() {
  const { user } = useAuth()
  const { data, isLoading } = useDashboardData()

  const firstName =
    (user?.user_metadata?.display_name as string | undefined)?.split(' ')[0] ||
    user?.email?.split('@')[0] ||
    'där'
  const today = new Intl.DateTimeFormat('sv-SE', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(new Date())
  const week = getISOWeek(new Date())

  const stats = useMemo(() => {
    if (!data) return null
    const activeClients = data.clients.filter((c) => c.client_status !== 'churn')
    const mrr = activeClients.reduce((s, c) => s + (c.mrr ?? 0), 0)
    const pipelineValue = data.pipeline
      .filter((p) => p.phase !== 'forlorad' && p.phase !== 'vunnen')
      .reduce((s, p) => s + (p.value ?? 0), 0)
    const activeDealsCount = data.pipeline.filter(
      (p) => p.phase !== 'forlorad' && p.phase !== 'vunnen',
    ).length
    const openInvoices = data.invoices.filter((i) => {
      const st = resolvedStatus(i.status, i.due_date)
      return st === 'pending' || st === 'overdue'
    })
    const openSum = openInvoices.reduce((s, i) => s + (i.amount ?? 0), 0)
    const overdueCount = data.invoices.filter(
      (i) => resolvedStatus(i.status, i.due_date) === 'overdue',
    ).length
    const topClients = [...activeClients]
      .sort((a, b) => (b.mrr ?? 0) - (a.mrr ?? 0))
      .slice(0, 5)
    return {
      mrr,
      pipelineValue,
      activeDealsCount,
      openSum,
      overdueCount,
      activeClients: activeClients.length,
      topClients,
    }
  }, [data])

  return (
    <PageShell
      title="Dashboard"
      subtitle="Översikt över din verksamhet"
      action={
        <Button size="sm" variant="secondary">
          <Sparkles size={14} />
          AI-prognos
        </Button>
      }
    >
      {/* Hero greeting */}
      <div className="mb-8 animate-slide-up">
        <div className="flex items-baseline gap-3">
          <span className="text-[13px] text-[var(--fg-subtle)] uppercase tracking-[0.18em] capitalize">
            {today}
          </span>
          <span className="text-[13px] text-[var(--fg-subtle)]">·</span>
          <span className="text-[13px] text-[var(--fg-subtle)]">Vecka {week}</span>
        </div>
        <h2 className="mt-2 text-display-2 text-[var(--fg)]">
          Välkommen tillbaka,{' '}
          <span className="font-display italic text-[var(--accent)] capitalize">{firstName}</span>.
        </h2>
        {stats && (
          <p className="mt-1.5 text-[14px] text-[var(--fg-muted)] max-w-xl">
            Du har {formatSEK(stats.mrr)} i MRR, {stats.activeDealsCount} aktiva deals och{' '}
            {stats.overdueCount > 0 ? (
              <span className="text-[var(--color-danger)]">
                {stats.overdueCount} försenade fakturor
              </span>
            ) : (
              'inga försenade fakturor'
            )}
            .
          </p>
        )}
      </div>

      {/* KPI grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 animate-slide-up">
        <StatCard
          label="MRR"
          value={isLoading ? '—' : formatSEK(stats?.mrr)}
          icon={TrendingUp}
          accent="brand"
          hint={stats ? `${stats.activeClients} aktiva kunder` : undefined}
        />
        <StatCard
          label="Pipeline"
          value={isLoading ? '—' : formatSEK(stats?.pipelineValue)}
          icon={GitBranch}
          accent="violet"
          hint={stats ? `${stats.activeDealsCount} aktiva deals` : undefined}
        />
        <StatCard
          label="Öppna fakturor"
          value={isLoading ? '—' : formatSEK(stats?.openSum)}
          icon={Receipt}
          accent={stats && stats.overdueCount > 0 ? 'warning' : 'neutral'}
          hint={
            stats
              ? stats.overdueCount > 0
                ? `${stats.overdueCount} försenade`
                : 'Inga försenade'
              : undefined
          }
        />
        <StatCard
          label="Aktiva kunder"
          value={isLoading ? '—' : String(stats?.activeClients ?? 0)}
          icon={Users}
          accent="success"
        />
      </div>

      {/* Main grid */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Top clients */}
        <Card className="lg:col-span-2 animate-slide-up">
          <CardHeader>
            <div>
              <CardTitle>Toppkunder</CardTitle>
              <p className="text-[13px] text-[var(--fg-subtle)] mt-1 normal-case tracking-normal">
                Rankade efter MRR
              </p>
            </div>
            <Link
              to="/kunder"
              className="inline-flex items-center gap-1.5 h-8 px-3 rounded-[10px] text-[13px] font-medium text-[var(--fg-muted)] hover:text-[var(--fg)] hover:bg-[var(--surface-2)] transition-colors"
            >
              Visa alla
              <ArrowUpRight size={13} />
            </Link>
          </CardHeader>
          <CardBody className="pt-2 px-0 pb-0">
            {isLoading ? (
              <div className="px-5 pb-5 space-y-2">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="h-12 rounded-[10px] bg-[var(--surface-2)] animate-pulse-soft"
                  />
                ))}
              </div>
            ) : stats && stats.topClients.length > 0 ? (
              <div className="divide-y divide-[var(--border)]">
                {stats.topClients.map((client, i) => {
                  const phase = phaseFor(client.project_health ?? 0)
                  return (
                    <Link
                      key={client.id}
                      to="/kunder"
                      className="block px-5 py-3.5 flex items-center gap-4 hover:bg-[var(--surface-2)]/50 transition-colors"
                    >
                      <div className="font-mono text-[11px] text-[var(--fg-subtle)] w-5">
                        {String(i + 1).padStart(2, '0')}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[14px] font-medium text-[var(--fg)] truncate">
                          {client.name}
                        </div>
                        <div className="text-[12px] text-[var(--fg-subtle)] mt-0.5">
                          {phase.label}
                        </div>
                      </div>
                      <div className="w-28 hidden md:block">
                        <Progress value={client.project_health ?? 0} />
                      </div>
                      <div className="text-num text-[14px] text-[var(--fg)] w-24 text-right">
                        {formatSEK(client.mrr)}
                        <div className="text-[11px] text-[var(--fg-subtle)] font-sans mt-0.5">
                          /månad
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            ) : (
              <EmptyState
                icon={Users}
                title="Inga kunder än"
                description="Lägg till din första kund för att se ranking här."
              />
            )}
          </CardBody>
        </Card>

        {/* Reminders */}
        <Card className="animate-slide-up relative overflow-hidden">
          <div
            className="absolute inset-0 opacity-[0.06] pointer-events-none"
            style={{
              background:
                'radial-gradient(circle at 80% 0%, var(--accent), transparent 50%)',
            }}
          />
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg flex items-center justify-center bg-[color-mix(in_oklch,var(--accent)_12%,transparent)] border border-[color-mix(in_oklch,var(--accent)_25%,transparent)]">
                <BellRing size={13} className="text-[var(--accent)]" />
              </div>
              <CardTitle className="normal-case tracking-normal text-[var(--fg)]">
                Påminnelser
              </CardTitle>
            </div>
            <Badge variant="accent">{data?.reminders.length ?? 0}</Badge>
          </CardHeader>
          <CardBody>
            {isLoading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-12 rounded-[8px] bg-[var(--surface-2)] animate-pulse-soft"
                  />
                ))}
              </div>
            ) : data && data.reminders.length > 0 ? (
              <div className="space-y-2.5">
                {data.reminders.slice(0, 5).map((r) => (
                  <Link
                    key={r.id}
                    to="/paminnelser"
                    className="block rounded-[8px] hover:bg-[var(--surface-2)]/50 px-2 py-2 -mx-2 transition-colors"
                  >
                    <div className="text-[13px] font-medium text-[var(--fg)] truncate">
                      {r.title}
                    </div>
                    <div className="mt-0.5 flex items-center gap-2 text-[11.5px] text-[var(--fg-subtle)]">
                      {r.client_name && <span className="truncate">{r.client_name}</span>}
                      <span>·</span>
                      <span>{formatRelativeDays(r.due_date)}</span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-[13px] text-[var(--fg-subtle)] py-4 text-center">
                Inga öppna påminnelser
              </p>
            )}
          </CardBody>
        </Card>
      </div>

      {/* Quick actions */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
        <QuickLink to="/kunder" label="Kunder" count={data?.clients.length} icon={Users} />
        <QuickLink
          to="/pipeline"
          label="Pipeline"
          count={stats?.activeDealsCount}
          icon={GitBranch}
        />
        <QuickLink
          to="/fakturor"
          label="Fakturor"
          count={data?.invoices.length}
          icon={Receipt}
        />
        <QuickLink
          to="/paminnelser"
          label="Påminnelser"
          count={data?.reminders.length}
          icon={Zap}
        />
      </div>
    </PageShell>
  )
}

function QuickLink({
  to,
  label,
  count,
  icon: Icon,
}: {
  to: string
  label: string
  count?: number
  icon: React.ComponentType<{ size?: number; className?: string }>
}) {
  return (
    <Link
      to={to}
      className="group surface-glow rounded-[12px] bg-[var(--surface)] border border-[var(--border)] px-4 py-3.5 flex items-center gap-3 hover:border-[var(--border-strong)] transition-all"
    >
      <div className="h-8 w-8 rounded-md flex items-center justify-center bg-[var(--surface-2)] border border-[var(--border)]">
        <Icon size={14} className="text-[var(--fg-muted)]" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[13px] font-medium text-[var(--fg)]">{label}</div>
        {count !== undefined && (
          <div className="text-num text-[11.5px] text-[var(--fg-subtle)] mt-0.5">
            {count} st
          </div>
        )}
      </div>
      <ArrowUpRight
        size={14}
        className="text-[var(--fg-subtle)] group-hover:text-[var(--accent)] transition-colors"
      />
    </Link>
  )
}

function getISOWeek(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7))
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7)
}
