import { Navigate, useNavigate, useParams } from 'react-router-dom'

import { Card, CardContent } from '@/components/ui/card'
import { belongsToVenue } from '../domain/roles'
import { useLogin } from '../hooks/useLogin'
import { useSession } from '../hooks/useSession'
import { LoginForm } from '../components/LoginForm'
import { Hero } from '@/shared/components/Hero'
import { messageFor } from '@/shared/constants/errors'

export default function LoginPage() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const session = useSession()
  const login = useLogin()

  if (belongsToVenue(session, slug)) return <Navigate to={`/venues/${slug}/host`} replace />

  const onSubmit = (credentials) =>
    login.mutate(credentials, {
      onSuccess: ({ user }) => navigate(`/venues/${user.venue.slug}/host`, { replace: true }),
    })

  return (
    <main className="mx-auto min-h-dvh w-full max-w-md bg-background pb-8">
      <Hero>
        <p className="text-sm font-bold text-ink-muted">Anfitrión</p>
        <h1 className="mt-1 text-3xl font-extrabold tracking-tight">Iniciar sesión</h1>
      </Hero>
      <div className="relative z-10 -mt-8 px-4">
        <Card className="rounded-2xl shadow-[0_16px_36px_-18px_rgba(24,24,24,0.45)]">
          <CardContent className="p-5">
            <LoginForm
              onSubmit={onSubmit}
              pending={login.isPending}
              errorMessage={login.error ? messageFor(login.error) : null}
            />
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
