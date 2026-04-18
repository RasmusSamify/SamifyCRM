import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { FileSignature, Search, ExternalLink } from 'lucide-react'
import { PageShell } from '@/components/layout/PageShell'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Badge } from '@/components/ui/Badge'
import { DataTable, type Column } from '@/components/ui/DataTable'
import { EmptyState } from '@/components/ui/EmptyState'
import { formatDate } from '@/lib/format'
import { supabase } from '@/lib/supabase'
import type { ScriveDocument } from '@/types/database'

const statusMeta: Record<
  string,
  { label: string; tone: 'default' | 'success' | 'warning' | 'danger' | 'violet' }
> = {
  draft: { label: 'Utkast', tone: 'default' },
  pending: { label: 'Väntar signering', tone: 'warning' },
  signed: { label: 'Signerad', tone: 'success' },
  expired: { label: 'Utgången', tone: 'danger' },
  cancelled: { label: 'Avbruten', tone: 'danger' },
}

function useScriveDocs() {
  return useQuery({
    queryKey: ['scrive_documents', 'list'],
    queryFn: async (): Promise<ScriveDocument[]> => {
      const { data, error } = await supabase
        .from('scrive_documents')
        .select('*')
        .order('created_at', { ascending: false })
      if (error) throw error
      return data ?? []
    },
  })
}

export function ScrivePage() {
  const { data: docs, isLoading } = useScriveDocs()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return (docs ?? []).filter((d) => {
      if (statusFilter !== 'all' && d.status !== statusFilter) return false
      if (!q) return true
      return (
        d.title.toLowerCase().includes(q) ||
        d.client_name.toLowerCase().includes(q) ||
        (d.signatory_name ?? '').toLowerCase().includes(q)
      )
    })
  }, [docs, search, statusFilter])

  const columns: Column<ScriveDocument>[] = [
    {
      key: 'title',
      header: 'Dokument',
      render: (d) => (
        <div className="min-w-0">
          <div className="font-medium text-[var(--fg)] truncate">{d.title}</div>
          <div className="text-[12px] text-[var(--fg-subtle)] truncate">{d.client_name}</div>
        </div>
      ),
    },
    {
      key: 'signatory',
      header: 'Signatär',
      render: (d) => (
        <div className="min-w-0 text-[13px] text-[var(--fg-muted)]">
          <div className="truncate">{d.signatory_name ?? '—'}</div>
          {d.signatory_email && (
            <div className="text-[11.5px] text-[var(--fg-subtle)] truncate">
              {d.signatory_email}
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (d) => {
        const meta = statusMeta[d.status ?? 'draft'] ?? statusMeta.draft
        return <Badge variant={meta.tone === 'default' ? 'default' : meta.tone}>{meta.label}</Badge>
      },
    },
    {
      key: 'signed',
      header: 'Signerad',
      render: (d) => (
        <span className="text-[var(--fg-muted)]">{formatDate(d.signed_at)}</span>
      ),
    },
    {
      key: 'actions',
      header: '',
      width: '100px',
      align: 'right',
      render: (d) => (
        <div className="flex items-center justify-end gap-1">
          {d.scrive_url && (
            <a
              href={d.scrive_url}
              target="_blank"
              rel="noreferrer noopener"
              onClick={(e) => e.stopPropagation()}
              className="inline-flex h-7 px-2 items-center gap-1 rounded-md text-[11.5px] text-[var(--fg-muted)] hover:text-[var(--fg)] hover:bg-[var(--surface-2)] transition-colors"
            >
              <ExternalLink size={11} />
              Scrive
            </a>
          )}
        </div>
      ),
    },
  ]

  return (
    <PageShell
      title="Scrive — E-signering"
      subtitle={docs ? `${docs.length} dokument` : undefined}
    >
      <div className="flex items-center gap-2 mb-4">
        <div className="relative flex-1 max-w-md">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--fg-subtle)] pointer-events-none"
          />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Sök titel, kund, signatär…"
            className="pl-9"
          />
        </div>
        <div className="w-[180px]">
          <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="all">Alla statusar</option>
            {Object.entries(statusMeta).map(([k, v]) => (
              <option key={k} value={k}>
                {v.label}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <DataTable
        columns={columns}
        rows={filtered}
        rowKey={(d) => d.id}
        loading={isLoading}
        empty={
          <EmptyState
            icon={FileSignature}
            title={docs?.length ? 'Inga träffar' : 'Inga dokument än'}
            description={
              docs?.length
                ? 'Prova en annan sökning eller filter.'
                : 'Dokument från Scrive synkas automatiskt när de skapas via integrationen.'
            }
          />
        }
      />
    </PageShell>
  )
}
