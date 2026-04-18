import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { TrendingUp, Users, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { PageShell } from '@/components/layout/PageShell'
import { StatCard } from '@/components/ui/StatCard'
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import { formatSEK } from '@/lib/format'
import { supabase } from '@/lib/supabase'
import type { MrrHistory } from '@/types/database'
import { cn } from '@/lib/cn'

function useMrrHistory() {
  return useQuery({
    queryKey: ['mrr_history', 'list'],
    queryFn: async (): Promise<MrrHistory[]> => {
      const { data, error } = await supabase
        .from('mrr_history')
        .select('*')
        .order('month', { ascending: true })
      if (error) throw error
      return data ?? []
    },
  })
}

export function MrrPage() {
  const { data: history, isLoading } = useMrrHistory()

  const { chartData, current, prev, delta, peak } = useMemo(() => {
    const rows = history ?? []
    const chartData = rows.map((r) => ({
      month: r.month,
      mrr: r.mrr,
      clients: r.client_count ?? 0,
      label: formatMonth(r.month),
    }))
    const current = rows.at(-1)
    const prev = rows.length >= 2 ? rows.at(-2) : null
    const delta = current && prev ? ((current.mrr - prev.mrr) / (prev.mrr || 1)) * 100 : 0
    const peak = rows.reduce<MrrHistory | null>(
      (acc, r) => (!acc || r.mrr > acc.mrr ? r : acc),
      null,
    )
    return { chartData, current, prev, delta, peak }
  }, [history])

  return (
    <PageShell title="MRR-historik" subtitle="Återkommande intäkter över tid">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-5">
        <StatCard
          label="Aktuell MRR"
          value={formatSEK(current?.mrr)}
          delta={
            current && prev
              ? { value: `${delta >= 0 ? '+' : ''}${delta.toFixed(1)}%`, positive: delta >= 0 }
              : undefined
          }
          icon={TrendingUp}
          accent="brand"
          hint={current ? `${current.client_count ?? 0} aktiva kunder` : undefined}
        />
        <StatCard
          label="Peak"
          value={formatSEK(peak?.mrr)}
          icon={TrendingUp}
          accent="violet"
          hint={peak ? formatMonth(peak.month) : undefined}
        />
        <StatCard
          label="Mätpunkter"
          value={String(history?.length ?? 0)}
          icon={Users}
          accent="neutral"
        />
      </div>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>MRR över tid</CardTitle>
            <p className="text-[13px] text-[var(--fg-subtle)] mt-1 normal-case tracking-normal">
              Månatlig återkommande intäkt
            </p>
          </div>
          {current && prev && (
            <span
              className={cn(
                'inline-flex items-center gap-0.5 text-[12px] font-medium tabular-nums',
                delta >= 0 ? 'text-[var(--color-success)]' : 'text-[var(--color-danger)]',
              )}
            >
              {delta >= 0 ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
              {Math.abs(delta).toFixed(1)}% mot föregående
            </span>
          )}
        </CardHeader>
        <CardBody className="pt-2 pb-5">
          {isLoading ? (
            <div className="h-[320px] rounded-[10px] bg-[var(--surface-2)] animate-pulse-soft" />
          ) : chartData.length === 0 ? (
            <EmptyState
              icon={TrendingUp}
              title="Ingen historik ännu"
              description="Datapunkter för MRR över tid kommer visas här när de registreras."
            />
          ) : (
            <div className="h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 6, right: 8, left: -16, bottom: 0 }}>
                  <defs>
                    <linearGradient id="mrr-fill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="oklch(0.72 0.18 62)" stopOpacity={0.45} />
                      <stop offset="100%" stopColor="oklch(0.72 0.18 62)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="2 4"
                    stroke="var(--border)"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="label"
                    stroke="var(--fg-subtle)"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="var(--fg-subtle)"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    cursor={{ stroke: 'var(--border-strong)', strokeWidth: 1 }}
                    contentStyle={{
                      background: 'var(--surface)',
                      border: '1px solid var(--border-strong)',
                      borderRadius: 10,
                      boxShadow: 'var(--shadow-md)',
                      fontSize: 12.5,
                    }}
                    formatter={(value, name) => [
                      name === 'mrr' ? formatSEK(Number(value)) : String(value),
                      name === 'mrr' ? 'MRR' : 'Kunder',
                    ]}
                  />
                  <Area
                    type="monotone"
                    dataKey="mrr"
                    stroke="oklch(0.72 0.18 62)"
                    strokeWidth={2}
                    fill="url(#mrr-fill)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardBody>
      </Card>
    </PageShell>
  )
}

function formatMonth(month: string) {
  const [year, m] = month.split('-')
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Maj', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dec']
  const idx = Number(m) - 1
  const yearShort = year?.slice(2)
  return `${monthNames[idx] ?? m} ${yearShort ?? ''}`
}
