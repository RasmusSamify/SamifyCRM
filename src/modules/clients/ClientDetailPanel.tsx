import { useState } from 'react'
import { Pencil, Trash2, X } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import type { Client } from '@/types/database'
import { useDeleteClient } from './queries'
import { ClientDialog } from './ClientDialog'
import { ClientDetailBody } from './ClientDetailBody'
import { toast } from '@/stores/toast'

interface ClientDetailPanelProps {
  client: Client
  onClose: () => void
}

export function ClientDetailPanel({ client, onClose }: ClientDetailPanelProps) {
  const [editing, setEditing] = useState(false)
  const del = useDeleteClient()

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
      <aside
        className="sticky top-[80px] self-start max-h-[calc(100vh-100px)] rounded-[14px] border border-[var(--border-strong)] bg-[var(--surface)] shadow-[var(--shadow-md)] overflow-hidden flex flex-col animate-slide-up"
        aria-label={`Detaljer för ${client.name}`}
      >
        {/* Header */}
        <div className="shrink-0 flex items-start justify-between gap-4 px-6 py-5 border-b border-[var(--border)]">
          <div className="flex-1 min-w-0">
            <h2 className="text-[18px] font-semibold text-[var(--fg)] tracking-tight truncate">
              {client.name}
            </h2>
            {client.service && (
              <p className="mt-0.5 text-[13px] text-[var(--fg-muted)] truncate">
                {client.service}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button size="sm" variant="secondary" onClick={() => setEditing(true)}>
              <Pencil size={13} />
              Redigera
            </Button>
            <Button
              size="icon-sm"
              variant="ghost"
              onClick={handleDelete}
              aria-label="Ta bort"
            >
              <Trash2
                size={14}
                className="text-[var(--fg-subtle)] hover:text-[var(--color-danger)]"
              />
            </Button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Stäng"
              className="h-8 w-8 rounded-md flex items-center justify-center text-[var(--fg-subtle)] hover:text-[var(--fg)] hover:bg-[var(--surface-2)] transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto">
          <ClientDetailBody client={client} />
        </div>
      </aside>

      <ClientDialog open={editing} onClose={() => setEditing(false)} initial={client} />
    </>
  )
}
