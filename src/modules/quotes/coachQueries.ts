import { useMutation } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Quote, TablesInsert } from '@/types/database'

/* ============================================================
   Types
   ============================================================ */

export interface CoachResult {
  analysis: string
  strengths: string[]
  concerns: string[]
  nextAction: {
    title: string
    why: string
    script: string
  }
  risks: Array<{ level: 'high' | 'medium' | 'low'; text: string }>
}

export interface EmailResult {
  subject: string
  body: string
}

interface CoachResponse {
  ok: boolean
  mode?: 'coach' | 'email'
  result?: CoachResult | EmailResult
  error?: string
}

/* ============================================================
   Hooks — call the quote-sales-coach edge function
   ============================================================ */

async function callSalesCoach(
  mode: 'coach' | 'email',
  quote: Quote,
): Promise<CoachResult | EmailResult> {
  const { data, error } = await supabase.functions.invoke<CoachResponse>(
    'quote-sales-coach',
    { body: { mode, quote } },
  )
  if (error) {
    const ctx = (error as { context?: Response }).context
    if (ctx && typeof ctx.text === 'function') {
      try {
        const raw = await ctx.text()
        const parsed = JSON.parse(raw) as { error?: string }
        if (parsed.error) throw new Error(parsed.error)
      } catch (e) {
        if (e instanceof Error && !e.message.startsWith('Unexpected')) throw e
      }
    }
    throw error
  }
  if (!data?.ok || !data.result) {
    throw new Error(data?.error ?? 'AI-anropet misslyckades')
  }
  return data.result
}

export function useSalesCoach() {
  return useMutation({
    mutationFn: (quote: Quote) =>
      callSalesCoach('coach', quote) as Promise<CoachResult>,
  })
}

export function useFollowupEmail() {
  return useMutation({
    mutationFn: (quote: Quote) =>
      callSalesCoach('email', quote) as Promise<EmailResult>,
  })
}

/* ============================================================
   Auto follow-up reminders
   Schedules 3 reminders in the reminders table when a quote
   transitions to 'sent': +3 days, valid_until - 1, valid_until.
   Idempotent-ish: checks for existing reminders with the same
   title prefix before inserting.
   ============================================================ */

const REMINDER_PREFIX = '[Offert]'

function iso(d: Date): string {
  return d.toISOString().slice(0, 10)
}

function addDays(d: Date, days: number): Date {
  const next = new Date(d)
  next.setDate(next.getDate() + days)
  return next
}

export async function scheduleFollowupReminders(quote: Quote): Promise<number> {
  const base = quote.created_at ? new Date(quote.created_at) : new Date()
  const validUntil =
    quote.valid_until && quote.valid_until.length > 0
      ? new Date(quote.valid_until)
      : null

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const candidates: TablesInsert<'reminders'>[] = []

  const firstFollowup = addDays(base, 3)
  if (firstFollowup >= today) {
    candidates.push({
      client_id: quote.client_id,
      client_name: quote.client_name,
      title: `${REMINDER_PREFIX} Första uppföljning med ${quote.client_name}`,
      due_date: iso(firstFollowup),
      done: false,
    })
  }

  if (validUntil) {
    const dayBefore = addDays(validUntil, -1)
    if (dayBefore >= today) {
      candidates.push({
        client_id: quote.client_id,
        client_name: quote.client_name,
        title: `${REMINDER_PREFIX} Offerten till ${quote.client_name} löper ut imorgon`,
        due_date: iso(dayBefore),
        done: false,
      })
    }
    if (validUntil >= today) {
      candidates.push({
        client_id: quote.client_id,
        client_name: quote.client_name,
        title: `${REMINDER_PREFIX} Sista chansen — offerten till ${quote.client_name} löper ut idag`,
        due_date: iso(validUntil),
        done: false,
      })
    }
  }

  if (candidates.length === 0) return 0

  /* Avoid duplicates: skip candidates that already exist for this client
     with the [Offert]-prefix on the same due_date. */
  const { data: existing } = await supabase
    .from('reminders')
    .select('due_date, title')
    .eq('client_name', quote.client_name)
    .like('title', `${REMINDER_PREFIX}%`)

  const existingKeys = new Set(
    (existing ?? []).map((r) => `${r.due_date}|${r.title}`),
  )
  const fresh = candidates.filter(
    (c) => !existingKeys.has(`${c.due_date}|${c.title}`),
  )

  if (fresh.length === 0) return 0

  const { error } = await supabase.from('reminders').insert(fresh)
  if (error) throw error
  return fresh.length
}
