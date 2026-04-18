import { useMemo, useState } from 'react'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  useDraggable,
  useDroppable,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import { Plus, GripVertical, GitBranch } from 'lucide-react'
import { PageShell } from '@/components/layout/PageShell'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { formatSEK, formatDate } from '@/lib/format'
import { PHASES, type PhaseId } from './constants'
import { useDeals, useUpdateDealPhase } from './queries'
import { DealDialog } from './DealDialog'
import type { Pipeline } from '@/types/database'
import { cn } from '@/lib/cn'

export function PipelinePage() {
  const { data: deals, isLoading } = useDeals()
  const updatePhase = useUpdateDealPhase()

  const [editing, setEditing] = useState<Pipeline | null>(null)
  const [creating, setCreating] = useState<{ phase?: string } | null>(null)
  const [activeDeal, setActiveDeal] = useState<Pipeline | null>(null)

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }))

  const dealsByPhase = useMemo(() => {
    const grouped: Record<string, Pipeline[]> = {}
    for (const p of PHASES) grouped[p.id] = []
    if (deals) {
      for (const d of deals) {
        const phase = grouped[d.phase] ? d.phase : 'prospekt'
        grouped[phase].push(d)
      }
    }
    return grouped
  }, [deals])

  const totalValue = useMemo(
    () => (deals ?? []).reduce((sum, d) => sum + (d.value ?? 0), 0),
    [deals],
  )

  const handleDragStart = (e: DragStartEvent) => {
    const deal = deals?.find((d) => d.id === e.active.id)
    if (deal) setActiveDeal(deal)
  }

  const handleDragEnd = (e: DragEndEvent) => {
    setActiveDeal(null)
    const overId = e.over?.id as PhaseId | undefined
    const dealId = e.active.id as string
    if (!overId) return
    const deal = deals?.find((d) => d.id === dealId)
    if (!deal || deal.phase === overId) return
    updatePhase.mutate({ id: dealId, phase: overId })
  }

  return (
    <PageShell
      title="Pipeline"
      subtitle={
        deals
          ? `${deals.length} deals · ${formatSEK(totalValue)} totalvärde`
          : undefined
      }
      action={
        <Button size="sm" onClick={() => setCreating({})}>
          <Plus size={14} />
          Ny deal
        </Button>
      }
    >
      {isLoading ? (
        <div className="grid grid-cols-5 gap-3 animate-pulse-soft">
          {PHASES.map((p) => (
            <div key={p.id} className="h-96 rounded-[14px] bg-[var(--surface)] border border-[var(--border)]" />
          ))}
        </div>
      ) : deals && deals.length === 0 ? (
        <div className="surface rounded-[14px]">
          <EmptyState
            icon={GitBranch}
            title="Inga deals än"
            description="Lägg till din första deal för att börja bygga pipelinen."
            action={
              <Button onClick={() => setCreating({})}>
                <Plus size={14} />
                Skapa deal
              </Button>
            }
          />
        </div>
      ) : (
        <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
            {PHASES.map((phase) => (
              <Column
                key={phase.id}
                phase={phase}
                deals={dealsByPhase[phase.id] ?? []}
                onAdd={() => setCreating({ phase: phase.id })}
                onEdit={setEditing}
              />
            ))}
          </div>

          <DragOverlay>
            {activeDeal && (
              <div className="rotate-2 opacity-95">
                <DealCard deal={activeDeal} dragging />
              </div>
            )}
          </DragOverlay>
        </DndContext>
      )}

      <DealDialog
        open={!!creating}
        onClose={() => setCreating(null)}
        defaultPhase={creating?.phase}
      />
      <DealDialog open={!!editing} onClose={() => setEditing(null)} initial={editing} />
    </PageShell>
  )
}

interface ColumnProps {
  phase: (typeof PHASES)[number]
  deals: Pipeline[]
  onAdd: () => void
  onEdit: (deal: Pipeline) => void
}

function Column({ phase, deals, onAdd, onEdit }: ColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: phase.id })
  const columnTotal = deals.reduce((sum, d) => sum + (d.value ?? 0), 0)

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'flex flex-col min-h-[400px] rounded-[14px] border bg-[var(--surface)]/70 transition-colors',
        isOver
          ? 'border-[color-mix(in_oklch,var(--accent)_35%,transparent)] bg-[color-mix(in_oklch,var(--accent)_6%,var(--surface))]'
          : 'border-[var(--border)]',
      )}
    >
      {/* Header */}
      <div className="px-3 py-3 border-b border-[var(--border)] flex items-center justify-between">
        <div className="flex items-center gap-2 min-w-0">
          <span
            className="h-2 w-2 rounded-full shrink-0"
            style={{
              background: phase.color,
              boxShadow: `0 0 0 3px color-mix(in oklch, ${phase.color} 18%, transparent)`,
            }}
          />
          <span className="text-[12.5px] font-semibold text-[var(--fg)] uppercase tracking-[0.1em] truncate">
            {phase.label}
          </span>
          <span className="text-num text-[11px] text-[var(--fg-subtle)] ml-1">
            {deals.length}
          </span>
        </div>
        <button
          type="button"
          onClick={onAdd}
          aria-label="Lägg till"
          className="h-6 w-6 rounded-md flex items-center justify-center text-[var(--fg-subtle)] hover:text-[var(--fg)] hover:bg-[var(--surface-2)] transition-colors"
        >
          <Plus size={13} />
        </button>
      </div>

      {/* Total */}
      <div className="px-3 pt-2.5 pb-1.5">
        <div className="text-num text-[12.5px] text-[var(--fg-muted)]">
          {formatSEK(columnTotal)}
        </div>
      </div>

      {/* Cards */}
      <div className="flex-1 p-2 pt-1 space-y-2 overflow-y-auto">
        {deals.map((deal) => (
          <DraggableCard key={deal.id} deal={deal} onEdit={() => onEdit(deal)} />
        ))}
      </div>
    </div>
  )
}

function DraggableCard({ deal, onEdit }: { deal: Pipeline; onEdit: () => void }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: deal.id })
  return (
    <div
      ref={setNodeRef}
      {...attributes}
      className={cn(isDragging && 'opacity-30')}
      onClick={onEdit}
    >
      <DealCard deal={deal} dragHandleProps={listeners} />
    </div>
  )
}

function DealCard({
  deal,
  dragHandleProps,
  dragging,
}: {
  deal: Pipeline
  dragHandleProps?: Record<string, unknown>
  dragging?: boolean
}) {
  return (
    <div
      className={cn(
        'group rounded-[10px] border bg-[var(--surface)] p-3 cursor-pointer hover:border-[var(--border-strong)] transition-all',
        dragging
          ? 'border-[color-mix(in_oklch,var(--accent)_50%,transparent)] shadow-[var(--shadow-lg)]'
          : 'border-[var(--border)]',
      )}
    >
      <div className="flex items-start gap-2">
        <button
          type="button"
          {...dragHandleProps}
          aria-label="Dra"
          onClick={(e) => e.stopPropagation()}
          className="shrink-0 h-5 w-5 rounded flex items-center justify-center text-[var(--fg-subtle)] opacity-0 group-hover:opacity-100 cursor-grab active:cursor-grabbing transition-opacity"
        >
          <GripVertical size={13} />
        </button>
        <div className="flex-1 min-w-0">
          <div className="text-[13.5px] font-medium text-[var(--fg)] truncate">
            {deal.company}
          </div>
          {deal.contact_name && (
            <div className="text-[12px] text-[var(--fg-subtle)] truncate mt-0.5">
              {deal.contact_name}
            </div>
          )}
        </div>
      </div>
      <div className="mt-2.5 flex items-center justify-between text-[12px]">
        <span className="text-num text-[var(--fg)] font-medium">
          {formatSEK(deal.value)}
        </span>
        {deal.deal_date && (
          <span className="text-[var(--fg-subtle)]">{formatDate(deal.deal_date)}</span>
        )}
      </div>
    </div>
  )
}
