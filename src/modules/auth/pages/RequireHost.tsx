import { Navigate, Outlet } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import { PageState } from '@/shared/components/PageState'
import { useRequiredParam } from '@/shared/hooks/useRequiredParam'
import { belongsToVenue } from '../domain/roles'
import { useLogout } from '../hooks/useLogout'
import { useSession } from '../hooks/useSession'

/** Guarda de las rutas del anfitrión: exige sesión y que la cuenta pertenezca al local de la ruta. */
export default function RequireHost() {
  const slug = useRequiredParam('slug')
  const session = useSession()
  const logout = useLogout()

  if (!session) return <Navigate to={`/venues/${slug}/host/login`} replace />
  if (!belongsToVenue(session, slug)) {
    return (
      <PageState
        title="Esta cuenta es de otro local"
        text={`Iniciaste sesión en ${session.user.venue.name}. Para operar aquí, entra con la cuenta de este local.`}
        action={<Button onClick={() => logout.mutate()}>Cerrar sesión</Button>}
      />
    )
  }
  return <Outlet />
}
