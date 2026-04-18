import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Pipeline, TablesInsert, TablesUpdate } from '@/types/database'

const listKey = ['pipeline', 'list'] as const

export function useDeals() {
  return useQuery({
    queryKey: listKey,
    queryFn: async (): Promise<Pipeline[]> => {
      const { data, error } = await supabase
        .from('pipeline')
        .select('*')
        .order('created_at', { ascending: false })
      if (error) throw error
      return data ?? []
    },
  })
}

export function useUpsertDeal() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (
      payload: TablesInsert<'pipeline'> | (TablesUpdate<'pipeline'> & { id: string }),
    ) => {
      if ('id' in payload && payload.id) {
        const { id, ...rest } = payload
        const { data, error } = await supabase
          .from('pipeline')
          .update(rest)
          .eq('id', id)
          .select()
          .single()
        if (error) throw error
        return data
      }
      const { data, error } = await supabase
        .from('pipeline')
        .insert(payload as TablesInsert<'pipeline'>)
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['pipeline'] }),
  })
}

export function useUpdateDealPhase() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, phase }: { id: string; phase: string }) => {
      const { error } = await supabase.from('pipeline').update({ phase }).eq('id', id)
      if (error) throw error
    },
    onMutate: async ({ id, phase }) => {
      await qc.cancelQueries({ queryKey: listKey })
      const prev = qc.getQueryData<Pipeline[]>(listKey)
      if (prev) {
        qc.setQueryData<Pipeline[]>(
          listKey,
          prev.map((d) => (d.id === id ? { ...d, phase } : d)),
        )
      }
      return { prev }
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(listKey, ctx.prev)
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ['pipeline'] }),
  })
}

export function useDeleteDeal() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('pipeline').delete().eq('id', id)
      if (error) throw error
      return id
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['pipeline'] }),
  })
}
