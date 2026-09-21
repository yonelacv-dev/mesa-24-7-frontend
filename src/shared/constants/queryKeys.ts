/** Claves de caché de TanStack Query. Compartidas porque un módulo invalida lo que otro pobló. */
export const queryKeys = {
  venueStatus: (slug: string) => ['venue-status', slug] as const,
  entry: (slug: string, token: string) => ['entry', slug, token] as const,
  hostQueue: (slug: string) => ['host-queue', slug] as const,
}
