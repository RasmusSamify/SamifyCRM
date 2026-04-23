import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

export interface TechRepo {
  name: string
  description: string | null
  primaryLanguage: string | null
  stack: string[]
  host: string | null
  architecture: string | null
  keyDependencies: string[]
  hasTypescript: boolean
  hasTests: boolean
  hasCicd: boolean
  summary: string
  flags: string[]
}

export type SuggestionCategory =
  | 'security'
  | 'performance'
  | 'quality'
  | 'architecture'
  | 'dependencies'
  | 'dx'
  | 'accessibility'

export type SuggestionSeverity = 'high' | 'medium' | 'low'

export interface TechSuggestion {
  id: string
  category: SuggestionCategory
  severity: SuggestionSeverity
  title: string
  rationale: string
  repo: string | null
  prompt: string
}

export interface TechProfile {
  narrative: string
  repos: TechRepo[]
  suggestions?: TechSuggestion[]
}

interface SyncParams {
  clientId: string
  githubOwner?: string
  githubPat?: string
  savePat?: boolean
}

interface SyncResponse {
  ok: boolean
  reposAnalyzed?: number
  syncedAt?: string
  techProfile?: TechProfile
  error?: string
}

export function useSyncClientTech() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (params: SyncParams): Promise<SyncResponse> => {
      const { data, error } = await supabase.functions.invoke<SyncResponse>(
        'github-tech-sync',
        { body: params },
      )
      if (error) {
        const ctx = (error as { context?: Response }).context
        if (ctx && typeof ctx.text === 'function') {
          try {
            const body = await ctx.text()
            const parsed = JSON.parse(body) as { error?: string }
            if (parsed.error) throw new Error(parsed.error)
          } catch (e) {
            if (e instanceof Error && e.message !== 'Unexpected token') throw e
          }
        }
        throw error
      }
      if (!data?.ok) throw new Error(data?.error ?? 'Sync misslyckades')
      return data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['clients'] })
    },
  })
}

export function isTechProfile(value: unknown): value is TechProfile {
  if (!value || typeof value !== 'object') return false
  const v = value as { narrative?: unknown; repos?: unknown }
  return typeof v.narrative === 'string' && Array.isArray(v.repos)
}
