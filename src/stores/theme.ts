import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Theme =
  | 'sapphire'
  | 'graphite'
  | 'noir'
  | 'plum'
  | 'emerald'
  | 'teal'
  | 'light'

export interface ThemeMeta {
  id: Theme
  label: string
  tagline: string
  swatchBg: string
  swatchAccent: string
}

export const THEMES: ThemeMeta[] = [
  {
    id: 'sapphire',
    label: 'Sapphire',
    tagline: 'Midnight cobalt · amber',
    swatchBg: 'oklch(0.128 0.022 265)',
    swatchAccent: 'oklch(0.72 0.18 62)',
  },
  {
    id: 'graphite',
    label: 'Graphite',
    tagline: 'Warm onyx · ember',
    swatchBg: 'oklch(0.138 0.008 50)',
    swatchAccent: 'oklch(0.75 0.17 65)',
  },
  {
    id: 'noir',
    label: 'Noir',
    tagline: 'Pure black · amber',
    swatchBg: 'oklch(0.125 0.003 0)',
    swatchAccent: 'oklch(0.72 0.18 62)',
  },
  {
    id: 'plum',
    label: 'Plum',
    tagline: 'Aubergine · champagne',
    swatchBg: 'oklch(0.132 0.024 320)',
    swatchAccent: 'oklch(0.80 0.13 85)',
  },
  {
    id: 'emerald',
    label: 'Emerald',
    tagline: 'Forest depth · gold',
    swatchBg: 'oklch(0.135 0.022 155)',
    swatchAccent: 'oklch(0.80 0.13 88)',
  },
  {
    id: 'teal',
    label: 'Teal',
    tagline: 'Petrol night · amber',
    swatchBg: 'oklch(0.130 0.025 210)',
    swatchAccent: 'oklch(0.75 0.17 65)',
  },
  {
    id: 'light',
    label: 'Pearl',
    tagline: 'Warm paper · cognac',
    swatchBg: 'oklch(0.985 0.004 90)',
    swatchAccent: 'oklch(0.58 0.18 55)',
  },
]

interface ThemeState {
  theme: Theme
  setTheme: (theme: Theme) => void
}

const VALID_THEMES: Theme[] = THEMES.map((t) => t.id)

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: 'sapphire',
      setTheme: (theme) => {
        set({ theme })
        document.documentElement.setAttribute('data-theme', theme)
      },
    }),
    {
      name: 'samify-theme',
      version: 2,
      migrate: (persistedState, version) => {
        if (!persistedState || typeof persistedState !== 'object') {
          return { theme: 'sapphire' } as ThemeState
        }
        const s = persistedState as { theme?: string }
        if (version < 2 && s.theme === 'dark') s.theme = 'sapphire'
        if (!s.theme || !VALID_THEMES.includes(s.theme as Theme)) s.theme = 'sapphire'
        return persistedState as ThemeState
      },
      onRehydrateStorage: () => (state) => {
        if (state) {
          document.documentElement.setAttribute('data-theme', state.theme)
        }
      },
    },
  ),
)
