import type { Json } from '@/types/database'

/* ===== Premium Offer shape, stored as JSON in quotes.items when kind="premium" ===== */

export interface PremiumOfferData {
  kind: 'premium'
  version?: string
  hero?: {
    eyebrow?: string
    heading?: string
    subtitle?: string
  }
  roi?: {
    baselineBookings: number
    baselineAdminHours: number
    baselineHourlyValue: number
    automationRate?: number
    proMonthlyPrice?: number
    proSetupFee?: number
  }
  tiers?: OfferTier[]
  compare?: CompareRow[]
  terms?: TermItem[]
  cta?: {
    heading?: string
    description?: string
    primaryLabel?: string
    primaryHref?: string
    secondaryLabel?: string
    secondaryHref?: string
  }
}

export interface OfferTier {
  id: string
  name: string
  description?: string
  monthlyPrice: number
  setupFee: number
  featured?: boolean
  features: Array<{ label: string; disabled?: boolean; bold?: boolean }>
  included?: {
    setup: Array<{ title: string; description: string }>
    monthly: Array<{ title: string; description: string }>
  }
}

export interface CompareRow {
  feature: string
  values: Record<string, string | boolean>
}

export interface TermItem {
  icon:
    | 'Calendar'
    | 'Lock'
    | 'Shield'
    | 'FileText'
    | 'Clock'
    | 'RefreshCw'
    | 'Zap'
    | 'TrendingUp'
  title: string
  description: string
}

export function parsePremiumOffer(items: Json | null | undefined): PremiumOfferData | null {
  if (!items || typeof items !== 'object' || Array.isArray(items)) return null
  if ((items as { kind?: unknown }).kind !== 'premium') return null
  return items as unknown as PremiumOfferData
}

export interface SimpleItem {
  name: string
  desc?: string
}

export function parseSimpleItems(items: Json | null | undefined): SimpleItem[] {
  if (!items || !Array.isArray(items)) return []
  return items.flatMap((item) => {
    if (typeof item === 'string') return [{ name: item }]
    if (item && typeof item === 'object' && 'name' in item) {
      const { name, desc } = item as { name?: unknown; desc?: unknown }
      return typeof name === 'string'
        ? [{ name, desc: typeof desc === 'string' ? desc : undefined }]
        : []
    }
    return []
  })
}

export const DEFAULT_TERMS: TermItem[] = [
  {
    icon: 'Calendar',
    title: 'Bindningstid',
    description:
      '12 månader initialt, sedan 3 månaders löpande bindning. Uppsägning 3 mån innan.',
  },
  {
    icon: 'Lock',
    title: 'Dataägarskap',
    description:
      'All er data ägs av er. Vid uppsägning får ni fullständig export (CSV + JSON).',
  },
  {
    icon: 'Shield',
    title: 'GDPR & säkerhet',
    description:
      'Data lagras i Stockholm. Dataskyddsavtal ingår. Krypterat i vila och transit.',
  },
  {
    icon: 'FileText',
    title: 'Betalningsvillkor',
    description:
      'Engångskostnad faktureras vid driftsättning, 30 dagar netto. Månadsavgift kvartalsvis i förskott.',
  },
  {
    icon: 'RefreshCw',
    title: 'Uppgradering när som helst',
    description:
      'Byt paket vid behov — endast differensen i månadsavgift debiteras från uppgraderingsdatum.',
  },
  {
    icon: 'Clock',
    title: 'Driftsättningstid',
    description:
      'Normalt 3–4 veckor från signatur till driftsatt system. Parallell körning under övergången.',
  },
  {
    icon: 'Zap',
    title: 'Inga dolda tillägg',
    description:
      'Allt som står i offerten ingår. Skräddarsydda funktioner utanför paketet offereras separat.',
  },
  {
    icon: 'TrendingUp',
    title: 'Volymanpassning',
    description:
      'Rimliga volymtrösklar. Vid tillväxt justeras abonnemanget transparent i samråd med er.',
  },
]
