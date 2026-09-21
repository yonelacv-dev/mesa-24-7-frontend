import { closedNotice, hostClosedText, listStatusBadge, opensText } from './opening'

describe('opensText', () => {
  it.each([
    [{ day_offset: 0, weekday: 4, time: '11:00' }, 'La lista abre hoy a las 11:00.'],
    [{ day_offset: 1, weekday: 5, time: '09:30' }, 'La lista abre mañana a las 09:30.'],
    [{ day_offset: 3, weekday: 3, time: '11:00' }, 'La lista abre el jueves a las 11:00.'],
    [{ day_offset: 7, weekday: 0, time: '19:00' }, 'La lista abre el lunes a las 19:00.'],
    [null, 'Este local no tiene lista de espera activa.'],
  ])('%j', (nextOpen, text) => {
    expect(opensText(nextOpen)).toBe(text)
  })
})

describe('closedNotice', () => {
  it('no hay aviso si la lista está abierta', () => {
    expect(closedNotice({ kind: 'open', closes_at: '01:00' })).toBeNull()
  })

  it('en pausa explica que pregunte al anfitrión', () => {
    expect(closedNotice({ kind: 'paused' })).toEqual({
      title: 'La lista está en pausa',
      text: 'El local dejó de recibir comensales por ahora. Pregunta al anfitrión en la entrada.',
    })
  })

  it('cerrada dice cuándo abre', () => {
    const notice = closedNotice({ kind: 'closed', next_open: { day_offset: 0, weekday: 4, time: '11:00' } })
    expect(notice.title).toBe('La lista de espera está cerrada')
    expect(notice.text).toBe('La lista abre hoy a las 11:00.')
  })
})

describe('listStatusBadge', () => {
  it('describe cada estado', () => {
    expect(listStatusBadge({ kind: 'open', closes_at: '01:00' })).toEqual({
      label: 'Abierta hasta las 01:00',
      tone: 'open',
    })
    expect(listStatusBadge({ kind: 'paused' }).label).toBe('En pausa')
    expect(listStatusBadge({ kind: 'closed' }).label).toBe('Cerrada')
  })
})

describe('hostClosedText', () => {
  const closed = { kind: 'closed', next_open: { day_offset: 1, weekday: 5, time: '11:00' } }

  it('no dice nada si no está cerrada', () => {
    expect(hostClosedText({ kind: 'open' }, 3)).toBeNull()
  })

  it('añade que se sigue atendiendo si aún hay gente', () => {
    expect(hostClosedText(closed, 2)).toBe(
      'La lista abre mañana a las 11:00. Se sigue atendiendo a los que ya están en la lista.',
    )
    expect(hostClosedText(closed, 0)).toBe('La lista abre mañana a las 11:00.')
  })
})
