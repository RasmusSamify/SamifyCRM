import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCommandPalette } from '@/stores/commandPalette'
import { navRoutes } from '@/lib/navigation'

function isTypingTarget(el: EventTarget | null) {
  if (!(el instanceof HTMLElement)) return false
  const tag = el.tagName
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true
  if (el.isContentEditable) return true
  return false
}

export function useGlobalShortcuts() {
  const navigate = useNavigate()
  const toggle = useCommandPalette((s) => s.toggle)
  const setOpen = useCommandPalette((s) => s.setOpen)
  const paletteOpen = useCommandPalette((s) => s.open)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey

      // ⌘K / ⌘P → palette
      if (mod && (e.key === 'k' || e.key === 'K' || e.key === 'p' || e.key === 'P')) {
        e.preventDefault()
        toggle()
        return
      }

      // Don't intercept while typing (unless modifier navigation)
      if (isTypingTarget(e.target)) return
      // Don't intercept numbers while palette is open (user may be typing into it)
      if (paletteOpen) return

      // ⌘1..⌘9 → direct navigation
      if (mod && e.key >= '1' && e.key <= '9') {
        const route = navRoutes.find((r) => r.shortcut === e.key)
        if (route) {
          e.preventDefault()
          navigate(route.to)
        }
      }
    }

    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [navigate, toggle, setOpen, paletteOpen])
}
