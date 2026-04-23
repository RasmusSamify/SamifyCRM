import { useState } from 'react'
import {
  Mail,
  Building2,
  Calendar,
  TrendingUp,
  Pencil,
  Trash2,
  Phone,
  Briefcase,
} from 'lucide-react'
import { Drawer } from '@/components/ui/Drawer'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Progress } from '@/components/ui/Progress'
import { Avatar } from '@/components/ui/Avatar'
import { cn } from '@/lib/cn'
import { formatDate, formatSEK } from '@/lib/format'
import type { Client } from '@/types/database'
import { phaseFor, statusOption } from './constants'
import { useDeleteClient } from './queries'
import { ClientDialog } from './ClientDialog'
import { TechTab } from './TechTab'
import { toast } from '@/stores/toast'

interface ClientDrawerProps {
  client: Client | null
  open: boolean
  onClose: () => void
}

type Tab = 'overview' | 'tech' | 'log' | 'time' | 'profit'

const tabs: { id: Tab; label: string }[] = [
  { id: 'overview', label: 'Översikt' },
  { id: 'tech', label: 'Teknik' },
  { id: 'log', label: 'Logg' },
  { id: 'time', label: 'Tid' },
  { id: 'profit', label: 'Lönsamhet' },
]

export function ClientDrawer({ client, open, onClose }: ClientDrawerProps) {
  const [tab, setTab] = useState<Tab>('overview')
  const [editing, setEditing] = useState(false)
  const del = useDeleteClient()

  if (!client) return null

  const status = statusOption(client.client_status)
  const phase = phaseFor(client.project_health ?? 0)

  const handleDelete = async () => {
    if (!confirm(`Ta bort kunden "${client.name}"? Detta går inte att ångra.`)) return
    try {
      await del.mutateAsync(client.id)
      toast.success('Kund borttagen')
      onClose()
    } catch (err) {
      toast.error('Kunde inte ta bort', err instanceof Error ? err.message : undefined)
    }
  }

  return (
    <>
      <Drawer
        open={open}
        onClose={onClose}
        title={client.name}
        subtitle={client.service ?? undefined}
        width="lg"
        action={
          <>
            <Button size="sm" variant="secondary" onClick={() => setEditing(true)}>
              <Pencil size={13} />
              Redigera
            </Button>
            <Button size="icon-sm" variant="ghost" onClick={handleDelete} aria-label="Ta bort">
              <Trash2 size={14} className="text-[var(--fg-subtle)] hover:text-[var(--color-danger)]" />
            </Button>
          </>
        }
      >
        {/* Hero */}
        <div className="px-6 pt-5 pb-4 border-b border-[var(--border)]">
          <div className="flex items-start gap-4">
            <Avatar name={client.name} size="lg" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant={status.tone}>{status.label}</Badge>
                <Badge variant="default" className="normal-case tracking-normal">
                  <span
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ background: phase.color }}
                  />
                  {phase.label}
                </Badge>
              </div>
              <div className="mt-3 flex items-center gap-5 flex-wrap">
                {client.contact_name && (
                  <IconLine icon={Phone} text={client.contact_name} />
                )}
                {client.email && <IconLine icon={Mail} text={client.email} />}
              </div>
            </div>
          </div>

          {/* KPIs */}
          <div className="mt-5 grid grid-cols-3 gap-3">
            <Kpi
              label="MRR"
              value={formatSEK(client.mrr)}
              icon={TrendingUp}
              accent="brand"
            />
            <Kpi
              label="Kontraktsvärde"
              value={formatSEK(client.contract_value)}
              icon={Briefcase}
              accent="violet"
            />
            <Kpi
              label="Startavgift"
              value={formatSEK(client.setup_fee)}
              icon={Building2}
              accent="neutral"
            />
          </div>

          {/* Project health */}
          <div className="mt-4">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11.5px] font-medium text-[var(--fg-muted)] uppercase tracking-[0.12em]">
                Projekthälsa
              </span>
              <span className="text-num text-[12px] text-[var(--fg)]">
                {client.project_health}%
              </span>
            </div>
            <Progress value={client.project_health} />
          </div>
        </div>

        {/* Tabs */}
        <div className="px-6 flex items-center gap-1 border-b border-[var(--border)]">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                'relative h-11 px-3 text-[13px] font-medium transition-colors',
                tab === t.id
                  ? 'text-[var(--fg)]'
                  : 'text-[var(--fg-muted)] hover:text-[var(--fg)]',
              )}
            >
              {t.label}
              {tab === t.id && (
                <span
                  className="absolute left-3 right-3 bottom-0 h-[2px] rounded-full"
                  style={{ background: 'var(--accent)' }}
                />
              )}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="px-6 py-5 animate-fade-in">
          {tab === 'overview' && <OverviewTab client={client} />}
          {tab === 'tech' && <TechTab client={client} />}
          {tab === 'log' && (
            <PlaceholderTab>
              Aktivitetslogg byggs ut i nästa steg. Här kommer noter, beslut och möten.
            </PlaceholderTab>
          )}
          {tab === 'time' && (
            <PlaceholderTab>
              Tidsregistrering byggs ut — timmar per dag, per projekt, export.
            </PlaceholderTab>
          )}
          {tab === 'profit' && (
            <PlaceholderTab>
              Lönsamhetsanalys — intäkter vs kostnader per kund.
            </PlaceholderTab>
          )}
        </div>
      </Drawer>

      <ClientDialog open={editing} onClose={() => setEditing(false)} initial={client} />
    </>
  )
}

function IconLine({
  icon: Icon,
  text,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>
  text: string
}) {
  return (
    <span className="inline-flex items-center gap-1.5 text-[12.5px] text-[var(--fg-muted)]">
      <Icon size={12} className="text-[var(--fg-subtle)]" />
      {text}
    </span>
  )
}

function Kpi({
  label,
  value,
  icon: Icon,
  accent,
}: {
  label: string
  value: string
  icon: React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>
  accent: 'brand' | 'violet' | 'neutral'
}) {
  const colorClass =
    accent === 'brand'
      ? 'text-[var(--accent)]'
      : accent === 'violet'
        ? 'text-[var(--color-violet)]'
        : 'text-[var(--fg-muted)]'
  return (
    <div className="rounded-[10px] border border-[var(--border)] bg-[var(--surface-2)]/50 p-3">
      <div className="flex items-center gap-1.5 text-[10.5px] font-medium text-[var(--fg-muted)] uppercase tracking-[0.12em]">
        <Icon size={11} strokeWidth={2} className={colorClass} />
        {label}
      </div>
      <div className="mt-1 text-num text-[17px] font-semibold text-[var(--fg)]">
        {value}
      </div>
    </div>
  )
}

function OverviewTab({ client }: { client: Client }) {
  return (
    <div className="space-y-6">
      {client.description && (
        <div>
          <div className="text-[11.5px] font-medium text-[var(--fg-muted)] uppercase tracking-[0.12em] mb-1.5">
            Beskrivning
          </div>
          <p className="text-[13.5px] text-[var(--fg)] leading-relaxed">
            {client.description}
          </p>
        </div>
      )}

      <div>
        <div className="text-[11.5px] font-medium text-[var(--fg-muted)] uppercase tracking-[0.12em] mb-2">
          Kontraktsinformation
        </div>
        <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-[13px]">
          <InfoRow
            icon={Calendar}
            label="Kontraktsstart"
            value={formatDate(client.contract_start)}
          />
          <InfoRow label="Faktureringsmodell" value={client.billing_type ?? '—'} />
          <InfoRow label="Ägare" value={client.owner ?? '—'} />
          <InfoRow label="Skapad" value={formatDate(client.created_at)} />
        </dl>
      </div>
    </div>
  )
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon?: React.ComponentType<{ size?: number; className?: string }>
  label: string
  value: string
}) {
  return (
    <div className="flex items-start gap-2.5">
      {Icon && (
        <Icon size={13} className="text-[var(--fg-subtle)] mt-[3px] shrink-0" />
      )}
      <div className="flex-1 min-w-0">
        <dt className="text-[11px] text-[var(--fg-subtle)]">{label}</dt>
        <dd className="text-[13px] text-[var(--fg)] mt-0.5 capitalize truncate">{value}</dd>
      </div>
    </div>
  )
}

function PlaceholderTab({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-center py-10 text-[13px] text-[var(--fg-muted)]">
      <p>{children}</p>
    </div>
  )
}
