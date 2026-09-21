import { WEEKDAYS } from '@/shared/constants/weekdays'
import type { ListStatus, NextOpen } from '@/shared/types'

/** "La lista abre hoy a las 11:00." / "mañana" / "el jueves". */
export function opensText(nextOpen: NextOpen | null): string {
  if (!nextOpen) return 'Este local no tiene lista de espera activa.'
  if (nextOpen.day_offset === 0) return `La lista abre hoy a las ${nextOpen.time}.`
  if (nextOpen.day_offset === 1) return `La lista abre mañana a las ${nextOpen.time}.`
  return `La lista abre el ${WEEKDAYS[nextOpen.weekday].toLowerCase()} a las ${nextOpen.time}.`
}

/** Aviso que ve el comensal cuando no puede unirse. Devuelve null si la lista está abierta. */
export function closedNotice(status: ListStatus): { title: string; text: string } | null {
  if (status.kind === 'paused') {
    return {
      title: 'La lista está en pausa',
      text: 'El local dejó de recibir comensales por ahora. Pregunta al anfitrión en la entrada.',
    }
  }
  if (status.kind === 'closed') {
    return { title: 'La lista de espera está cerrada', text: opensText(status.next_open) }
  }
  return null
}

/** Chip de estado de la lista en la cabecera de la tablet. */
export function listStatusBadge(status: ListStatus): { label: string; tone: 'open' | 'paused' | 'closed' } {
  if (status.kind === 'open') return { label: `Abierta hasta las ${status.closes_at}`, tone: 'open' }
  if (status.kind === 'paused') return { label: 'En pausa', tone: 'paused' }
  return { label: 'Cerrada', tone: 'closed' }
}

/** Texto bajo la cabecera cuando la lista está cerrada; null si no aplica. */
export function hostClosedText(status: ListStatus, peopleInList: number): string | null {
  if (status.kind !== 'closed') return null
  const attending = peopleInList > 0 ? ' Se sigue atendiendo a los que ya están en la lista.' : ''
  return `${opensText(status.next_open)}${attending}`
}
