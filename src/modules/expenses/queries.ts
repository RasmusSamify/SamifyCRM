import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Expense, TablesInsert, TablesUpdate } from '@/types/database'

export function useExpenses() {
  return useQuery({
    queryKey: ['expenses', 'list'],
    queryFn: async (): Promise<Expense[]> => {
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .order('created_at', { ascending: false })
      if (error) throw error
      return data ?? []
    },
  })
}

export function useUpsertExpense() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (
      payload: TablesInsert<'expenses'> | (TablesUpdate<'expenses'> & { id: string }),
    ) => {
      if ('id' in payload && payload.id) {
        const { id, ...rest } = payload
        const { data, error } = await supabase
          .from('expenses')
          .update(rest)
          .eq('id', id)
          .select()
          .single()
        if (error) throw error
        return data
      }
      const { data, error } = await supabase
        .from('expenses')
        .insert(payload as TablesInsert<'expenses'>)
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['expenses'] }),
  })
}

export function useDeleteExpense() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('expenses').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['expenses'] }),
  })
}
