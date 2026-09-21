import { Suspense } from 'react'
import { Navigate, useParams } from 'react-router-dom'

import { PageState } from '@/shared/components/PageState'

export function Lazy({ children }) {
  return <Suspense fallback={<PageState title="Cargando…" />}>{children}</Suspense>
}

export function ToDiner() {
  const { slug } = useParams()
  return <Navigate to={`/venues/${slug}/diner`} replace />
}
