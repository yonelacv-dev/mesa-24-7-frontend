/** Claves de caché de TanStack Query. Compartidas porque un módulo invalida lo que otro pobló. */
export const queryKeys = {
  venueStatus: (slug) => ['venue-status', slug],
  entry: (slug, token) => ['entry', slug, token],
  hostQueue: (slug) => ['host-queue', slug],
}
