import { useParams, Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Loader2, XCircle, User } from 'lucide-react'
import { PageShell } from '@/components/layout/PageShell'
import { Button } from '@/components/ui/Button'
import { useClient } from '@/modules/clients/queries'
import { TechTab } from '@/modules/clients/TechTab'

export function TechClientPage() {
  const { clientId } = useParams<{ clientId: string }>()
  const navigate = useNavigate()
  const { data: client, isLoading, error } = useClient(clientId)

  if (isLoading) {
    return (
      <PageShell title="Teknik" subtitle="Laddar kund…">
        <div className="flex items-center justify-center py-20">
          <Loader2 size={22} className="animate-spin text-[var(--fg-subtle)]" />
        </div>
      </PageShell>
    )
  }

  if (error || !client) {
    return (
      <PageShell title="Teknik" subtitle="Kunden kunde inte hittas">
        <div className="surface rounded-[14px] px-10 py-20 text-center">
          <div className="inline-flex h-12 w-12 rounded-2xl bg-[var(--surface-2)] border border-[var(--border-strong)] items-center justify-center mb-4">
            <XCircle size={22} className="text-[var(--color-danger)]" strokeWidth={1.75} />
          </div>
          <h2 className="text-[18px] font-semibold text-[var(--fg)]">Ingen kund</h2>
          <p className="mt-2 text-[13.5px] text-[var(--fg-muted)]">
            Kunden kunde inte hittas — den kan ha tagits bort.
          </p>
          <div className="mt-5">
            <Link to="/teknik">
              <Button variant="secondary">
                <ArrowLeft size={13} />
                Tillbaka till Teknik
              </Button>
            </Link>
          </div>
        </div>
      </PageShell>
    )
  }

  return (
    <PageShell
      title={client.name}
      subtitle={
        client.github_owner
          ? `Teknisk profil · @${client.github_owner}`
          : 'Teknisk profil'
      }
      action={
        <div className="flex items-center gap-2">
          <Button size="sm" variant="ghost" onClick={() => navigate('/teknik')}>
            <ArrowLeft size={13} />
            Tillbaka
          </Button>
          <Link to="/kunder">
            <Button size="sm" variant="secondary">
              <User size={13} />
              Visa i Kunder
            </Button>
          </Link>
        </div>
      }
    >
      <TechTab client={client} />
    </PageShell>
  )
}
