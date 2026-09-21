import { Suspense, type ReactNode } from 'react'
import { Navigate } from 'react-router-dom'

import { PageState } from '@/shared/components/PageState'
import { useRequiredParam } from '@/shared/hooks/useRequiredParam'

export function Lazy({ children }: { children: ReactNode }) {
  return <Suspense fallback={<PageState title="Cargando…" />}>{children}</Suspense>
}

export function ToDiner() {
  const slug = useRequiredParam('slug')
  return <Navigate to={`/venues/${slug}/diner`} replace />
}
