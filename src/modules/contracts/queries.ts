import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Contract, TablesInsert, TablesUpdate } from '@/types/database'

export function useContracts() {
  return useQuery({
    queryKey: ['contracts', 'list'],
    queryFn: async (): Promise<Contract[]> => {
      const { data, error } = await supabase
        .from('contracts')
        .select('*')
        .order('end_date', { ascending: true })
      if (error) throw error
      return data ?? []
    },
  })
}

export function useUpsertContract() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (
      payload: TablesInsert<'contracts'> | (TablesUpdate<'contracts'> & { id: string }),
    ) => {
      if ('id' in payload && payload.id) {
        const { id, ...rest } = payload
        const { data, error } = await supabase
          .from('contracts')
          .update(rest)
          .eq('id', id)
          .select()
          .single()
        if (error) throw error
        return data
      }
      const { data, error } = await supabase
        .from('contracts')
        .insert(payload as TablesInsert<'contracts'>)
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['contracts'] }),
  })
}

export function useDeleteContract() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('contracts').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['contracts'] }),
  })
}
