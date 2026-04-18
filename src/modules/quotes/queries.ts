import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Quote, TablesInsert, TablesUpdate } from '@/types/database'

export function useQuotes() {
  return useQuery({
    queryKey: ['quotes', 'list'],
    queryFn: async (): Promise<Quote[]> => {
      const { data, error } = await supabase
        .from('quotes')
        .select('*')
        .order('created_at', { ascending: false })
      if (error) throw error
      return data ?? []
    },
  })
}

export function useUpsertQuote() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (
      payload: TablesInsert<'quotes'> | (TablesUpdate<'quotes'> & { id: string }),
    ) => {
      if ('id' in payload && payload.id) {
        const { id, ...rest } = payload
        const { data, error } = await supabase
          .from('quotes')
          .update(rest)
          .eq('id', id)
          .select()
          .single()
        if (error) throw error
        return data
      }
      const { data, error } = await supabase
        .from('quotes')
        .insert(payload as TablesInsert<'quotes'>)
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['quotes'] }),
  })
}

export function useDeleteQuote() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('quotes').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['quotes'] }),
  })
}
