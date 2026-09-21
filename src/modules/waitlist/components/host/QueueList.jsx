import { Card, CardContent } from '@/components/ui/card'
import { QueueRow } from './QueueRow'

/** La lista por orden de llegada, con esperando y llamados mezclados. */
export function QueueList({ rows, holdMinutes, offsetMs, now, offline, busyEntryId, onAction }) {
  if (rows.length === 0) {
    return (
      <Card>
        <CardContent className="px-5 py-10 text-center">
          <p className="text-lg font-extrabold">Aún no hay nadie en la lista</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Los comensales aparecen aquí apenas se unen con el QR.
          </p>
        </CardContent>
      </Card>
    )
  }
  return (
    <Card className="overflow-hidden p-0">
      <ul className="divide-y">
        {rows.map((row) => (
          <QueueRow
            key={row.id}
            row={row}
            holdMinutes={holdMinutes}
            offsetMs={offsetMs}
            now={now}
            offline={offline}
            busy={busyEntryId === row.id}
            onAction={onAction}
          />
        ))}
      </ul>
    </Card>
  )
}
