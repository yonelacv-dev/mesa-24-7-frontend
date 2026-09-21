import type { EntryStatus, HostAction, HostRow } from '@/shared/types'

export const ACTIVE_STATUSES: EntryStatus[] = ['waiting', 'called']

export const isActive = (status: EntryStatus): status is 'waiting' | 'called' => ACTIVE_STATUSES.includes(status)

/** Los cuatro finales. Desde ellos no se puede volver a ningún otro estado. */
export type EndedStatus = Exclude<EntryStatus, 'waiting' | 'called'>

export const ENDED_COPY: Record<EndedStatus, { title: string; text: string }> = {
  seated: { title: 'Buen provecho', text: 'Ya estás sentado. Gracias por esperar.' },
  cancelled: {
    title: 'Saliste de la lista',
    text: 'Si quieres volver, únete de nuevo. Entrarás al final de la cola.',
  },
  no_show: {
    title: 'Tu turno venció',
    text: 'Te llamaron y no llegaste a tiempo. Habla con el anfitrión o únete de nuevo.',
  },
  removed: {
    title: 'El anfitrión te sacó de la lista',
    text: 'Si crees que fue un error, habla con el anfitrión en la entrada.',
  },
}

/** Quien terminó sentado ya cenó; los demás pueden volver a unirse. */
export const canRejoin = (status: EntryStatus): boolean => !isActive(status) && status !== 'seated'

/** Acciones que la tablet ofrece según el estado de la fila. */
export function hostActions(status: EntryStatus): HostAction[] {
  if (status === 'waiting') return ['call', 'remove']
  if (status === 'called') return ['seat', 'no-show']
  return []
}

export const ACTION_LABELS: Record<HostAction, string> = {
  call: 'Llamar',
  remove: 'Quitar',
  seat: 'Sentar',
  'no-show': 'No vino',
}

/** Solo estas dos piden confirmación; llamar y sentar no. */
type RowInfo = Pick<HostRow, 'name' | 'ticket'>

const CONFIRMATIONS: Partial<
  Record<HostAction, { title: string; confirmLabel: string; description: (row: RowInfo) => string }>
> = {
  remove: {
    title: '¿Quitar de la lista?',
    confirmLabel: 'Quitar',
    description: (row: RowInfo) => `${row.name} saldrá de la lista y su ticket #${row.ticket} quedará cerrado.`,
  },
  'no-show': {
    title: '¿Marcar como no vino?',
    confirmLabel: 'Marcar no vino',
    description: (row: RowInfo) =>
      `${row.name} no llegó a tiempo. Su lugar se libera y tendrá que unirse de nuevo si aparece.`,
  },
}

export function confirmationFor(
  action: HostAction,
  row: RowInfo,
): { title: string; confirmLabel: string; description: string } | null {
  const config = CONFIRMATIONS[action]
  return config
    ? { title: config.title, confirmLabel: config.confirmLabel, description: config.description(row) }
    : null
}
