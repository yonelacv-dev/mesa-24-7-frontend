import { minutesSince, serverNow } from '@/shared/utils/time'
import { plural } from '@/shared/utils/plural'

/** "Domingo" — el día de la semana en la zona horaria del local. */
export function dayLabel(serverTime, timeZone) {
  const label = new Intl.DateTimeFormat('es', { weekday: 'long', timeZone }).format(new Date(serverTime))
  return label.charAt(0).toUpperCase() + label.slice(1)
}

/** "4 esperando y 1 llamado" */
export function countsText(waiting, called) {
  const calledPart = called > 0 ? ` y ${called} ${plural(called, 'llamado', 'llamados')}` : ''
  return `${waiting} esperando${calledPart}`
}

export function waitedText(joinedAt, offsetMs, nowMs) {
  const minutes = minutesSince(joinedAt, serverNow(offsetMs, nowMs))
  return minutes < 1 ? 'Recién llegó' : `${minutes} min esperando`
}

/** Chips de estado de una fila. tone: neutral | warning | danger | success */
export function rowChips(row, holdMinutes, offsetMs, nowMs) {
  const now = serverNow(offsetMs, nowMs)
  if (row.status !== 'called') return [{ key: 'status', label: 'Esperando', tone: 'neutral' }]

  const minutes = minutesSince(row.called_at, now)
  const chips = [
    {
      key: 'status',
      label: minutes < 1 ? 'Llamado ahora' : `Llamado hace ${minutes} min`,
      tone: 'warning',
    },
  ]
  if (row.hold_ends_at && now > Date.parse(row.hold_ends_at)) {
    chips.push({ key: 'overdue', label: `Pasó los ${holdMinutes} min`, tone: 'danger' })
  }
  if (row.on_the_way) chips.push({ key: 'on_the_way', label: 'En camino', tone: 'success' })
  return chips
}

export function isOverdue(row, offsetMs, nowMs) {
  return Boolean(
    row.status === 'called' && row.hold_ends_at && serverNow(offsetMs, nowMs) > Date.parse(row.hold_ends_at),
  )
}
