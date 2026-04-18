import { useMemo, useState } from 'react'
import { Plus, FileText, Search } from 'lucide-react'
import { PageShell } from '@/components/layout/PageShell'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { DataTable, type Column } from '@/components/ui/DataTable'
import { EmptyState } from '@/components/ui/EmptyState'
import { formatDate, formatSEK, formatRelativeDays } from '@/lib/format'
import { useContracts } from './queries'
import { ContractDialog } from './ContractDialog'
import type { Contract } from '@/types/database'

function endStatus(endDate: string) {
  const ms = new Date(endDate).getTime() - Date.now()
  const days = ms / 86_400_000
  if (days < 0) return { label: 'Utgånget', tone: 'danger' as const }
  if (days < 30) return { label: 'Går ut snart', tone: 'warning' as const }
  if (days < 90) return { label: 'Inom 90 dagar', tone: 'default' as const }
  return { label: 'Aktivt', tone: 'success' as const }
}

export function ContractsPage() {
  const { data: contracts, isLoading } = useContracts()
  const [search, setSearch] = useState('')
  const [editing, setEditing] = useState<Contract | null>(null)
  const [creating, setCreating] = useState(false)

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return (contracts ?? []).filter((c) => !q || c.client_name.toLowerCase().includes(q))
  }, [contracts, search])

  const columns: Column<Contract>[] = [
    {
      key: 'client',
      header: 'Kund',
      render: (c) => <span className="font-medium text-[var(--fg)]">{c.client_name}</span>,
    },
    {
      key: 'period',
      header: 'Period',
      render: (c) => (
        <div className="text-[var(--fg-muted)]">
          <div>
            {formatDate(c.start_date)} → {formatDate(c.end_date)}
          </div>
          <div className="text-[11.5px] text-[var(--fg-subtle)]">
            {formatRelativeDays(c.end_date)}
          </div>
        </div>
      ),
    },
    {
      key: 'binding',
      header: 'Bindning / Uppsägning',
      render: (c) => (
        <span className="text-[var(--fg-muted)] text-[12.5px]">
          {c.binding_months ?? '—'} mån / {c.notice_months ?? '—'} mån
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (c) => {
        const s = endStatus(c.end_date)
        return <Badge variant={s.tone}>{s.label}</Badge>
      },
    },
    {
      key: 'monthly',
      header: 'Månadsvärde',
      align: 'right',
      render: (c) => (
        <span className="text-num text-[var(--fg)] font-medium">
          {formatSEK(c.monthly_value)}
        </span>
      ),
    },
  ]

  return (
    <PageShell
      title="Avtal & Kontrakt"
      subtitle={contracts ? `${contracts.length} avtal` : undefined}
      action={
        <Button size="sm" onClick={() => setCreating(true)}>
          <Plus size={14} />
          Nytt avtal
        </Button>
      }
    >
      <div className="relative flex-1 max-w-md mb-4">
        <Search
          size={14}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--fg-subtle)] pointer-events-none"
        />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Sök kund…"
          className="pl-9"
        />
      </div>

      <DataTable
        columns={columns}
        rows={filtered}
        rowKey={(c) => c.id}
        onRowClick={setEditing}
        loading={isLoading}
        empty={
          <EmptyState
            icon={FileText}
            title={contracts?.length ? 'Inga träffar' : 'Inga avtal än'}
            description={
              contracts?.length
                ? 'Prova en annan sökning.'
                : 'Lägg till ett avtal för att börja spåra bindningstider.'
            }
          />
        }
      />

      <ContractDialog open={creating} onClose={() => setCreating(false)} />
      <ContractDialog open={!!editing} onClose={() => setEditing(null)} initial={editing} />
    </PageShell>
  )
}
