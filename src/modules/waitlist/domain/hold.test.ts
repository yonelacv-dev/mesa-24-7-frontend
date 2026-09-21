import { holdCountdown, holdRemainingMs } from './hold'

const ends = '2026-09-19T01:10:00Z'
const at = (time: string) => Date.parse(`2026-09-19T${time}Z`)

describe('plazo tras llamar', () => {
  it('cuenta con el reloj del servidor, no con el del celular', () => {
    // El celular va 30 s atrasado: cree que son las 01:04:30 cuando el servidor marca 01:05:00.
    expect(holdRemainingMs(ends, 30_000, at('01:04:30'))).toBe(5 * 60_000)
  })

  it('formatea m:ss y avisa cuando se agotó', () => {
    expect(holdCountdown(ends, 0, at('01:00:00'))).toEqual({ expired: false, text: '10:00' })
    expect(holdCountdown(ends, 0, at('01:09:59'))).toEqual({ expired: false, text: '0:01' })
    expect(holdCountdown(ends, 0, at('01:10:00'))).toEqual({ expired: true, text: '0:00' })
    expect(holdCountdown(ends, 0, at('01:15:00'))).toEqual({ expired: true, text: '0:00' })
  })
})
