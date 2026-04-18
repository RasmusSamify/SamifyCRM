import { useMemo, useState } from 'react'
import { Plus, Receipt, Search, AlertTriangle } from 'lucide-react'
import { PageShell } from '@/components/layout/PageShell'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Badge } from '@/components/ui/Badge'
import { DataTable, type Column } from '@/components/ui/DataTable'
import { EmptyState } from '@/components/ui/EmptyState'
import { StatCard } from '@/components/ui/StatCard'
import { formatDate, formatSEK, formatRelativeDays } from '@/lib/format'
import { useInvoices } from './queries'
import { INVOICE_STATUS, invoiceStatus, resolvedStatus } from './constants'
import { InvoiceDialog } from './InvoiceDialog'
import type { Invoice } from '@/types/database'

export function InvoicesPage() {
  const { data: invoices, isLoading } = useInvoices()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [editing, setEditing] = useState<Invoice | null>(null)
  const [creating, setCreating] = useState(false)

  const decorated = useMemo(
    () =>
      (invoices ?? []).map((i) => ({
        ...i,
        _resolvedStatus: resolvedStatus(i.status, i.due_date),
      })),
    [invoices],
  )

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return decorated.filter((i) => {
      if (statusFilter !== 'all' && i._resolvedStatus !== statusFilter) return false
      if (!q) return true
      return (
        i.client_name.toLowerCase().includes(q) ||
        (i.category ?? '').toLowerCase().includes(q)
      )
    })
  }, [decorated, search, statusFilter])

  const stats = useMemo(() => {
    const total = decorated.reduce((s, i) => s + (i.amount ?? 0), 0)
    const pending = decorated
      .filter((i) => i._resolvedStatus === 'pending')
      .reduce((s, i) => s + (i.amount ?? 0), 0)
    const overdue = decorated.filter((i) => i._resolvedStatus === 'overdue')
    const overdueSum = overdue.reduce((s, i) => s + (i.amount ?? 0), 0)
    const paid = decorated
      .filter((i) => i._resolvedStatus === 'paid')
      .reduce((s, i) => s + (i.amount ?? 0), 0)
    return { total, pending, overdueSum, overdueCount: overdue.length, paid }
  }, [decorated])

  const columns: Column<(typeof decorated)[number]>[] = [
    {
      key: 'client',
      header: 'Kund',
      render: (i) => <span className="font-medium text-[var(--fg)]">{i.client_name}</span>,
    },
    {
      key: 'category',
      header: 'Kategori',
      render: (i) => (
        <span className="text-[var(--fg-muted)]">{i.category ?? '—'}</span>
      ),
    },
    {
      key: 'due',
      header: 'Förfaller',
      render: (i) => (
        <div>
          <div className="text-[var(--fg)]">{formatDate(i.due_date)}</div>
          <div className="text-[11.5px] text-[var(--fg-subtle)]">
            {formatRelativeDays(i.due_date)}
          </div>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (i) => {
        const s = invoiceStatus(i._resolvedStatus)
        return <Badge variant={s.tone === 'default' ? 'default' : s.tone}>{s.label}</Badge>
      },
    },
    {
      key: 'amount',
      header: 'Belopp',
      align: 'right',
      render: (i) => (
        <span className="text-num font-medium text-[var(--fg)]">
          {formatSEK(i.amount)}
        </span>
      ),
    },
  ]

  return (
    <PageShell
      title="Fakturor"
      subtitle={invoices ? `${invoices.length} fakturor` : undefined}
      action={
        <Button size="sm" onClick={() => setCreating(true)}>
          <Plus size={14} />
          Ny faktura
        </Button>
      }
    >
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        <StatCard label="Totalt" value={formatSEK(stats.total)} icon={Receipt} accent="neutral" />
        <StatCard label="Betalt" value={formatSEK(stats.paid)} icon={Receipt} accent="success" />
        <StatCard label="Väntande" value={formatSEK(stats.pending)} icon={Receipt} accent="warning" />
        <StatCard
          label="Försenade"
          value={formatSEK(stats.overdueSum)}
          hint={`${stats.overdueCount} st`}
          icon={AlertTriangle}
          accent="danger"
        />
      </div>

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
            placeholder="Sök kund eller kategori…"
            className="pl-9"
          />
        </div>
        <div className="w-[180px]">
          <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="all">Alla statusar</option>
            {INVOICE_STATUS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <DataTable
        columns={columns}
        rows={filtered}
        rowKey={(i) => i.id}
        onRowClick={(i) => setEditing(i)}
        loading={isLoading}
        empty={
          <EmptyState
            icon={Receipt}
            title={invoices?.length ? 'Inga träffar' : 'Inga fakturor än'}
            description={
              invoices?.length
                ? 'Prova att ändra filter eller sök.'
                : 'Skapa din första faktura.'
            }
          />
        }
      />

      <InvoiceDialog open={creating} onClose={() => setCreating(false)} />
      <InvoiceDialog open={!!editing} onClose={() => setEditing(null)} initial={editing} />
    </PageShell>
  )
}
