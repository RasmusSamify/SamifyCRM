import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Client, Invoice, Pipeline, Reminder } from '@/types/database'

export function useDashboardData() {
  return useQuery({
    queryKey: ['dashboard', 'overview'],
    queryFn: async () => {
      const [clientsRes, invoicesRes, pipelineRes, remindersRes] = await Promise.all([
        supabase.from('clients').select('*'),
        supabase.from('invoices').select('*'),
        supabase.from('pipeline').select('*'),
        supabase
          .from('reminders')
          .select('*')
          .eq('done', false)
          .order('due_date', { ascending: true })
          .limit(5),
      ])
      if (clientsRes.error) throw clientsRes.error
      if (invoicesRes.error) throw invoicesRes.error
      if (pipelineRes.error) throw pipelineRes.error
      if (remindersRes.error) throw remindersRes.error

      return {
        clients: (clientsRes.data ?? []) as Client[],
        invoices: (invoicesRes.data ?? []) as Invoice[],
        pipeline: (pipelineRes.data ?? []) as Pipeline[],
        reminders: (remindersRes.data ?? []) as Reminder[],
      }
    },
  })
}
