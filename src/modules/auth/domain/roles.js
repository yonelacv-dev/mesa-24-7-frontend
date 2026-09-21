/** ¿La sesión pertenece al local de la ruta? El anfitrión solo opera en el local de su cuenta. */
export function belongsToVenue(session, slug) {
  return Boolean(session?.user?.venue?.slug === slug)
}
