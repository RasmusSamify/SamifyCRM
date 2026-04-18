import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Invoice, TablesInsert, TablesUpdate } from '@/types/database'

export function useInvoices() {
  return useQuery({
    queryKey: ['invoices', 'list'],
    queryFn: async (): Promise<Invoice[]> => {
      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .order('due_date', { ascending: false })
      if (error) throw error
      return data ?? []
    },
  })
}

export function useUpsertInvoice() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (
      payload: TablesInsert<'invoices'> | (TablesUpdate<'invoices'> & { id: string }),
    ) => {
      if ('id' in payload && payload.id) {
        const { id, ...rest } = payload
        const { data, error } = await supabase
          .from('invoices')
          .update(rest)
          .eq('id', id)
          .select()
          .single()
        if (error) throw error
        return data
      }
      const { data, error } = await supabase
        .from('invoices')
        .insert(payload as TablesInsert<'invoices'>)
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['invoices'] }),
  })
}

export function useDeleteInvoice() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('invoices').delete().eq('id', id)
      if (error) throw error
      return id
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['invoices'] }),
  })
}
