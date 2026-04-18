# Samify CRM

Intern CRM byggd i React + TypeScript med Supabase som backend. Rewrite från den tidigare monolitiska HTML-versionen (sparad i [`legacy/`](./legacy/) som referens).

## Stack

- **Vite 8** + **React 19** + **TypeScript 6**
- **Tailwind CSS v4** (Vite plugin, `@theme` CSS-tokens)
- **React Router v6** för routing, `ProtectedRoute` för auth-skydd
- **TanStack Query** för server state, **Zustand** för UI state
- **Supabase** för auth + Postgres + Edge Functions (Claude AI proxy)
- **dnd-kit** för Pipeline-kanban drag-drop
- **Recharts** för MRR-graf
- **cmdk** för ⌘K command palette
- **Lucide React** för alla ikoner (inga emojis i UI)
- **Geist** / **Instrument Serif** / **Geist Mono** typografi

## Kom igång

```bash
# 1. Installera
npm install

# 2. Kopiera .env.example → .env.local och fyll i Supabase-credentials
cp .env.example .env.local

# 3. Kör dev-servern
npm run dev        # http://localhost:5173

# 4. Bygg produktion
npm run build
npm run preview
```

## Miljövariabler

| Variabel | Krävs | Beskrivning |
|---|---|---|
| `VITE_SUPABASE_URL` | Ja | URL till Supabase-projektet |
| `VITE_SUPABASE_ANON_KEY` | Ja | Publik anon-nyckel (används från klienten; RLS måste vara på) |

## Struktur

```
src/
├── modules/             # Feature-moduler (en mapp per modul)
│   ├── auth/            #   LoginPage
│   ├── dashboard/       #   DashboardPage + queries
│   ├── clients/         #   CRUD + drawer med tabs
│   ├── pipeline/        #   Kanban med drag-drop
│   ├── invoices/        #   Fakturor, overdue-beräkning
│   ├── contracts/       #   Avtal, bindningstider
│   ├── expenses/        #   Abonnemang + engångs, månadsbelopp
│   ├── quotes/          #   Offerter, publik token-länk
│   ├── reminders/       #   Todos med buckets (överdue/idag/snart/senare/klara)
│   ├── scrive/          #   Read-only lista över e-signerade dokument
│   ├── calendar/        #   Månadsvy, events från reminders+scrive
│   ├── mrr/             #   Historikgraf (Recharts)
│   └── status/          #   Publik /status/:token (read-only)
├── components/
│   ├── ui/              # Button, Card, Dialog, Drawer, DataTable, …
│   ├── layout/          # Sidebar, Topbar, AppLayout, PageShell
│   ├── auth/            # ProtectedRoute
│   └── CommandPalette.tsx
├── hooks/               # useAuth, useGlobalShortcuts
├── lib/                 # supabase client, cn, format, queryClient, navigation
├── stores/              # Zustand: theme, commandPalette, toast
├── types/               # database.ts (genererade Supabase-typer)
├── routes/router.tsx    # React Router config
├── App.tsx              # Providers + Router + Toaster
└── main.tsx             # Entry
```

## Routing

- `/login` — publik
- `/status/:token` — publik (kunddelbar projektstatus)
- `/` + alla moduler — skyddade av `ProtectedRoute`

## Kortkommandon

| Kortkommando | Funktion |
|---|---|
| `⌘K` / `⌘P` | Öppna command palette |
| `⌘1`–`⌘9` | Hoppa direkt till modul (1=Dashboard, 2=Kunder, …) |
| `esc` | Stäng modal/dialog/drawer |

## Designsystem

Designen heter **Midnight Sapphire** — djup kobolt-indigo near-black (tänk Rolls-Royce Black Badge, Patek Philippe-urtavla). Light mode är "Pearl & Cognac" — varm off-white med cognac-accent.

Tokens definieras i `src/index.css` via Tailwind v4 `@theme`. Semantiska variabler (`--bg`, `--surface`, `--accent`, etc.) är theme-aware och byts via `data-theme`-attribut på `<html>`.

## Supabase-schema

Typer är genererade från live-schemat och sparade i `src/types/database.ts`. För att regenerera:

```bash
# via Supabase CLI (om installerat)
npx supabase gen types typescript --project-id axypazcbgcogtdqqimvi > src/types/database.ts
```

11 tabeller: `clients`, `pipeline`, `invoices`, `contracts`, `expenses`, `quotes`, `reminders`, `mrr_history`, `scrive_documents`, `time_entries`, `activity_log`, `user_preferences`.

## Deploy

Projektet är en ren statisk SPA — funkar på Netlify, Vercel, Cloudflare Pages, eller var som helst som serverar `dist/`. Kom ihåg:

1. Sätt `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY` som build-env-variabler
2. SPA-fallback: alla routes ska serva `index.html` (404-rewrite till `/index.html`)

## Utveckling

```bash
npm run dev      # dev-server + HMR
npm run build    # tsc + vite build → dist/
npm run preview  # preview produktionsbygget
npm run lint     # ESLint
```

## Att göra härnäst

- Koppla Google Calendar OAuth för riktiga möten i Kalender-modulen
- Bygg ut Kunder-tabs: Logg (activity_log), Tid (time_entries), Lönsamhet
- AI-OCR drag-drop för fakturor och kvitton (via Claude-proxy Edge Function)
- Scrive-skapa-flöde (klientseende knapp som triggar signering)
- Inställningar-sida (profil, tema, integrationer)
- Fylla Dashboards "AI-insikter"-kort med riktiga AI-anrop
