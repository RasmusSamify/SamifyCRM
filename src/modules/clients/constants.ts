import type { Client } from '@/types/database'

export const CLIENT_STATUS_OPTIONS = [
  { value: 'prospect', label: 'Prospect', tone: 'violet' as const },
  { value: 'active', label: 'Aktiv', tone: 'success' as const },
  { value: 'paused', label: 'Pausad', tone: 'warning' as const },
  { value: 'churn', label: 'Churnad', tone: 'danger' as const },
]

export const BILLING_TYPES = [
  { value: 'monthly', label: 'Månadsvis' },
  { value: 'quarterly', label: 'Kvartalsvis' },
  { value: 'yearly', label: 'Årsvis' },
  { value: 'onetime', label: 'Engångsbetalning' },
]

export const PROJECT_PHASES = [
  { min: 0, max: 24, label: 'Kartläggning', color: 'var(--color-violet)' },
  { min: 25, max: 49, label: 'Prototyp', color: 'var(--color-info)' },
  { min: 50, max: 74, label: 'Driftsättning', color: 'var(--color-warning)' },
  { min: 75, max: 100, label: 'Löpande support', color: 'var(--color-success)' },
]

export function phaseFor(health: number) {
  return PROJECT_PHASES.find((p) => health >= p.min && health <= p.max) ?? PROJECT_PHASES[0]
}

export function statusOption(status: Client['client_status']) {
  return CLIENT_STATUS_OPTIONS.find((s) => s.value === status) ?? CLIENT_STATUS_OPTIONS[0]
}
