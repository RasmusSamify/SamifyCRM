import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Plus, Search, Users as UsersIcon } from 'lucide-react'
import { PageShell } from '@/components/layout/PageShell'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Badge } from '@/components/ui/Badge'
import { Avatar } from '@/components/ui/Avatar'
import { Progress } from '@/components/ui/Progress'
import { DataTable, type Column } from '@/components/ui/DataTable'
import { EmptyState } from '@/components/ui/EmptyState'
import { cn } from '@/lib/cn'
import { formatSEK } from '@/lib/format'
import { useClients } from './queries'
import { CLIENT_STATUS_OPTIONS, phaseFor, statusOption } from './constants'
import { ClientDialog } from './ClientDialog'
import { ClientDrawer } from './ClientDrawer'
import { ClientDetailPanel } from './ClientDetailPanel'
import type { Client } from '@/types/database'

function useIsLargeViewport() {
  const [isLarge, setIsLarge] = useState(() =>
    typeof window !== 'undefined'
      ? window.matchMedia('(min-width: 1024px)').matches
      : true,
  )
  useEffect(() => {
    const mql = window.matchMedia('(min-width: 1024px)')
    const onChange = (e: MediaQueryListEvent) => setIsLarge(e.matches)
    mql.addEventListener('change', onChange)
    return () => mql.removeEventListener('change', onChange)
  }, [])
  return isLarge
}

export function ClientsPage() {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<string>('all')
  const [creating, setCreating] = useState(false)
  const [searchParams, setSearchParams] = useSearchParams()
  const isLarge = useIsLargeViewport()

  const { data: clients, isLoading } = useClients()

  const clientIdParam = searchParams.get('client')
  const selected = useMemo(
    () =>
      clientIdParam ? clients?.find((c) => c.id === clientIdParam) ?? null : null,
    [clients, clientIdParam],
  )

  const selectClient = (client: Client | null) => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev)
        if (client) next.set('client', client.id)
        else next.delete('client')
        return next
      },
      { replace: true },
    )
  }

  const filtered = useMemo(() => {
    if (!clients) return []
    const q = search.trim().toLowerCase()
    return clients.filter((c) => {
      if (status !== 'all' && c.client_status !== status) return false
      if (!q) return true
      return (
        c.name.toLowerCase().includes(q) ||
        (c.contact_name ?? '').toLowerCase().includes(q) ||
        (c.email ?? '').toLowerCase().includes(q) ||
        (c.service ?? '').toLowerCase().includes(q)
      )
    })
  }, [clients, search, status])

  const totalMRR = useMemo(
    () => filtered.reduce((sum, c) => sum + (c.mrr ?? 0), 0),
    [filtered],
  )

  const splitMode = isLarge && !!selected

  const allColumns: Column<Client>[] = [
    {
      key: 'name',
      header: 'Kund',
      render: (c) => (
        <div className="flex items-center gap-3">
          <Avatar name={c.name} size="sm" />
          <div className="min-w-0">
            <div className="font-medium text-[var(--fg)] truncate">{c.name}</div>
            {c.contact_name && (
              <div className="text-[12px] text-[var(--fg-subtle)] truncate">
                {c.contact_name}
              </div>
            )}
          </div>
        </div>
      ),
    },
    {
      key: 'service',
      header: 'Tjänst',
      render: (c) => (
        <span className="text-[var(--fg-muted)] truncate">{c.service ?? '—'}</span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (c) => {
        const s = statusOption(c.client_status)
        return <Badge variant={s.tone}>{s.label}</Badge>
      },
    },
    {
      key: 'phase',
      header: 'Fas',
      width: '220px',
      render: (c) => {
        const phase = phaseFor(c.project_health ?? 0)
        return (
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11.5px] text-[var(--fg-muted)]">{phase.label}</span>
              <span className="text-num text-[11.5px] text-[var(--fg-muted)]">
                {c.project_health}%
              </span>
            </div>
            <Progress value={c.project_health ?? 0} />
          </div>
        )
      },
    },
    {
      key: 'mrr',
      header: 'MRR',
      align: 'right',
      render: (c) => (
        <span className="text-num text-[var(--fg)]">{formatSEK(c.mrr)}</span>
      ),
    },
  ]

  // When the detail panel is open alongside the list, drop the wider columns
  // to keep the list readable in its narrower column.
  const columns = splitMode
    ? allColumns.filter((c) => c.key === 'name' || c.key === 'status' || c.key === 'mrr')
    : allColumns

  return (
    <PageShell
      title="Kunder"
      subtitle={
        clients
          ? `${filtered.length} av ${clients.length} · ${formatSEK(totalMRR)} total MRR`
          : undefined
      }
      action={
        <Button size="sm" onClick={() => setCreating(true)}>
          <Plus size={14} />
          Ny kund
        </Button>
      }
    >
      <div
        className={cn(
          'gap-5',
          splitMode
            ? 'grid grid-cols-[minmax(0,1fr)_minmax(420px,560px)] items-start'
            : 'block',
        )}
      >
        {/* List column */}
        <div className="min-w-0">
          {/* Filters */}
          <div className="flex items-center gap-2 mb-4">
            <div className="relative flex-1 max-w-md">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--fg-subtle)] pointer-events-none"
              />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Sök kund, kontakt, e-post…"
                className="pl-9"
              />
            </div>
            <div className="w-[180px]">
              <Select value={status} onChange={(e) => setStatus(e.target.value)}>
                <option value="all">Alla statusar</option>
                {CLIENT_STATUS_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          <DataTable
            columns={columns}
            rows={filtered}
            rowKey={(c) => c.id}
            onRowClick={(c) => selectClient(c.id === selected?.id ? null : c)}
            activeRow={(c) => c.id === selected?.id}
            loading={isLoading}
            empty={
              <EmptyState
                icon={UsersIcon}
                title={clients?.length ? 'Inga träffar' : 'Inga kunder än'}
                description={
                  clients?.length
                    ? 'Prova att rensa filter eller söka på något annat.'
                    : 'Lägg till din första kund för att börja.'
                }
                action={
                  !clients?.length && (
                    <Button onClick={() => setCreating(true)}>
                      <Plus size={14} />
                      Skapa kund
                    </Button>
                  )
                }
              />
            }
          />
        </div>

        {/* Inline detail panel (lg+ only) */}
        {splitMode && selected && (
          <ClientDetailPanel client={selected} onClose={() => selectClient(null)} />
        )}
      </div>

      <ClientDialog open={creating} onClose={() => setCreating(false)} />

      {/* Overlay drawer for narrow viewports only */}
      {!isLarge && (
        <ClientDrawer
          client={selected}
          open={!!selected}
          onClose={() => selectClient(null)}
        />
      )}
    </PageShell>
  )
}
