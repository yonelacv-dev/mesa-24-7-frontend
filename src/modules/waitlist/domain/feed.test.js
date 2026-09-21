import { feedMessage } from './feed'

const base = { entry_id: 1, ticket: 6, name: 'Carla', party_size: 2, phone_display: '+51 987 118 402' }

describe('avisos en vivo', () => {
  it('se unió', () => {
    expect(feedMessage({ ...base, kind: 'joined' })).toBe('Carla se unió: ticket #6, 2 personas.')
    expect(feedMessage({ ...base, kind: 'joined', party_size: 1 })).toBe('Carla se unió: ticket #6, 1 persona.')
  })

  it('llamado: trae el teléfono para marcar', () => {
    expect(feedMessage({ ...base, kind: 'called' })).toBe('Llamaste a Carla. Márcale al +51 987 118 402.')
    expect(feedMessage({ ...base, kind: 'called', name: 'Jorge P.' })).toBe(
      'Llamaste a Jorge P. Márcale al +51 987 118 402.',
    )
  })

  it('va en camino y salió de la lista', () => {
    expect(feedMessage({ ...base, kind: 'on_the_way' })).toBe('Carla va en camino (ticket #6).')
    expect(feedMessage({ ...base, kind: 'cancelled' })).toBe('Carla salió de la lista (ticket #6).')
  })

  it('los demás eventos no muestran aviso', () => {
    for (const kind of ['seated', 'no_show', 'removed', 'paused', 'resumed', 'schedule_updated']) {
      expect(feedMessage({ ...base, kind })).toBeNull()
    }
  })
})
