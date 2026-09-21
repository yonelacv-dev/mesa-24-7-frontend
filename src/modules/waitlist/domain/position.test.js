import { etaText, partyText, positionText } from './position'

describe('positionText', () => {
  it.each([
    [1, 'Eres el siguiente.'],
    [2, 'Hay 1 grupo delante de ti.'],
    [3, 'Hay 2 grupos delante de ti.'],
    [14, 'Hay 13 grupos delante de ti.'],
  ])('puesto %i', (position, text) => {
    expect(positionText(position)).toBe(text)
  })
})

describe('etaText / partyText', () => {
  it('muestra el rango', () => {
    expect(etaText({ min: 5, max: 10 })).toBe('5 a 10 min')
    expect(etaText({ min: 25, max: 35 })).toBe('25 a 35 min')
  })

  it('concuerda el número de personas', () => {
    expect(partyText(1)).toBe('1 persona')
    expect(partyText(2)).toBe('2 personas')
  })
})
