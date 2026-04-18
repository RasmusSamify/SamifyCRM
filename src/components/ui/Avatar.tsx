import { cn } from '@/lib/cn'

interface AvatarProps {
  name?: string | null
  email?: string | null
  url?: string | null
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizeMap = {
  sm: 'h-7 w-7 text-[10.5px]',
  md: 'h-9 w-9 text-[12px]',
  lg: 'h-11 w-11 text-[13px]',
}

function initials(input?: string | null) {
  if (!input) return '?'
  return (
    input
      .split(/[\s.@_-]+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? '')
      .join('') || '?'
  )
}

/* Deterministic color per name for visual variety */
function hue(input: string) {
  let h = 0
  for (let i = 0; i < input.length; i++) h = (h * 31 + input.charCodeAt(i)) >>> 0
  return h % 360
}

export function Avatar({ name, email, url, size = 'md', className }: AvatarProps) {
  const seed = name ?? email ?? 'user'
  const ini = initials(name ?? email)
  const h = hue(seed)
  const bg = `oklch(0.42 0.09 ${h})`
  const border = `oklch(0.60 0.12 ${h} / 0.45)`

  if (url) {
    return (
      <img
        src={url}
        alt={name ?? ''}
        className={cn(
          'rounded-full object-cover border border-[var(--border)]',
          sizeMap[size],
          className,
        )}
      />
    )
  }

  return (
    <div
      className={cn(
        'rounded-full flex items-center justify-center font-semibold text-white shrink-0 select-none',
        sizeMap[size],
        className,
      )}
      style={{ background: bg, border: `1px solid ${border}` }}
      aria-hidden
    >
      {ini}
    </div>
  )
}
