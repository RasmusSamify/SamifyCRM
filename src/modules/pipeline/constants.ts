export const PHASES = [
  { id: 'prospekt', label: 'Prospekt', color: 'var(--color-violet)' },
  { id: 'demo', label: 'Demo', color: 'var(--color-info)' },
  { id: 'offert', label: 'Offert', color: 'var(--color-warning)' },
  { id: 'vunnen', label: 'Vunnen', color: 'var(--color-success)' },
  { id: 'forlorad', label: 'Förlorad', color: 'var(--color-danger)' },
] as const

export type PhaseId = (typeof PHASES)[number]['id']

export const PHASE_BY_ID = Object.fromEntries(PHASES.map((p) => [p.id, p])) as Record<
  PhaseId,
  (typeof PHASES)[number]
>
