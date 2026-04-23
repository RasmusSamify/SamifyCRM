import { useMemo, useState } from 'react'
import { Plus, PenLine, Search, ExternalLink } from 'lucide-react'
import { PageShell } from '@/components/layout/PageShell'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { DataTable, type Column } from '@/components/ui/DataTable'
import { EmptyState } from '@/components/ui/EmptyState'
import { formatDate, formatSEK } from '@/lib/format'
import { useQuotes } from './queries'
import { QuoteDialog } from './QuoteDialog'
import type { Quote } from '@/types/database'

const statusMeta: Record<string, { label: string; tone: 'default' | 'success' | 'warning' | 'danger' | 'violet' }> = {
  draft: { label: 'Utkast', tone: 'default' },
  sent: { label: 'Skickad', tone: 'violet' },
  accepted: { label: 'Accepterad', tone: 'success' },
  declined: { label: 'Avböjd', tone: 'danger' },
}

export function QuotesPage() {
  const { data: quotes, isLoading } = useQuotes()
  const [search, setSearch] = useState('')
  const [editing, setEditing] = useState<Quote | null>(null)
  const [creating, setCreating] = useState(false)

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return (quotes ?? []).filter(
      (x) =>
        !q ||
        x.client_name.toLowerCase().includes(q) ||
        (x.contact_name ?? '').toLowerCase().includes(q),
    )
  }, [quotes, search])

  const columns: Column<Quote>[] = [
    {
      key: 'client',
      header: 'Kund',
      render: (q) => (
        <div className="min-w-0">
          <div className="font-medium text-[var(--fg)] truncate">{q.client_name}</div>
          {q.contact_name && (
            <div className="text-[12px] text-[var(--fg-subtle)] truncate">{q.contact_name}</div>
          )}
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (q) => {
        const meta = statusMeta[q.status ?? 'draft'] ?? statusMeta.draft
        return <Badge variant={meta.tone === 'default' ? 'default' : meta.tone}>{meta.label}</Badge>
      },
    },
    {
      key: 'validUntil',
      header: 'Giltig till',
      render: (q) => (
        <span className="text-[var(--fg-muted)]">{formatDate(q.valid_until)}</span>
      ),
    },
    {
      key: 'total',
      header: 'Totalt år 1',
      align: 'right',
      render: (q) => (
        <span className="text-num font-medium text-[var(--fg)]">{formatSEK(q.total)}</span>
      ),
    },
    {
      key: 'public',
      header: '',
      width: '60px',
      render: (q) =>
        q.public_token ? (
          <a
            href={`/offer/${q.public_token}`}
            target="_blank"
            rel="noreferrer noopener"
            onClick={(e) => e.stopPropagation()}
            className="inline-flex h-7 w-7 items-center justify-center rounded-md text-[var(--fg-subtle)] hover:text-[var(--accent)] hover:bg-[var(--surface-2)] transition-colors"
            aria-label="Öppna publik offert"
          >
            <ExternalLink size={13} />
          </a>
        ) : null,
    },
  ]

  return (
    <PageShell
      title="Offerter"
      subtitle={quotes ? `${quotes.length} offerter` : undefined}
      action={
        <Button size="sm" onClick={() => setCreating(true)}>
          <Plus size={14} />
          Ny offert
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
          placeholder="Sök kund eller kontakt…"
          className="pl-9"
        />
      </div>

      <DataTable
        columns={columns}
        rows={filtered}
        rowKey={(q) => q.id}
        onRowClick={setEditing}
        loading={isLoading}
        empty={
          <EmptyState
            icon={PenLine}
            title={quotes?.length ? 'Inga träffar' : 'Inga offerter än'}
            description={
              quotes?.length
                ? 'Prova en annan sökning.'
                : 'Skapa din första offert.'
            }
          />
        }
      />

      <QuoteDialog open={creating} onClose={() => setCreating(false)} />
      <QuoteDialog open={!!editing} onClose={() => setEditing(null)} initial={editing} />
    </PageShell>
  )
}
