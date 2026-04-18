import { useMemo, useState } from 'react'
import { Plus, BellRing, Check } from 'lucide-react'
import { PageShell } from '@/components/layout/PageShell'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import { cn } from '@/lib/cn'
import { formatDate, formatRelativeDays } from '@/lib/format'
import { useReminders, useToggleReminder } from './queries'
import { ReminderDialog } from './ReminderDialog'
import type { Reminder } from '@/types/database'

type Bucket = 'overdue' | 'today' | 'soon' | 'later' | 'done'

function bucketFor(r: Reminder): Bucket {
  if (r.done) return 'done'
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const due = new Date(r.due_date)
  due.setHours(0, 0, 0, 0)
  const diff = Math.round((due.getTime() - today.getTime()) / 86_400_000)
  if (diff < 0) return 'overdue'
  if (diff === 0) return 'today'
  if (diff <= 7) return 'soon'
  return 'later'
}

const bucketMeta: Record<
  Bucket,
  { title: string; accent: string; description?: string }
> = {
  overdue: { title: 'Försenade', accent: 'var(--color-danger)', description: 'Åtgärda nu' },
  today: { title: 'Idag', accent: 'var(--accent)' },
  soon: { title: 'Nära (7 dagar)', accent: 'var(--color-warning)' },
  later: { title: 'Senare', accent: 'var(--color-violet)' },
  done: { title: 'Klara', accent: 'var(--color-success)' },
}

export function RemindersPage() {
  const { data: reminders, isLoading } = useReminders()
  const toggle = useToggleReminder()
  const [editing, setEditing] = useState<Reminder | null>(null)
  const [creating, setCreating] = useState(false)

  const grouped = useMemo(() => {
    const buckets: Record<Bucket, Reminder[]> = {
      overdue: [],
      today: [],
      soon: [],
      later: [],
      done: [],
    }
    for (const r of reminders ?? []) buckets[bucketFor(r)].push(r)
    return buckets
  }, [reminders])

  const openCount = (reminders ?? []).filter((r) => !r.done).length

  return (
    <PageShell
      title="Påminnelser"
      subtitle={reminders ? `${openCount} öppna av ${reminders.length}` : undefined}
      action={
        <Button size="sm" onClick={() => setCreating(true)}>
          <Plus size={14} />
          Ny påminnelse
        </Button>
      }
    >
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-24 rounded-[14px] bg-[var(--surface)] border border-[var(--border)] animate-pulse-soft"
            />
          ))}
        </div>
      ) : reminders && reminders.length === 0 ? (
        <Card>
          <EmptyState
            icon={BellRing}
            title="Inga påminnelser"
            description="Lägg till din första påminnelse för att hålla koll på deadlines."
            action={
              <Button onClick={() => setCreating(true)}>
                <Plus size={14} />
                Skapa
              </Button>
            }
          />
        </Card>
      ) : (
        <div className="space-y-6">
          {(['overdue', 'today', 'soon', 'later', 'done'] as Bucket[]).map((key) => {
            const items = grouped[key]
            if (items.length === 0) return null
            const meta = bucketMeta[key]
            return (
              <section key={key}>
                <div className="flex items-center gap-2 mb-2 px-1">
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{
                      background: meta.accent,
                      boxShadow: `0 0 0 3px color-mix(in oklch, ${meta.accent} 18%, transparent)`,
                    }}
                  />
                  <h3 className="text-[12.5px] font-semibold text-[var(--fg)] uppercase tracking-[0.1em]">
                    {meta.title}
                  </h3>
                  <span className="text-num text-[11.5px] text-[var(--fg-subtle)]">
                    {items.length}
                  </span>
                  {meta.description && (
                    <span className="text-[11.5px] text-[var(--fg-subtle)] ml-1">
                      · {meta.description}
                    </span>
                  )}
                </div>

                <div className="rounded-[14px] border border-[var(--border)] bg-[var(--surface)] divide-y divide-[var(--border)]">
                  {items.map((r) => (
                    <div
                      key={r.id}
                      onClick={() => setEditing(r)}
                      className={cn(
                        'group flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors hover:bg-[var(--surface-2)]/50',
                        r.done && 'opacity-60',
                      )}
                    >
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          toggle.mutate({ id: r.id, done: !r.done })
                        }}
                        aria-label={r.done ? 'Markera som ej klar' : 'Markera som klar'}
                        className={cn(
                          'shrink-0 h-5 w-5 rounded-md border flex items-center justify-center transition-all',
                          r.done
                            ? 'bg-[var(--color-success)] border-[var(--color-success)]'
                            : 'border-[var(--border-strong)] hover:border-[var(--accent)]',
                        )}
                      >
                        {r.done && <Check size={12} className="text-[var(--fg-inverse)]" />}
                      </button>
                      <div className="flex-1 min-w-0">
                        <div
                          className={cn(
                            'text-[14px] text-[var(--fg)] font-medium truncate',
                            r.done && 'line-through',
                          )}
                        >
                          {r.title}
                        </div>
                        {(r.client_name || r.deal_company) && (
                          <div className="text-[12px] text-[var(--fg-subtle)] mt-0.5 truncate">
                            {r.client_name ?? r.deal_company}
                          </div>
                        )}
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-[12.5px] text-[var(--fg-muted)]">
                          {formatDate(r.due_date)}
                        </div>
                        <div className="text-[11px] text-[var(--fg-subtle)]">
                          {formatRelativeDays(r.due_date)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )
          })}
        </div>
      )}

      <ReminderDialog open={creating} onClose={() => setCreating(false)} />
      <ReminderDialog open={!!editing} onClose={() => setEditing(null)} initial={editing} />
    </PageShell>
  )
}
