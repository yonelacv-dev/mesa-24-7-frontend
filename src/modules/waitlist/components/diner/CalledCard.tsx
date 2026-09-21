import { Button } from '@/components/ui/button'
import { Arcs } from '@/shared/components/Arcs'
import { Notice } from '@/shared/components/Notice'
import { holdCountdown } from '../../domain/hold'

interface CalledCardProps {
  ticket: number
  holdEndsAt: string
  offsetMs: number
  now: number
  onTheWay: () => void
  alreadyOnTheWay: boolean
  offline: boolean
  onLeave: () => void
}

/** Estado "llamado": cuenta regresiva del plazo, "Voy en camino" y "Ya no voy". */
export function CalledCard({
  ticket,
  holdEndsAt,
  offsetMs,
  now,
  onTheWay,
  alreadyOnTheWay,
  offline,
  onLeave,
}: CalledCardProps) {
  const { expired, text } = holdCountdown(holdEndsAt, offsetMs, now)
  return (
    <>
      <div className="relative overflow-hidden rounded-3xl bg-ink p-6 text-ink-foreground shadow-[0_16px_36px_-18px_rgba(24,24,24,0.45)]">
        <Arcs pulse className="pointer-events-none absolute right-3 -bottom-px h-24 w-[110px]" />
        <div className="relative">
          <h2 className="text-3xl leading-tight font-extrabold tracking-tight">Tu mesa está lista</h2>
          <p className="mt-2 max-w-[16rem] text-sm text-ink-muted">
            Acércate a la entrada y dile al anfitrión tu ticket #{ticket}.
          </p>
          <div className="mt-6">
            {expired ? (
              <p className="max-w-[16rem] font-bold text-brand-orange">
                Se acabó el tiempo. Habla con el anfitrión para saber si aún tienes mesa.
              </p>
            ) : (
              <>
                <p className="text-sm font-bold text-ink-muted">Tiempo para llegar</p>
                <p className="text-[clamp(3rem,16vw,3.75rem)] leading-none font-extrabold tabular-nums text-brand-sun">
                  {text}
                </p>
              </>
            )}
          </div>
        </div>
      </div>
      {alreadyOnTheWay && <Notice tone="success">Avisaste al anfitrión que vas en camino.</Notice>}
      <div className="flex flex-col gap-2">
        <Button
          size="lg"
          className="shadow-[0_10px_22px_-10px_hsl(var(--primary)/0.85)]"
          disabled={offline || alreadyOnTheWay}
          onClick={onTheWay}
        >
          Voy en camino
        </Button>
        <Button variant="outline" size="lg" disabled={offline} onClick={onLeave}>
          Ya no voy
        </Button>
      </div>
    </>
  )
}
