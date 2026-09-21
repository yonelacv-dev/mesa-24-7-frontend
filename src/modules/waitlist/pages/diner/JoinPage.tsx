import { Navigate, useNavigate } from 'react-router-dom'

import { ClosedNotice, useVenueStatus } from '@/modules/venues'
import { Hero } from '@/shared/components/Hero'
import { LivePill } from '@/shared/components/LivePill'
import { PageState } from '@/shared/components/PageState'
import { messageFor } from '@/shared/constants/errors'
import { useOnline } from '@/shared/hooks/useOnline'
import { useRequiredParam } from '@/shared/hooks/useRequiredParam'
import type { Entry, JoinedEntry } from '@/shared/types'
import { JoinForm } from '../../components/diner/JoinForm'
import { TicketLookupForm } from '../../components/diner/TicketLookupForm'
import { useJoinQueue } from '../../hooks/useJoinQueue'
import { useSavedTurn } from '../../hooks/useSavedTurn'
import { useTicketLookup } from '../../hooks/useTicketLookup'

const ALREADY_IN_QUEUE = 'Ya estabas en la cola con este teléfono. Te llevamos a tu turno.'

/** Pantalla 1: Unirse. Si el navegador recuerda un turno, va directo a él. */
export default function JoinPage() {
  const slug = useRequiredParam('slug')
  const navigate = useNavigate()
  const savedToken = useSavedTurn(slug)
  const status = useVenueStatus(slug)
  const online = useOnline()
  const join = useJoinQueue(slug)
  const lookup = useTicketLookup(slug)

  if (savedToken) return <Navigate to={`/venues/${slug}/diner/turn/${savedToken}`} replace />

  if (status.error?.status === 404) {
    return <PageState title="No encontramos ese local" text="Revisa el código QR o pídele ayuda al anfitrión." />
  }
  if (!status.data) {
    return status.isError ? (
      <PageState title="No pudimos cargar la lista" text={messageFor(status.error)} />
    ) : (
      <PageState title="Cargando…" />
    )
  }

  const { venue, status: listStatus } = status.data
  const goToTurn = (entry: Entry | JoinedEntry) =>
    navigate(`/venues/${slug}/diner/turn/${entry.token}`, {
      state: { notice: 'already_in_queue' in entry && entry.already_in_queue ? ALREADY_IN_QUEUE : null },
    })

  return (
    <main className="mx-auto min-h-dvh w-full max-w-md bg-background pb-8">
      <Hero>
        <p className="text-sm font-bold text-ink-muted">Lista de espera de hoy</p>
        <h1 className="mt-1 text-3xl font-extrabold tracking-tight">{venue.name}</h1>
      </Hero>

      <div className="relative z-10 -mt-8 flex flex-col gap-4 px-4">
        {listStatus.kind === 'open' ? (
          <JoinForm
            phonePrefix={venue.phone_prefix}
            pending={join.isPending}
            disabled={!online}
            serverError={join.error}
            onSubmit={(values) => join.mutate(values, { onSuccess: goToTurn })}
          />
        ) : (
          <ClosedNotice status={listStatus} />
        )}

        <TicketLookupForm
          pending={lookup.isPending}
          disabled={!online}
          errorMessage={lookup.error ? messageFor(lookup.error) : null}
          onSubmit={(values) => lookup.mutate(values, { onSuccess: goToTurn })}
        />

        {!online && (
          <div className="flex justify-center">
            <LivePill status="offline" />
          </div>
        )}
      </div>
    </main>
  )
}
