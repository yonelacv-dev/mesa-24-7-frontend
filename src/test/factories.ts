import type { EntryFeed, HostRow, ListStatus, Session } from '@/shared/types'

/** Fábricas de datos de prueba: completas y tipadas, con `overrides` para lo que cada test necesita. */

export const makeListStatus = (overrides: Partial<ListStatus> = {}): ListStatus => ({
  kind: 'open',
  closes_at: null,
  next_open: null,
  ...overrides,
})

export const makeRow = (overrides: Partial<HostRow> = {}): HostRow => ({
  id: 1,
  ticket: 6,
  name: 'Carla',
  party_size: 2,
  phone_e164: '+51987654321',
  phone_display: '+51 987 654 321',
  status: 'waiting',
  joined_at: '2026-09-19T01:00:00Z',
  called_at: null,
  hold_ends_at: null,
  hold_expired: false,
  on_the_way: false,
  ...overrides,
})

export const makeSession = (slug = 'la-terraza-azul'): Session => ({
  token: 't',
  user: { id: 1, username: 'terraza-azul', venue: { slug, name: 'La Terraza Azul' } },
})

export const makeEntryFeed = (overrides: Partial<EntryFeed> = {}): EntryFeed => ({
  kind: 'joined',
  entry_id: 1,
  ticket: 6,
  name: 'Carla',
  party_size: 2,
  phone_e164: '+51987118402',
  phone_display: '+51 987 118 402',
  ...overrides,
})
