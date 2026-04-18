import { createBrowserRouter } from 'react-router-dom'
import { Settings } from 'lucide-react'
import { AppLayout } from '@/components/layout/AppLayout'
import { PlaceholderPage } from '@/components/layout/PlaceholderPage'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { DashboardPage } from '@/modules/dashboard/DashboardPage'
import { LoginPage } from '@/modules/auth/LoginPage'
import { ClientsPage } from '@/modules/clients/ClientsPage'
import { PipelinePage } from '@/modules/pipeline/PipelinePage'
import { InvoicesPage } from '@/modules/invoices/InvoicesPage'
import { ContractsPage } from '@/modules/contracts/ContractsPage'
import { ExpensesPage } from '@/modules/expenses/ExpensesPage'
import { QuotesPage } from '@/modules/quotes/QuotesPage'
import { ScrivePage } from '@/modules/scrive/ScrivePage'
import { CalendarPage } from '@/modules/calendar/CalendarPage'
import { RemindersPage } from '@/modules/reminders/RemindersPage'
import { MrrPage } from '@/modules/mrr/MrrPage'
import { StatusPage } from '@/modules/status/StatusPage'

export const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  { path: '/status/:token', element: <StatusPage /> },
  {
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      { path: '/', element: <DashboardPage /> },
      { path: '/kunder', element: <ClientsPage /> },
      { path: '/pipeline', element: <PipelinePage /> },
      { path: '/offerter', element: <QuotesPage /> },
      { path: '/fakturor', element: <InvoicesPage /> },
      { path: '/avtal', element: <ContractsPage /> },
      { path: '/kostnader', element: <ExpensesPage /> },
      { path: '/kalender', element: <CalendarPage /> },
      { path: '/paminnelser', element: <RemindersPage /> },
      { path: '/scrive', element: <ScrivePage /> },
      { path: '/mrr', element: <MrrPage /> },
      {
        path: '/installningar',
        element: (
          <PlaceholderPage
            title="Inställningar"
            subtitle="Profil, integrationer och preferenser"
            icon={Settings}
          />
        ),
      },
    ],
  },
])
