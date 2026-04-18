import {
  LayoutDashboard,
  Users,
  GitBranch,
  Receipt,
  FileText,
  Wallet,
  FileSignature,
  PenLine,
  Calendar,
  BellRing,
  TrendingUp,
  Settings,
  type LucideIcon,
} from 'lucide-react'

export interface NavRoute {
  to: string
  label: string
  description: string
  icon: LucideIcon
  group: 'Översikt' | 'CRM' | 'Ekonomi' | 'Planering' | 'Analys' | 'System'
  shortcut?: string /* 1..9 */
  keywords?: string[]
}

export const navRoutes: NavRoute[] = [
  {
    to: '/',
    label: 'Dashboard',
    description: 'Översikt över verksamheten',
    icon: LayoutDashboard,
    group: 'Översikt',
    shortcut: '1',
    keywords: ['hem', 'start', 'översikt'],
  },
  {
    to: '/kunder',
    label: 'Kunder',
    description: 'Lista och hantera kunder',
    icon: Users,
    group: 'CRM',
    shortcut: '2',
    keywords: ['clients', 'kund'],
  },
  {
    to: '/pipeline',
    label: 'Pipeline',
    description: 'Deal-flöde och leads',
    icon: GitBranch,
    group: 'CRM',
    shortcut: '3',
    keywords: ['deals', 'kanban', 'säljpipe'],
  },
  {
    to: '/offerter',
    label: 'Offerter',
    description: 'Skicka och spåra offerter',
    icon: PenLine,
    group: 'CRM',
    shortcut: '4',
    keywords: ['quotes', 'offer'],
  },
  {
    to: '/fakturor',
    label: 'Fakturor',
    description: 'Fakturering och betalningsstatus',
    icon: Receipt,
    group: 'Ekonomi',
    shortcut: '5',
    keywords: ['invoices', 'faktura', 'betalning'],
  },
  {
    to: '/avtal',
    label: 'Avtal & Kontrakt',
    description: 'Bindningstider och villkor',
    icon: FileText,
    group: 'Ekonomi',
    shortcut: '6',
    keywords: ['contracts', 'kontrakt'],
  },
  {
    to: '/kostnader',
    label: 'Kostnader',
    description: 'Abonnemang och utlägg',
    icon: Wallet,
    group: 'Ekonomi',
    shortcut: '7',
    keywords: ['expenses', 'utgifter'],
  },
  {
    to: '/kalender',
    label: 'Kalender',
    description: 'Möten och planering',
    icon: Calendar,
    group: 'Planering',
    shortcut: '8',
    keywords: ['calendar', 'möten'],
  },
  {
    to: '/paminnelser',
    label: 'Påminnelser',
    description: 'Todos och deadlines',
    icon: BellRing,
    group: 'Planering',
    shortcut: '9',
    keywords: ['reminders', 'todos'],
  },
  {
    to: '/scrive',
    label: 'Scrive',
    description: 'E-signering av avtal',
    icon: FileSignature,
    group: 'Planering',
    keywords: ['signing', 'e-sign'],
  },
  {
    to: '/mrr',
    label: 'MRR-historik',
    description: 'Återkommande intäkter över tid',
    icon: TrendingUp,
    group: 'Analys',
    keywords: ['revenue', 'intäkter', 'mrr'],
  },
  {
    to: '/installningar',
    label: 'Inställningar',
    description: 'Profil och preferenser',
    icon: Settings,
    group: 'System',
    keywords: ['settings', 'profile'],
  },
]
