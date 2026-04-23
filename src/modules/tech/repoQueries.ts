import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { TechRepoRow } from '@/types/database'

export function useTechRepos() {
  return useQuery({
    queryKey: ['tech_repos', 'list'],
    queryFn: async (): Promise<TechRepoRow[]> => {
      const { data, error } = await supabase
        .from('tech_repos')
        .select('*')
        .order('last_synced_at', { ascending: false })
      if (error) throw error
      return data ?? []
    },
  })
}

export function useReposForClient(clientId: string | null | undefined) {
  return useQuery({
    queryKey: ['tech_repos', 'for-client', clientId],
    enabled: !!clientId,
    queryFn: async (): Promise<TechRepoRow[]> => {
      if (!clientId) return []
      const { data, error } = await supabase
        .from('tech_repos')
        .select('*')
        .eq('client_id', clientId)
        .order('last_synced_at', { ascending: false })
      if (error) throw error
      return data ?? []
    },
  })
}

export function useAssignRepoToClient() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({
      repoId,
      clientId,
    }: {
      repoId: string
      clientId: string | null
    }) => {
      const { error } = await supabase
        .from('tech_repos')
        .update({ client_id: clientId })
        .eq('id', repoId)
      if (error) throw error
    },
    onMutate: async ({ repoId, clientId }) => {
      await qc.cancelQueries({ queryKey: ['tech_repos'] })
      const prev = qc.getQueryData<TechRepoRow[]>(['tech_repos', 'list'])
      if (prev) {
        qc.setQueryData<TechRepoRow[]>(
          ['tech_repos', 'list'],
          prev.map((r) => (r.id === repoId ? { ...r, client_id: clientId } : r)),
        )
      }
      return { prev }
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.prev) qc.setQueryData(['tech_repos', 'list'], ctx.prev)
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ['tech_repos'] }),
  })
}

export function parseStringArray(raw: unknown): string[] {
  if (!Array.isArray(raw)) return []
  return raw.filter((v): v is string => typeof v === 'string')
}

export interface ParsedSuggestion {
  id: string
  category: string
  severity: 'high' | 'medium' | 'low'
  title: string
  rationale: string
  repo: string | null
  prompt: string
}

export function parseSuggestions(raw: unknown): ParsedSuggestion[] {
  if (!Array.isArray(raw)) return []
  return raw.flatMap((item) => {
    if (!item || typeof item !== 'object') return []
    const s = item as Record<string, unknown>
    return [
      {
        id: String(s.id ?? ''),
        category: String(s.category ?? ''),
        severity: (['high', 'medium', 'low'].includes(s.severity as string)
          ? (s.severity as 'high' | 'medium' | 'low')
          : 'low') as 'high' | 'medium' | 'low',
        title: String(s.title ?? ''),
        rationale: String(s.rationale ?? ''),
        repo: typeof s.repo === 'string' ? s.repo : null,
        prompt: String(s.prompt ?? ''),
      },
    ]
  })
}
