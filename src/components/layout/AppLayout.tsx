import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { CommandPalette } from '@/components/CommandPalette'
import { useGlobalShortcuts } from '@/hooks/useGlobalShortcuts'

export function AppLayout() {
  useGlobalShortcuts()
  return (
    <div className="flex h-screen overflow-hidden text-[var(--fg)]">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Outlet />
      </div>
      <CommandPalette />
    </div>
  )
}
