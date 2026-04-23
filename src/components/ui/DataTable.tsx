import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

export interface Column<T> {
  key: string
  header: string
  align?: 'left' | 'right' | 'center'
  width?: string
  render: (row: T) => ReactNode
  className?: string
}

interface DataTableProps<T> {
  columns: Column<T>[]
  rows: T[]
  rowKey: (row: T) => string
  onRowClick?: (row: T) => void
  activeRow?: (row: T) => boolean
  empty?: ReactNode
  loading?: boolean
  loadingRows?: number
}

export function DataTable<T>({
  columns,
  rows,
  rowKey,
  onRowClick,
  activeRow,
  empty,
  loading,
  loadingRows = 6,
}: DataTableProps<T>) {
  return (
    <div className="relative overflow-hidden rounded-[14px] border border-[var(--border)] bg-[var(--surface)]">
      <div className="overflow-x-auto">
        <table className="w-full text-[13.5px] border-separate border-spacing-0">
          <thead>
            <tr>
              {columns.map((col, i) => (
                <th
                  key={col.key}
                  style={{ width: col.width }}
                  className={cn(
                    'sticky top-0 z-10 bg-[var(--surface-2)]/80 backdrop-blur-md border-b border-[var(--border)]',
                    'px-4 py-2.5 text-[11px] font-semibold text-[var(--fg-muted)] uppercase tracking-[0.12em]',
                    col.align === 'right' && 'text-right',
                    col.align === 'center' && 'text-center',
                    !col.align && 'text-left',
                    i === 0 && 'pl-5',
                    i === columns.length - 1 && 'pr-5',
                  )}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading
              ? Array.from({ length: loadingRows }).map((_, i) => (
                  <tr key={i}>
                    {columns.map((col, j) => (
                      <td
                        key={col.key}
                        className={cn(
                          'px-4 py-3 border-b border-[var(--border)]',
                          j === 0 && 'pl-5',
                          j === columns.length - 1 && 'pr-5',
                        )}
                      >
                        <div
                          className="h-3.5 rounded bg-[var(--surface-2)] animate-pulse-soft"
                          style={{ width: `${40 + ((i * 13 + j * 7) % 50)}%` }}
                        />
                      </td>
                    ))}
                  </tr>
                ))
              : rows.length === 0
                ? (
                  <tr>
                    <td colSpan={columns.length} className="p-0">
                      {empty}
                    </td>
                  </tr>
                )
                : rows.map((row) => {
                    const isActive = activeRow?.(row) ?? false
                    return (
                    <tr
                      key={rowKey(row)}
                      onClick={onRowClick ? () => onRowClick(row) : undefined}
                      className={cn(
                        'group transition-colors',
                        onRowClick &&
                          'cursor-pointer hover:bg-[var(--surface-2)]/50',
                        isActive && 'bg-[color-mix(in_oklch,var(--accent)_8%,transparent)] hover:bg-[color-mix(in_oklch,var(--accent)_10%,transparent)]',
                      )}
                    >
                      {columns.map((col, j) => (
                        <td
                          key={col.key}
                          className={cn(
                            'px-4 py-3 border-b border-[var(--border)] text-[var(--fg)] group-last:border-b-0',
                            col.align === 'right' && 'text-right',
                            col.align === 'center' && 'text-center',
                            j === 0 && 'pl-5',
                            j === columns.length - 1 && 'pr-5',
                            col.className,
                          )}
                        >
                          {col.render(row)}
                        </td>
                      ))}
                    </tr>
                    )
                  })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
