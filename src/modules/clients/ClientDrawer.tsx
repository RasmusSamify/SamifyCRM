import { useState } from 'react'
import { Pencil, Trash2 } from 'lucide-react'
import { Drawer } from '@/components/ui/Drawer'
import { Button } from '@/components/ui/Button'
import type { Client } from '@/types/database'
import { useDeleteClient } from './queries'
import { ClientDialog } from './ClientDialog'
import { ClientDetailBody } from './ClientDetailBody'
import { toast } from '@/stores/toast'

interface ClientDrawerProps {
  client: Client | null
  open: boolean
  onClose: () => void
}

export function ClientDrawer({ client, open, onClose }: ClientDrawerProps) {
  const [editing, setEditing] = useState(false)
  const del = useDeleteClient()

  if (!client) return null

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
        <ClientDetailBody client={client} />
      </Drawer>

      <ClientDialog open={editing} onClose={() => setEditing(false)} initial={client} />
    </>
  )
}
