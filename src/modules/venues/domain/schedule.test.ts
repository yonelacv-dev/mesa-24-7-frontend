import { crossesMidnight, dayError, scheduleIsValid, toDraft, toRequestBody } from './schedule'

const day = (start: string, end: string, is_open = true) => ({ is_open, start, end })

describe('crossesMidnight', () => {
  it('cierre menor al inicio cruza la medianoche', () => {
    expect(crossesMidnight(day('19:00', '01:00'))).toBe(true)
    expect(crossesMidnight(day('11:00', '01:00'))).toBe(true)
  })

  it('el mismo día no cruza', () => {
    expect(crossesMidnight(day('11:00', '23:00'))).toBe(false)
  })

  it('iguales no cruzan (es un error), y un día cerrado tampoco', () => {
    expect(crossesMidnight(day('11:00', '11:00'))).toBe(false)
    expect(crossesMidnight(day('19:00', '01:00', false))).toBe(false)
  })
})

describe('dayError', () => {
  it('inicio igual al cierre es el error del back', () => {
    expect(dayError(day('11:00', '11:00'))).toBe('schedule_start_equals_end')
  })

  it('un día abierto necesita ambas horas', () => {
    expect(dayError(day('', '01:00'))).toBe('time_required')
  })

  it('un día cerrado no se valida', () => {
    expect(dayError(day('11:00', '11:00', false))).toBeNull()
  })
})

describe('horario completo', () => {
  it('es válido solo si todos los días lo son', () => {
    expect(scheduleIsValid([day('11:00', '01:00'), day('11:00', '23:00')])).toBe(true)
    expect(scheduleIsValid([day('11:00', '01:00'), day('11:00', '11:00')])).toBe(false)
  })

  it('arma el cuerpo del PUT sin campos de más', () => {
    const schedule = [{ weekday: 0, is_open: true, start: '11:00', end: '01:00', crosses_midnight: true }]
    expect(toDraft(schedule)).toEqual([{ is_open: true, start: '11:00', end: '01:00' }])
    expect(toRequestBody(toDraft(schedule))).toEqual({ days: [{ is_open: true, start: '11:00', end: '01:00' }] })
  })
})
