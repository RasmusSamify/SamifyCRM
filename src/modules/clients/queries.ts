import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Client, TablesInsert, TablesUpdate } from '@/types/database'

const listKey = ['clients', 'list'] as const

export function useClients() {
  return useQuery({
    queryKey: listKey,
    queryFn: async (): Promise<Client[]> => {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('name', { ascending: true })
      if (error) throw error
      return data ?? []
    },
  })
}

export function useClient(id: string | undefined) {
  return useQuery({
    queryKey: ['clients', 'detail', id],
    enabled: !!id,
    queryFn: async (): Promise<Client | null> => {
      if (!id) return null
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('id', id)
        .maybeSingle()
      if (error) throw error
      return data
    },
  })
}

export function useUpsertClient() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (payload: TablesInsert<'clients'> | (TablesUpdate<'clients'> & { id: string })) => {
      if ('id' in payload && payload.id) {
        const { id, ...rest } = payload
        const { data, error } = await supabase
          .from('clients')
          .update(rest)
          .eq('id', id)
          .select()
          .single()
        if (error) throw error
        return data
      }
      const { data, error } = await supabase
        .from('clients')
        .insert(payload as TablesInsert<'clients'>)
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['clients'] })
      if (data?.id) {
        qc.invalidateQueries({ queryKey: ['clients', 'detail', data.id] })
      }
    },
  })
}

export function useDeleteClient() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('clients').delete().eq('id', id)
      if (error) throw error
      return id
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['clients'] }),
  })
}
