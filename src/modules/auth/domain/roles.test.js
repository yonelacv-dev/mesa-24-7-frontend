import { belongsToVenue } from './roles'

const session = { token: 't', user: { venue: { slug: 'la-terraza-azul' } } }

describe('belongsToVenue', () => {
  it('solo coincide con el local de la cuenta', () => {
    expect(belongsToVenue(session, 'la-terraza-azul')).toBe(true)
    expect(belongsToVenue(session, 'cuatro-vientos')).toBe(false)
  })

  it('sin sesión no pertenece a ninguno', () => {
    expect(belongsToVenue(null, 'la-terraza-azul')).toBe(false)
  })
})
