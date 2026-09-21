import { useState } from 'react'
import { Navigate, useLocation, useNavigate, useParams } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/shared/components/ConfirmDialog'
import { LivePill } from '@/shared/components/LivePill'
import { Notice } from '@/shared/components/Notice'
import { PageState } from '@/shared/components/PageState'
import { messageFor } from '@/shared/constants/errors'
import { useNow } from '@/shared/hooks/useNow'
import { useOnline } from '@/shared/hooks/useOnline'
import { CalledCard } from '../../components/diner/CalledCard'
import { EndedCard } from '../../components/diner/EndedCard'
import { TurnHeader } from '../../components/diner/TurnHeader'
import { WaitingCard } from '../../components/diner/WaitingCard'
import { isActive } from '../../domain/entryStatus'
import { useTurn } from '../../hooks/useTurn'

/** Pantalla 2: Tu turno. Se actualiza sola por SSE. */
export default function TurnPage() {
  const { slug, token } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const turn = useTurn(slug, token)
  const now = useNow(1000)
  const online = useOnline()
  const [confirmLeave, setConfirmLeave] = useState(false)
  const [notice, setNotice] = useState(location.state?.notice ?? null)

  if (turn.notFound) return <Navigate to={`/venues/${slug}/diner`} replace />
  if (turn.isLoading) return <PageState title="Cargando tu turno…" />
  if (!turn.entry) {
    return (
      <PageState
        title="No pudimos cargar tu turno"
        text={messageFor(turn.error)}
        action={<Button onClick={() => window.location.reload()}>Reintentar</Button>}
      />
    )
  }

  const { entry } = turn
  const offline = !online || turn.connection === 'offline' || turn.connection === 'failed'
  const rejoin = () => {
    turn.forget()
    navigate(`/venues/${slug}/diner`, { replace: true })
  }
  const leave = () => turn.cancel.mutate(undefined, { onSettled: () => setConfirmLeave(false) })
  const actionError = turn.cancel.error ?? turn.onTheWay.error

  return (
    <main className="mx-auto min-h-dvh w-full max-w-md bg-background pb-8">
      <TurnHeader venueName={entry.venue.name} name={entry.name} partySize={entry.party_size} ticket={entry.ticket} />

      <div className="relative z-10 -mt-8 flex flex-col gap-4 px-4">
        {notice && (
          <Notice className="flex items-start justify-between gap-3 shadow-md">
            <span>{notice}</span>
            <button type="button" className="shrink-0 text-xs font-extrabold underline" onClick={() => setNotice(null)}>
              Entendido
            </button>
          </Notice>
        )}

        {entry.status === 'waiting' && (
          <WaitingCard
            position={entry.position}
            eta={entry.eta}
            phoneDisplay={entry.phone_display}
            offline={offline}
            onLeave={() => setConfirmLeave(true)}
          />
        )}
        {entry.status === 'called' && (
          <CalledCard
            ticket={entry.ticket}
            holdEndsAt={entry.hold_ends_at}
            offsetMs={turn.offsetMs}
            now={now}
            alreadyOnTheWay={entry.on_the_way}
            offline={offline}
            onTheWay={() => turn.onTheWay.mutate()}
            onLeave={() => setConfirmLeave(true)}
          />
        )}
        {!isActive(entry.status) && <EndedCard status={entry.status} onRejoin={rejoin} />}

        {actionError && <Notice tone="destructive">{messageFor(actionError)}</Notice>}

        {isActive(entry.status) && (
          <p className="px-1 text-xs text-muted-foreground">
            Guarda tu número de ticket. Si pierdes esta página, escanea el QR otra vez y búscalo con tu teléfono.
          </p>
        )}
        <div className="flex justify-center">
          <LivePill status={offline ? 'offline' : turn.connection} />
        </div>
      </div>

      <ConfirmDialog
        open={confirmLeave}
        onOpenChange={setConfirmLeave}
        title="¿Salir de la lista?"
        description="Perderás tu puesto. Si vuelves a unirte, entrarás al final de la cola."
        cancelLabel="Seguir esperando"
        confirmLabel="Salir de la lista"
        pending={turn.cancel.isPending}
        onConfirm={leave}
      />
    </main>
  )
}
