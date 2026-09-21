import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Arcs } from '@/shared/components/Arcs'
import { etaText, positionText } from '../../domain/position'

interface WaitingCardProps {
  position: number
  eta: { min: number; max: number }
  phoneDisplay: string
  offline: boolean
  onLeave: () => void
}

/** Estado "esperando": el puesto grande (baja con animación), el tiempo estimado y "Ya no voy". */
export function WaitingCard({ position, eta, phoneDisplay, offline, onLeave }: WaitingCardProps) {
  return (
    <>
      <Card className="relative overflow-hidden rounded-3xl shadow-[0_16px_36px_-18px_rgba(24,24,24,0.45)]">
        <Arcs key={position} pulse className="pointer-events-none absolute top-4 right-4 h-9 w-10" />
        <CardContent className="px-5 pt-8 pb-6 text-center">
          <p className="text-sm font-bold text-muted-foreground">Estás en el puesto</p>
          <div
            role="status"
            aria-live="polite"
            data-testid="position"
            className="mx-auto my-1 h-[clamp(5rem,26vw,7rem)] overflow-hidden text-[clamp(5rem,26vw,7rem)] leading-none font-extrabold tabular-nums"
          >
            <span key={position} className="num-gradient animate-pos-in inline-block">
              {position}
            </span>
          </div>
          <p className="text-sm font-semibold text-muted-foreground">{positionText(position)}</p>
          <div className="my-5 border-t border-dashed" />
          <p className="text-sm font-bold text-muted-foreground">Tiempo estimado</p>
          <p className="text-3xl font-extrabold tabular-nums">{etaText(eta)}</p>
        </CardContent>
      </Card>
      <p className="px-1 text-sm text-muted-foreground">
        Mantén esta página abierta. El anfitrión te llamará al{' '}
        <span className="font-bold text-foreground">{phoneDisplay}</span> cuando tu mesa esté lista.
      </p>
      <Button variant="outline" size="lg" disabled={offline} onClick={onLeave}>
        Ya no voy
      </Button>
    </>
  )
}
