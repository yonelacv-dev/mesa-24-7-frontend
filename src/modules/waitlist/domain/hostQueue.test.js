import { countsText, dayLabel, isOverdue, rowChips, waitedText } from './hostQueue'

const at = (time) => Date.parse(`2026-09-19T${time}Z`)
const called = { status: 'called', called_at: '2026-09-19T01:00:00Z', hold_ends_at: '2026-09-19T01:10:00Z', on_the_way: false }

describe('cabecera', () => {
  it('dice el día en la zona horaria del local', () => {
    // 01:00 UTC del sábado 19 es viernes 20:00 en Lima
    expect(dayLabel('2026-09-19T01:00:00Z', 'America/Lima')).toBe('Viernes')
    expect(dayLabel('2026-09-19T01:00:00Z', 'UTC')).toBe('Sábado')
  })

  it.each([
    [4, 1, '4 esperando y 1 llamado'],
    [3, 2, '3 esperando y 2 llamados'],
    [5, 0, '5 esperando'],
    [0, 0, '0 esperando'],
  ])('%i esperando, %i llamados', (waiting, calledCount, text) => {
    expect(countsText(waiting, calledCount)).toBe(text)
  })
})

describe('waitedText', () => {
  it('recién llegó bajo el minuto; luego cuenta minutos', () => {
    expect(waitedText('2026-09-19T01:00:00Z', 0, at('01:00:40'))).toBe('Recién llegó')
    expect(waitedText('2026-09-19T01:00:00Z', 0, at('01:15:10'))).toBe('15 min esperando')
  })
})

describe('chips de una fila', () => {
  it('esperando muestra un solo chip neutro', () => {
    expect(rowChips({ status: 'waiting' }, 10, 0, at('01:00:00'))).toEqual([
      { key: 'status', label: 'Esperando', tone: 'neutral' },
    ])
  })

  it('llamado ahora, y luego hace N min', () => {
    expect(rowChips(called, 10, 0, at('01:00:30'))[0].label).toBe('Llamado ahora')
    expect(rowChips(called, 10, 0, at('01:04:10'))[0].label).toBe('Llamado hace 4 min')
  })

  it('pasado el plazo suma el aviso "Pasó los 10 min"', () => {
    const chips = rowChips(called, 10, 0, at('01:10:01'))
    expect(chips.map((c) => c.key)).toEqual(['status', 'overdue'])
    expect(chips[1]).toEqual({ key: 'overdue', label: 'Pasó los 10 min', tone: 'danger' })
    expect(rowChips(called, 10, 0, at('01:10:00'))).toHaveLength(1)
  })

  it('muestra "En camino" además del estado', () => {
    const chips = rowChips({ ...called, on_the_way: true }, 10, 0, at('01:03:00'))
    expect(chips.map((c) => c.label)).toEqual(['Llamado hace 3 min', 'En camino'])
  })

  it('el plazo respeta el plazo configurado del local', () => {
    const custom = { ...called, hold_ends_at: '2026-09-19T01:05:00Z' }
    expect(rowChips(custom, 5, 0, at('01:06:00'))[1].label).toBe('Pasó los 5 min')
  })
})

describe('isOverdue', () => {
  it('solo un llamado con el plazo vencido', () => {
    expect(isOverdue(called, 0, at('01:11:00'))).toBe(true)
    expect(isOverdue(called, 0, at('01:05:00'))).toBe(false)
    expect(isOverdue({ status: 'waiting' }, 0, at('01:11:00'))).toBe(false)
  })
})
