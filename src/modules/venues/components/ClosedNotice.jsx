import { Clock } from 'lucide-react'

import { Card, CardContent } from '@/components/ui/card'
import { closedNotice } from '../domain/opening'

/** Lo que ve el comensal cuando no puede unirse (cerrada o en pausa). */
export function ClosedNotice({ status }) {
  const notice = closedNotice(status)
  if (!notice) return null
  return (
    <Card className="shadow-[0_16px_36px_-18px_rgba(24,24,24,0.45)]">
      <CardContent className="flex items-start gap-4 p-5">
        <div className="rounded-2xl bg-warning-soft p-3 text-warning">
          <Clock className="size-6" aria-hidden="true" />
        </div>
        <div>
          <p className="text-lg leading-tight font-extrabold">{notice.title}</p>
          <p className="mt-1 text-sm text-muted-foreground">{notice.text}</p>
        </div>
      </CardContent>
    </Card>
  )
}
