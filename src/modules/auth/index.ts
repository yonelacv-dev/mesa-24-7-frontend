/** API pública del módulo auth. Las páginas no se exportan: el router las carga bajo demanda. */
export { belongsToVenue } from './domain/roles'
export { useLogout } from './hooks/useLogout'
export { useSession } from './hooks/useSession'
export { setupAuth } from './services/setup'
