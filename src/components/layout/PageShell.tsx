import type { ReactNode } from 'react'
import { Topbar } from './Topbar'

interface PageShellProps {
  title: string
  subtitle?: string
  action?: ReactNode
  children: ReactNode
}

export function PageShell({ title, subtitle, action, children }: PageShellProps) {
  return (
    <>
      <Topbar title={title} subtitle={subtitle} action={action} />
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-[1400px] px-6 py-6 animate-fade-in">{children}</div>
      </main>
    </>
  )
}
