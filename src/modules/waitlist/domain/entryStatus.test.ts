import { canRejoin, confirmationFor, ENDED_COPY, hostActions, isActive } from './entryStatus'

describe('estados', () => {
  it('solo esperando y llamado están activos', () => {
    expect((['waiting', 'called'] as const).every((status) => isActive(status))).toBe(true)
    expect((['seated', 'cancelled', 'no_show', 'removed'] as const).some((status) => isActive(status))).toBe(false)
  })

  it('cada final tiene su texto', () => {
    expect(ENDED_COPY.seated.title).toBe('Buen provecho')
    expect(ENDED_COPY.cancelled.title).toBe('Saliste de la lista')
    expect(ENDED_COPY.no_show.title).toBe('Tu turno venció')
    expect(ENDED_COPY.removed.title).toBe('El anfitrión te sacó de la lista')
  })

  it('puede volver a unirse todo final menos sentado', () => {
    expect(canRejoin('cancelled')).toBe(true)
    expect(canRejoin('no_show')).toBe(true)
    expect(canRejoin('removed')).toBe(true)
    expect(canRejoin('seated')).toBe(false)
    expect(canRejoin('waiting')).toBe(false)
  })
})

describe('acciones de la tablet', () => {
  it('esperando se llama o se quita; llamado se sienta o no vino', () => {
    expect(hostActions('waiting')).toEqual(['call', 'remove'])
    expect(hostActions('called')).toEqual(['seat', 'no-show'])
  })

  it('un estado final no ofrece nada', () => {
    expect(hostActions('seated')).toEqual([])
    expect(hostActions('removed')).toEqual([])
  })
})

describe('confirmaciones', () => {
  const row = { name: 'Carla', ticket: 6 }

  it('quitar y no vino piden confirmar, con el texto del brief', () => {
    expect(confirmationFor('remove', row)).toEqual({
      title: '¿Quitar de la lista?',
      confirmLabel: 'Quitar',
      description: 'Carla saldrá de la lista y su ticket #6 quedará cerrado.',
    })
    expect(confirmationFor('no-show', row)?.description).toBe(
      'Carla no llegó a tiempo. Su lugar se libera y tendrá que unirse de nuevo si aparece.',
    )
  })

  it('llamar y sentar no piden confirmación', () => {
    expect(confirmationFor('call', row)).toBeNull()
    expect(confirmationFor('seat', row)).toBeNull()
  })
})
