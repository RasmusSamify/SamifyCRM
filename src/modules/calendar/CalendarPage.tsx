import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  BellRing,
  FileSignature,
} from 'lucide-react'
import { PageShell } from '@/components/layout/PageShell'
import { Button } from '@/components/ui/Button'
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import { cn } from '@/lib/cn'
import { formatDate } from '@/lib/format'
import { supabase } from '@/lib/supabase'
import type { Reminder, ScriveDocument } from '@/types/database'

interface CalendarEvent {
  id: string
  date: string
  title: string
  type: 'reminder' | 'scrive'
  color: string
}

function useCalendarEvents() {
  return useQuery({
    queryKey: ['calendar', 'events'],
    queryFn: async (): Promise<CalendarEvent[]> => {
      const [reminders, scrive] = await Promise.all([
        supabase.from('reminders').select('*'),
        supabase.from('scrive_documents').select('*'),
      ])
      if (reminders.error) throw reminders.error
      if (scrive.error) throw scrive.error
      const events: CalendarEvent[] = []
      for (const r of (reminders.data ?? []) as Reminder[]) {
        events.push({
          id: `r-${r.id}`,
          date: r.due_date,
          title: r.title,
          type: 'reminder',
          color: r.done ? 'var(--color-success)' : 'var(--color-warning)',
        })
      }
      for (const s of (scrive.data ?? []) as ScriveDocument[]) {
        if (s.signed_at) {
          events.push({
            id: `s-${s.id}`,
            date: s.signed_at.slice(0, 10),
            title: s.title,
            type: 'scrive',
            color: 'var(--color-violet)',
          })
        }
      }
      return events
    },
  })
}

const WEEKDAYS = ['Mån', 'Tis', 'Ons', 'Tors', 'Fre', 'Lör', 'Sön']
const MONTHS = [
  'Januari', 'Februari', 'Mars', 'April', 'Maj', 'Juni',
  'Juli', 'Augusti', 'September', 'Oktober', 'November', 'December',
]

function iso(date: Date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function CalendarPage() {
  const today = new Date()
  const [cursor, setCursor] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1))
  const [selectedDate, setSelectedDate] = useState<string>(iso(today))

  const { data: events } = useCalendarEvents()

  const grid = useMemo(() => {
    const first = new Date(cursor.getFullYear(), cursor.getMonth(), 1)
    const firstDay = first.getDay() === 0 ? 6 : first.getDay() - 1
    const start = new Date(first)
    start.setDate(first.getDate() - firstDay)
    const days: { date: Date; inMonth: boolean }[] = []
    for (let i = 0; i < 42; i++) {
      const d = new Date(start)
      d.setDate(start.getDate() + i)
      days.push({ date: d, inMonth: d.getMonth() === cursor.getMonth() })
    }
    return days
  }, [cursor])

  const eventsByDate = useMemo(() => {
    const map: Record<string, CalendarEvent[]> = {}
    for (const e of events ?? []) {
      ;(map[e.date] ??= []).push(e)
    }
    return map
  }, [events])

  const todayISO = iso(today)
  const selectedEvents = eventsByDate[selectedDate] ?? []

  return (
    <PageShell
      title="Kalender"
      subtitle="Möten, deadlines och signerade avtal"
      action={
        <div className="flex items-center gap-1">
          <Button
            size="icon-sm"
            variant="ghost"
            onClick={() =>
              setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))
            }
            aria-label="Föregående månad"
          >
            <ChevronLeft size={15} />
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => {
              setCursor(new Date(today.getFullYear(), today.getMonth(), 1))
              setSelectedDate(todayISO)
            }}
          >
            Idag
          </Button>
          <Button
            size="icon-sm"
            variant="ghost"
            onClick={() =>
              setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))
            }
            aria-label="Nästa månad"
          >
            <ChevronRight size={15} />
          </Button>
        </div>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-5">
        {/* Grid */}
        <Card>
          <CardHeader>
            <div>
              <CardTitle>
                {MONTHS[cursor.getMonth()]} {cursor.getFullYear()}
              </CardTitle>
            </div>
          </CardHeader>
          <CardBody className="pt-1 pb-5">
            <div className="grid grid-cols-7 mb-2">
              {WEEKDAYS.map((w) => (
                <div
                  key={w}
                  className="text-[11px] font-semibold text-[var(--fg-subtle)] uppercase tracking-[0.1em] text-center"
                >
                  {w}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-px bg-[var(--border)] rounded-[10px] overflow-hidden">
              {grid.map((cell) => {
                const dateISO = iso(cell.date)
                const isToday = dateISO === todayISO
                const isSelected = dateISO === selectedDate
                const cellEvents = eventsByDate[dateISO] ?? []
                return (
                  <button
                    key={dateISO}
                    type="button"
                    onClick={() => setSelectedDate(dateISO)}
                    className={cn(
                      'min-h-[92px] p-2 text-left bg-[var(--surface)] hover:bg-[var(--surface-2)] transition-colors relative',
                      !cell.inMonth && 'opacity-35',
                      isSelected && 'ring-1 ring-inset ring-[var(--accent)]',
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={cn(
                          'text-num text-[12px]',
                          isToday
                            ? 'inline-flex h-5 w-5 items-center justify-center rounded-full bg-[var(--accent)] text-[var(--accent-fg)] font-semibold'
                            : 'text-[var(--fg-muted)]',
                        )}
                      >
                        {cell.date.getDate()}
                      </span>
                      {cellEvents.length > 0 && !isToday && (
                        <span className="text-num text-[10px] text-[var(--fg-subtle)]">
                          {cellEvents.length}
                        </span>
                      )}
                    </div>
                    <div className="mt-1.5 space-y-0.5">
                      {cellEvents.slice(0, 3).map((e) => (
                        <div
                          key={e.id}
                          className="flex items-center gap-1 min-w-0"
                          title={e.title}
                        >
                          <span
                            className="h-1.5 w-1.5 rounded-full shrink-0"
                            style={{ background: e.color }}
                          />
                          <span className="text-[11px] text-[var(--fg)] truncate">
                            {e.title}
                          </span>
                        </div>
                      ))}
                      {cellEvents.length > 3 && (
                        <div className="text-[10.5px] text-[var(--fg-subtle)] pl-2.5">
                          +{cellEvents.length - 3} till
                        </div>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          </CardBody>
        </Card>

        {/* Detail panel */}
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Vald dag</CardTitle>
              <p className="text-[13px] text-[var(--fg)] mt-1 normal-case tracking-normal font-medium">
                {formatDate(selectedDate)}
              </p>
            </div>
          </CardHeader>
          <CardBody className="pt-0">
            {selectedEvents.length === 0 ? (
              <EmptyState
                icon={CalendarDays}
                title="Inga händelser"
                description="Inga påminnelser eller signerade avtal den här dagen."
              />
            ) : (
              <div className="space-y-2">
                {selectedEvents.map((e) => {
                  const Icon = e.type === 'reminder' ? BellRing : FileSignature
                  return (
                    <div
                      key={e.id}
                      className="flex items-start gap-3 rounded-[10px] border border-[var(--border)] bg-[var(--surface-2)]/40 px-3 py-2.5"
                    >
                      <div
                        className="h-7 w-7 rounded-md flex items-center justify-center border shrink-0"
                        style={{
                          background: `color-mix(in oklch, ${e.color} 10%, transparent)`,
                          borderColor: `color-mix(in oklch, ${e.color} 25%, transparent)`,
                          color: e.color,
                        }}
                      >
                        <Icon size={13} strokeWidth={2} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[13.5px] font-medium text-[var(--fg)]">
                          {e.title}
                        </div>
                        <div className="text-[11.5px] text-[var(--fg-subtle)] uppercase tracking-wider mt-0.5">
                          {e.type === 'reminder' ? 'Påminnelse' : 'Scrive-signering'}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardBody>
        </Card>
      </div>
    </PageShell>
  )
}
