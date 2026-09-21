import { Users } from 'lucide-react'

import { Hero } from '@/shared/components/Hero'
import { partyText } from '../../domain/position'
import { TicketStub } from './TicketStub'

/** Común a todos los estados: local, comensal, personas y el ticket grande. */
export function TurnHeader({ venueName, name, partySize, ticket }) {
  return (
    <Hero>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-bold text-ink-muted">{venueName}</p>
          <h1 className="mt-1 truncate text-2xl font-extrabold tracking-tight">{name}</h1>
          <p className="mt-2 flex items-center gap-1.5 text-sm font-semibold text-ink-muted">
            <Users className="size-4" aria-hidden="true" />
            {partyText(partySize)}
          </p>
        </div>
        <TicketStub ticket={ticket} />
      </div>
    </Hero>
  )
}
