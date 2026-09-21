import { Check } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { canRejoin, ENDED_COPY, type EndedStatus } from '../../domain/entryStatus'

/** Estados finales: sentado, canceló, no vino o sacado. */
export function EndedCard({ status, onRejoin }: { status: EndedStatus; onRejoin: () => void }) {
  const copy = ENDED_COPY[status]
  return (
    <>
      <Card className="rounded-3xl shadow-[0_16px_36px_-18px_rgba(24,24,24,0.45)]">
        <CardContent className="px-5 py-8 text-center">
          {status === 'seated' && (
            <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-success-soft text-success">
              <Check className="size-6" aria-hidden="true" />
            </div>
          )}
          <h2 className="text-2xl font-extrabold tracking-tight">{copy.title}</h2>
          <p className="mt-2 text-sm text-muted-foreground">{copy.text}</p>
        </CardContent>
      </Card>
      {canRejoin(status) && (
        <Button size="lg" className="shadow-[0_10px_22px_-10px_hsl(var(--primary)/0.85)]" onClick={onRejoin}>
          Volver a unirme
        </Button>
      )}
    </>
  )
}
