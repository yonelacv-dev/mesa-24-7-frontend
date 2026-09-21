import type { Session } from '@/shared/types'

/** ¿La sesión pertenece al local de la ruta? El anfitrión solo opera en el local de su cuenta. */
export function belongsToVenue(session: Session | null, slug: string): boolean {
  return Boolean(session?.user?.venue?.slug === slug)
}
