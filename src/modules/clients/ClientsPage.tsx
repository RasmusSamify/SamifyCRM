import { useMemo, useState } from 'react'
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
import { formatSEK } from '@/lib/format'
import { useClients } from './queries'
import { CLIENT_STATUS_OPTIONS, phaseFor, statusOption } from './constants'
import { ClientDialog } from './ClientDialog'
import { ClientDrawer } from './ClientDrawer'
import type { Client } from '@/types/database'

export function ClientsPage() {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<string>('all')
  const [creating, setCreating] = useState(false)
  const [selected, setSelected] = useState<Client | null>(null)

  const { data: clients, isLoading } = useClients()

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

  const columns: Column<Client>[] = [
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
        onRowClick={setSelected}
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

      <ClientDialog open={creating} onClose={() => setCreating(false)} />
      <ClientDrawer
        client={selected}
        open={!!selected}
        onClose={() => setSelected(null)}
      />
    </PageShell>
  )
}
