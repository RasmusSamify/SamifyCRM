import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { ActivityLog } from '@/types/database'

export function useActivity(clientId: string | undefined) {
  return useQuery({
    queryKey: ['activity_log', clientId],
    enabled: !!clientId,
    queryFn: async (): Promise<ActivityLog[]> => {
      if (!clientId) return []
      const { data, error } = await supabase
        .from('activity_log')
        .select('*')
        .eq('client_id', clientId)
        .order('created_at', { ascending: false })
      if (error) throw error
      return data ?? []
    },
  })
}

export interface CreateActivityPayload {
  clientId: string
  clientName: string
  content: string
  type: string
  owner?: string | null
}

export function useCreateActivity() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (payload: CreateActivityPayload) => {
      const { error } = await supabase.from('activity_log').insert({
        client_id: payload.clientId,
        client_name: payload.clientName,
        content: payload.content,
        type: payload.type,
        owner: payload.owner ?? null,
      })
      if (error) throw error
    },
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: ['activity_log', variables.clientId] })
    },
  })
}

export function useDeleteActivity() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id }: { id: string; clientId: string }) => {
      const { error } = await supabase.from('activity_log').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: ['activity_log', variables.clientId] })
    },
  })
}
