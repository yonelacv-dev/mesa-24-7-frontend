import { makeEntryFeed } from '@/test/factories'
import { feedMessage } from './feed'

describe('avisos en vivo', () => {
  it('se unió', () => {
    expect(feedMessage(makeEntryFeed({ kind: 'joined' }))).toBe('Carla se unió: ticket #6, 2 personas.')
    expect(feedMessage(makeEntryFeed({ kind: 'joined', party_size: 1 }))).toBe('Carla se unió: ticket #6, 1 persona.')
  })

  it('llamado: trae el teléfono para marcar', () => {
    expect(feedMessage(makeEntryFeed({ kind: 'called' }))).toBe('Llamaste a Carla. Márcale al +51 987 118 402.')
    expect(feedMessage(makeEntryFeed({ kind: 'called', name: 'Jorge P.' }))).toBe(
      'Llamaste a Jorge P. Márcale al +51 987 118 402.',
    )
  })

  it('va en camino y salió de la lista', () => {
    expect(feedMessage(makeEntryFeed({ kind: 'on_the_way' }))).toBe('Carla va en camino (ticket #6).')
    expect(feedMessage(makeEntryFeed({ kind: 'cancelled' }))).toBe('Carla salió de la lista (ticket #6).')
  })

  it('los demás eventos no muestran aviso', () => {
    for (const kind of ['seated', 'no_show', 'removed'] as const) {
      expect(feedMessage(makeEntryFeed({ kind }))).toBeNull()
    }
    for (const kind of ['paused', 'resumed', 'schedule_updated'] as const) {
      expect(feedMessage({ kind })).toBeNull()
    }
  })
})
