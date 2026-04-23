import { useMemo, useState } from 'react'
import {
  MessageSquare,
  Users,
  Phone,
  Mail,
  CheckSquare,
  Send,
  Loader2,
  Trash2,
  MessageCircle,
  type LucideIcon,
} from 'lucide-react'
import { formatDistanceToNowStrict, isToday, isYesterday, format } from 'date-fns'
import { sv } from 'date-fns/locale'
import { cn } from '@/lib/cn'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/hooks/useAuth'
import { toast } from '@/stores/toast'
import type { ActivityLog, Client } from '@/types/database'
import {
  useActivity,
  useCreateActivity,
  useDeleteActivity,
} from './activityQueries'

type ActivityType = 'note' | 'meeting' | 'call' | 'email' | 'decision'

interface TypeMeta {
  id: ActivityType
  label: string
  icon: LucideIcon
  color: string
}

const TYPES: TypeMeta[] = [
  { id: 'note', label: 'Notering', icon: MessageSquare, color: 'var(--fg-muted)' },
  { id: 'meeting', label: 'Möte', icon: Users, color: 'var(--color-info)' },
  { id: 'call', label: 'Samtal', icon: Phone, color: 'var(--color-success)' },
  { id: 'email', label: 'Mail', icon: Mail, color: 'var(--accent)' },
  { id: 'decision', label: 'Beslut', icon: CheckSquare, color: 'var(--color-violet)' },
]

const TYPE_BY_ID: Record<string, TypeMeta> = Object.fromEntries(
  TYPES.map((t) => [t.id, t]),
)

export function LogTab({ client }: { client: Client }) {
  const { data: entries, isLoading } = useActivity(client.id)

  return (
    <div className="space-y-5">
      <Composer client={client} />
      <Feed entries={entries} loading={isLoading} clientId={client.id} />
    </div>
  )
}

function Composer({ client }: { client: Client }) {
  const { user } = useAuth()
  const [content, setContent] = useState('')
  const [type, setType] = useState<ActivityType>('note')
  const create = useCreateActivity()

  const canSubmit = content.trim().length > 0 && !create.isPending

  const submit = async (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!canSubmit) return
    try {
      await create.mutateAsync({
        clientId: client.id,
        clientName: client.name,
        content: content.trim(),
        type,
        owner: user?.email ?? null,
      })
      setContent('')
    } catch (err) {
      toast.error('Kunde inte spara', err instanceof Error ? err.message : undefined)
    }
  }

  return (
    <form
      onSubmit={submit}
      className="rounded-[12px] border border-[var(--border)] bg-[var(--surface-2)]/40 focus-within:border-[var(--border-strong)] transition-colors"
    >
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) submit()
        }}
        placeholder="Vad hände? Skriv en notering, möte, samtal…"
        rows={3}
        className="block w-full resize-none bg-transparent px-4 pt-3 pb-2 text-[13.5px] text-[var(--fg)] placeholder:text-[var(--fg-subtle)] outline-none"
      />
      <div className="flex items-center justify-between gap-2 px-2.5 pb-2.5 pt-1 border-t border-[var(--border)]">
        <div className="flex items-center gap-1 flex-wrap">
          {TYPES.map((t) => {
            const Icon = t.icon
            const active = t.id === type
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setType(t.id)}
                className={cn(
                  'inline-flex items-center gap-1.5 h-7 px-2 rounded-[6px] text-[11.5px] font-medium transition-colors',
                  active
                    ? 'text-[var(--fg)]'
                    : 'text-[var(--fg-muted)] hover:text-[var(--fg)] hover:bg-[var(--surface-2)]',
                )}
                style={
                  active
                    ? {
                        background: `color-mix(in oklch, ${t.color} 12%, transparent)`,
                        boxShadow: `inset 0 0 0 1px color-mix(in oklch, ${t.color} 30%, transparent)`,
                      }
                    : undefined
                }
              >
                <Icon size={12} style={active ? { color: t.color } : undefined} />
                {t.label}
              </button>
            )
          })}
        </div>
        <Button type="submit" size="sm" disabled={!canSubmit}>
          {create.isPending ? (
            <Loader2 size={13} className="animate-spin" />
          ) : (
            <Send size={13} />
          )}
          Lägg till
        </Button>
      </div>
    </form>
  )
}

function Feed({
  entries,
  loading,
  clientId,
}: {
  entries: ActivityLog[] | undefined
  loading: boolean
  clientId: string
}) {
  const groups = useMemo(() => groupByDay(entries ?? []), [entries])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-10">
        <Loader2 size={18} className="animate-spin text-[var(--fg-subtle)]" />
      </div>
    )
  }

  if (!entries || entries.length === 0) {
    return (
      <div className="rounded-[12px] border border-dashed border-[var(--border)] bg-[var(--surface-2)]/30 px-5 py-10 text-center">
        <div className="inline-flex h-10 w-10 rounded-full items-center justify-center border border-[var(--border)] bg-[var(--surface)] mb-3">
          <MessageCircle size={16} className="text-[var(--fg-subtle)]" />
        </div>
        <p className="text-[13px] text-[var(--fg-muted)]">
          Inget loggat än. Första noteringen sätter tonen.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {groups.map((g) => (
        <section key={g.key}>
          <h3 className="sticky top-0 z-[1] bg-[var(--surface)] py-1 text-[10.5px] font-semibold text-[var(--fg-subtle)] uppercase tracking-[0.14em]">
            {g.label}
          </h3>
          <ul className="relative mt-1.5 space-y-2 pl-5 before:absolute before:left-[7px] before:top-2 before:bottom-2 before:w-px before:bg-[var(--border)]">
            {g.items.map((entry) => (
              <Entry key={entry.id} entry={entry} clientId={clientId} />
            ))}
          </ul>
        </section>
      ))}
    </div>
  )
}

function Entry({ entry, clientId }: { entry: ActivityLog; clientId: string }) {
  const meta = TYPE_BY_ID[entry.type] ?? TYPE_BY_ID.note
  const Icon = meta.icon
  const del = useDeleteActivity()

  const handleDelete = async () => {
    if (!confirm('Ta bort denna notering?')) return
    try {
      await del.mutateAsync({ id: entry.id, clientId })
    } catch (err) {
      toast.error('Kunde inte ta bort', err instanceof Error ? err.message : undefined)
    }
  }

  return (
    <li className="relative group">
      <span
        className="absolute -left-[18px] top-[9px] h-3.5 w-3.5 rounded-full border flex items-center justify-center bg-[var(--surface)]"
        style={{
          borderColor: `color-mix(in oklch, ${meta.color} 40%, transparent)`,
        }}
      >
        <Icon size={8} strokeWidth={2.5} style={{ color: meta.color }} />
      </span>
      <div className="rounded-[10px] border border-[var(--border)] bg-[var(--surface-2)]/40 px-3.5 py-2.5 hover:border-[var(--border-strong)] transition-colors">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-1.5 flex-wrap text-[11.5px] text-[var(--fg-muted)]">
            <span className="font-medium" style={{ color: meta.color }}>
              {meta.label}
            </span>
            {entry.owner && (
              <>
                <span className="text-[var(--fg-subtle)]">·</span>
                <span>{entry.owner}</span>
              </>
            )}
            <span className="text-[var(--fg-subtle)]">·</span>
            <span title={entry.created_at ?? undefined}>{relativeTime(entry.created_at)}</span>
          </div>
          <button
            type="button"
            onClick={handleDelete}
            aria-label="Ta bort"
            className="opacity-0 group-hover:opacity-100 h-6 w-6 rounded-md flex items-center justify-center text-[var(--fg-subtle)] hover:text-[var(--color-danger)] hover:bg-[var(--surface-2)] transition-all shrink-0"
          >
            <Trash2 size={11} />
          </button>
        </div>
        <p className="mt-1 text-[13.5px] text-[var(--fg)] leading-[1.5] whitespace-pre-wrap break-words">
          {entry.content}
        </p>
      </div>
    </li>
  )
}

/* ============================================================
   Helpers
   ============================================================ */

interface Group {
  key: string
  label: string
  items: ActivityLog[]
}

function groupByDay(entries: ActivityLog[]): Group[] {
  const map = new Map<string, Group>()
  for (const e of entries) {
    const d = e.created_at ? new Date(e.created_at) : new Date()
    const key = format(d, 'yyyy-MM-dd')
    if (!map.has(key)) {
      map.set(key, { key, label: dayLabel(d), items: [] })
    }
    map.get(key)!.items.push(e)
  }
  return Array.from(map.values())
}

function dayLabel(d: Date): string {
  if (isToday(d)) return 'Idag'
  if (isYesterday(d)) return 'Igår'
  return format(d, 'd MMMM yyyy', { locale: sv })
}

function relativeTime(iso: string | null): string {
  if (!iso) return ''
  try {
    return formatDistanceToNowStrict(new Date(iso), { addSuffix: true, locale: sv })
  } catch {
    return ''
  }
}
