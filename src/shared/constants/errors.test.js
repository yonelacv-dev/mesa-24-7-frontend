import { messageFor } from './errors'

describe('messageFor', () => {
  it('traduce los códigos del back', () => {
    expect(messageFor({ code: 'list_closed' })).toBe('La lista de espera está cerrada.')
    expect(messageFor({ code: 'ticket_not_found' })).toBe(
      'No encontramos un ticket con esos datos. Revisa el número y el teléfono.',
    )
  })

  it('usa un texto genérico para códigos desconocidos o errores sin código', () => {
    expect(messageFor({ code: 'algo_nuevo' })).toMatch(/error inesperado/)
    expect(messageFor(null)).toMatch(/error inesperado/)
  })

  it('agrega cuánto esperar cuando hay demasiados intentos', () => {
    expect(messageFor({ code: 'rate_limited', retryAfter: 30 })).toMatch(/\(30 s\)$/)
  })
})
