import { useMutation } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

export interface ExtractedInvoice {
  vendor: string
  amount_original: number
  currency: string
  amount_sek: number
  date: string | null
  is_recurring: boolean
  billing_cycle: 'monthly' | 'yearly' | 'quarterly' | null
  suggested_category: string
  url: string | null
  description: string
  confidence: 'high' | 'medium' | 'low'
  fx_rate_used: number | null
  notes: string | null
}

type ParseInput =
  | { mode: 'pdf'; pdfBase64: string; filename?: string }
  | { mode: 'text'; emailText: string; emailSubject?: string }

interface ParseResponse {
  ok: boolean
  extracted?: ExtractedInvoice
  error?: string
}

export function useParseInvoice() {
  return useMutation({
    mutationFn: async (input: ParseInput): Promise<ExtractedInvoice> => {
      const { data, error } = await supabase.functions.invoke<ParseResponse>('parse-invoice', {
        body: input,
      })
      if (error) {
        const ctx = (error as { context?: Response }).context
        if (ctx && typeof ctx.text === 'function') {
          try {
            const body = await ctx.text()
            const parsed = JSON.parse(body) as { error?: string }
            if (parsed.error) throw new Error(parsed.error)
          } catch (e) {
            if (e instanceof Error && !e.message.includes('Unexpected')) throw e
          }
        }
        throw error
      }
      if (!data?.ok || !data.extracted) throw new Error(data?.error ?? 'Parsning misslyckades')
      return data.extracted
    },
  })
}

export async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      const base64 = result.split(',')[1] ?? ''
      resolve(base64)
    }
    reader.onerror = () => reject(new Error('Kunde inte läsa filen'))
    reader.readAsDataURL(file)
  })
}
