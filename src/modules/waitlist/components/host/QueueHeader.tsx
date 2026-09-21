import { LogOut, Pause, Play, Clock } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { ListStatusBadge } from '@/modules/venues'
import { Arcs } from '@/shared/components/Arcs'
import type { ListStatus } from '@/shared/types'
import { countsText } from '../../domain/hostQueue'

const ON_INK = 'border-0 bg-white/10 text-white shadow-none hover:bg-white/20 hover:text-white'

interface QueueHeaderProps {
  venueName: string
  dayLabel: string
  waiting: number
  called: number
  listStatus: ListStatus
  paused: boolean
  offline: boolean
  pausePending: boolean
  onTogglePause: () => void
  onOpenSchedule: () => void
  onLogout: () => void
}

/** Cabecera oscura de la tablet: local, día y conteos, estado de la lista y sus botones. */
export function QueueHeader({
  venueName,
  dayLabel,
  waiting,
  called,
  listStatus,
  paused,
  offline,
  pausePending,
  onTogglePause,
  onOpenSchedule,
  onLogout,
}: QueueHeaderProps) {
  return (
    <header className="relative overflow-hidden bg-ink px-4 py-5 text-ink-foreground sm:px-6">
      <Arcs className="pointer-events-none absolute right-6 -bottom-px hidden h-20 w-[92px] sm:block" />
      <div className="relative">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h1 className="truncate text-2xl font-extrabold tracking-tight">{venueName}</h1>
            <p className="mt-0.5 text-sm font-semibold text-ink-muted">
              {dayLabel}: {countsText(waiting, called)}
            </p>
          </div>
          <Button variant="ghost" size="icon" className={ON_INK} aria-label="Cerrar sesión" onClick={onLogout}>
            <LogOut />
          </Button>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <ListStatusBadge status={listStatus} />
          {/* size="default" (44px): la tablet se toca con el dedo, no con un cursor. */}
          <Button variant="ghost" className={ON_INK} disabled={offline || pausePending} onClick={onTogglePause}>
            {paused ? <Play /> : <Pause />}
            {paused ? 'Reanudar' : 'Pausar'}
          </Button>
          <Button variant="ghost" className={ON_INK} disabled={offline} onClick={onOpenSchedule}>
            <Clock />
            Horario
          </Button>
        </div>
      </div>
    </header>
  )
}
