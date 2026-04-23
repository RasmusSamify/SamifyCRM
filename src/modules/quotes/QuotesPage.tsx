import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Plus, PenLine, Search, ExternalLink } from 'lucide-react'
import { PageShell } from '@/components/layout/PageShell'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { DataTable, type Column } from '@/components/ui/DataTable'
import { EmptyState } from '@/components/ui/EmptyState'
import { cn } from '@/lib/cn'
import { formatDate, formatSEK } from '@/lib/format'
import { useQuotes } from './queries'
import { QuoteDialog } from './QuoteDialog'
import { QuoteDetailPanel } from './QuoteDetailPanel'
import type { Quote } from '@/types/database'

const statusMeta: Record<
  string,
  { label: string; tone: 'default' | 'success' | 'warning' | 'danger' | 'violet' }
> = {
  draft: { label: 'Utkast', tone: 'default' },
  sent: { label: 'Skickad', tone: 'violet' },
  accepted: { label: 'Accepterad', tone: 'success' },
  declined: { label: 'Avböjd', tone: 'danger' },
}

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

export function QuotesPage() {
  const { data: quotes, isLoading } = useQuotes()
  const [search, setSearch] = useState('')
  const [creating, setCreating] = useState(false)
  const [searchParams, setSearchParams] = useSearchParams()
  const isLarge = useIsLargeViewport()

  const quoteIdParam = searchParams.get('quote')
  const selected = useMemo(
    () =>
      quoteIdParam ? quotes?.find((q) => q.id === quoteIdParam) ?? null : null,
    [quotes, quoteIdParam],
  )

  const selectQuote = (quote: Quote | null) => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev)
        if (quote) next.set('quote', quote.id)
        else next.delete('quote')
        return next
      },
      { replace: true },
    )
  }

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return (quotes ?? []).filter(
      (x) =>
        !q ||
        x.client_name.toLowerCase().includes(q) ||
        (x.contact_name ?? '').toLowerCase().includes(q),
    )
  }, [quotes, search])

  const splitMode = isLarge && !!selected

  const allColumns: Column<Quote>[] = [
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

  /* When panel is open, drop the wider columns to keep the list readable */
  const columns = splitMode
    ? allColumns.filter(
        (c) => c.key === 'client' || c.key === 'status' || c.key === 'total',
      )
    : allColumns

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
      <div
        className={cn(
          'gap-5',
          splitMode
            ? 'grid grid-cols-[minmax(0,1fr)_minmax(460px,620px)] items-start'
            : 'block',
        )}
      >
        {/* List column */}
        <div className="min-w-0">
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
            onRowClick={(q) => selectQuote(q.id === selected?.id ? null : q)}
            activeRow={(q) => q.id === selected?.id}
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
        </div>

        {/* Inline detail panel (lg+ only) */}
        {splitMode && selected && (
          <QuoteDetailPanel quote={selected} onClose={() => selectQuote(null)} />
        )}
      </div>

      {/* Creation dialog — always modal */}
      <QuoteDialog open={creating} onClose={() => setCreating(false)} />

      {/* Narrow-screen edit fallback (uses modal) */}
      {!isLarge && (
        <QuoteDialog
          open={!!selected}
          onClose={() => selectQuote(null)}
          initial={selected}
        />
      )}
    </PageShell>
  )
}
