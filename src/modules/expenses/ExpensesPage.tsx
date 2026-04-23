import { useMemo, useState } from 'react'
import { Plus, Wallet, Search, TrendingUp, Sparkles } from 'lucide-react'
import { PageShell } from '@/components/layout/PageShell'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Badge } from '@/components/ui/Badge'
import { DataTable, type Column } from '@/components/ui/DataTable'
import { EmptyState } from '@/components/ui/EmptyState'
import { StatCard } from '@/components/ui/StatCard'
import { formatDate, formatSEK } from '@/lib/format'
import { useExpenses } from './queries'
import { ExpenseDialog } from './ExpenseDialog'
import { ParseInvoiceDialog } from './ParseInvoiceDialog'
import type { ExtractedInvoice } from './parseQueries'
import type { Expense } from '@/types/database'

function monthlyEquivalent(e: Expense) {
  if (e.expense_type !== 'recurring') return 0
  switch (e.billing_cycle) {
    case 'yearly':
      return (e.amount_sek ?? 0) / 12
    case 'quarterly':
      return (e.amount_sek ?? 0) / 3
    default:
      return e.amount_sek ?? 0
  }
}

export function ExpensesPage() {
  const { data: expenses, isLoading } = useExpenses()
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [editing, setEditing] = useState<Expense | null>(null)
  const [creating, setCreating] = useState(false)
  const [parsing, setParsing] = useState(false)
  const [prefill, setPrefill] = useState<ExtractedInvoice | null>(null)

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return (expenses ?? []).filter((e) => {
      if (typeFilter !== 'all' && e.expense_type !== typeFilter) return false
      if (!q) return true
      return (
        e.name.toLowerCase().includes(q) ||
        e.category.toLowerCase().includes(q) ||
        (e.note ?? '').toLowerCase().includes(q)
      )
    })
  }, [expenses, search, typeFilter])

  const stats = useMemo(() => {
    const active = (expenses ?? []).filter((e) => e.status !== 'archived')
    const monthlyTotal = active.reduce((sum, e) => sum + monthlyEquivalent(e), 0)
    const recurringCount = active.filter((e) => e.expense_type === 'recurring').length
    const onetimeSum = active
      .filter((e) => e.expense_type === 'onetime')
      .reduce((sum, e) => sum + (e.amount_sek ?? 0), 0)
    return { monthlyTotal, recurringCount, onetimeSum, yearTotal: monthlyTotal * 12 }
  }, [expenses])

  const columns: Column<Expense>[] = [
    {
      key: 'name',
      header: 'Namn',
      render: (e) => (
        <div className="min-w-0">
          <div className="font-medium text-[var(--fg)] truncate">{e.name}</div>
          {e.note && (
            <div className="text-[11.5px] text-[var(--fg-subtle)] truncate">{e.note}</div>
          )}
        </div>
      ),
    },
    {
      key: 'category',
      header: 'Kategori',
      render: (e) => <Badge variant="default">{e.category}</Badge>,
    },
    {
      key: 'type',
      header: 'Typ',
      render: (e) => (
        <span className="text-[var(--fg-muted)] text-[12.5px]">
          {e.expense_type === 'recurring'
            ? `Återkommande · ${cycleLabel(e.billing_cycle)}`
            : 'Engångs'}
        </span>
      ),
    },
    {
      key: 'next',
      header: 'Nästa / Månad',
      render: (e) => (
        <span className="text-[var(--fg-muted)]">
          {e.expense_type === 'recurring'
            ? formatDate(e.next_date)
            : formatDate(
                e.expense_month ? `${e.expense_month}-01` : e.created_at,
              )}
        </span>
      ),
    },
    {
      key: 'amount',
      header: 'Belopp',
      align: 'right',
      render: (e) => (
        <div className="text-right">
          <div className="text-num text-[var(--fg)] font-medium">
            {formatSEK(e.amount_sek)}
          </div>
          {e.currency && e.currency !== 'SEK' && e.amount_original != null && (
            <div className="text-[11px] text-[var(--fg-subtle)] text-num">
              {e.amount_original.toLocaleString('sv-SE')} {e.currency}
            </div>
          )}
        </div>
      ),
    },
  ]

  return (
    <PageShell
      title="Kostnader & Abonnemang"
      subtitle={expenses ? `${expenses.length} poster` : undefined}
      action={
        <div className="flex items-center gap-2">
          <Button size="sm" variant="secondary" onClick={() => setParsing(true)}>
            <Sparkles size={14} />
            Parsa faktura
          </Button>
          <Button size="sm" onClick={() => setCreating(true)}>
            <Plus size={14} />
            Ny kostnad
          </Button>
        </div>
      }
    >
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 mb-5">
        <StatCard
          label="Per månad"
          value={formatSEK(stats.monthlyTotal)}
          icon={Wallet}
          accent="brand"
          hint={`${stats.recurringCount} återkommande`}
        />
        <StatCard
          label="Per år"
          value={formatSEK(stats.yearTotal)}
          icon={TrendingUp}
          accent="violet"
        />
        <StatCard
          label="Engångsutgifter"
          value={formatSEK(stats.onetimeSum)}
          icon={Wallet}
          accent="neutral"
        />
      </div>

      <div className="flex items-center gap-2 mb-4">
        <div className="relative flex-1 max-w-md">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--fg-subtle)] pointer-events-none"
          />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Sök namn, kategori…"
            className="pl-9"
          />
        </div>
        <div className="w-[180px]">
          <Select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
            <option value="all">Alla typer</option>
            <option value="recurring">Återkommande</option>
            <option value="onetime">Engångs</option>
          </Select>
        </div>
      </div>

      <DataTable
        columns={columns}
        rows={filtered}
        rowKey={(e) => e.id}
        onRowClick={setEditing}
        loading={isLoading}
        empty={
          <EmptyState
            icon={Wallet}
            title={expenses?.length ? 'Inga träffar' : 'Inga kostnader än'}
            description={
              expenses?.length
                ? 'Prova en annan sökning eller annat filter.'
                : 'Lägg till din första kostnad eller abonnemang.'
            }
          />
        }
      />

      <ExpenseDialog
        open={creating}
        onClose={() => {
          setCreating(false)
          setPrefill(null)
        }}
        prefill={prefill}
      />
      <ExpenseDialog open={!!editing} onClose={() => setEditing(null)} initial={editing} />
      <ParseInvoiceDialog
        open={parsing}
        onClose={() => setParsing(false)}
        onExtracted={(extracted) => {
          setPrefill(extracted)
          setCreating(true)
        }}
      />
    </PageShell>
  )
}

function cycleLabel(c: string | null | undefined) {
  if (c === 'yearly') return 'årlig'
  if (c === 'quarterly') return 'kvartal'
  return 'månad'
}
