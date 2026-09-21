import { lazy } from 'react'
import { createBrowserRouter } from 'react-router-dom'

import { PageState } from '@/shared/components/PageState'
import { Lazy, ToDiner } from './RouteHelpers'

// Cada página se carga bajo demanda: el celular del comensal no descarga el código de la tablet.
const JoinPage = lazy(() => import('@/modules/waitlist/pages/diner/JoinPage'))
const TurnPage = lazy(() => import('@/modules/waitlist/pages/diner/TurnPage'))
const QueuePage = lazy(() => import('@/modules/waitlist/pages/host/QueuePage'))
const LoginPage = lazy(() => import('@/modules/auth/pages/LoginPage'))
const RequireHost = lazy(() => import('@/modules/auth/pages/RequireHost'))

const notFound = <PageState title="No encontramos esta página" text="Escanea el código QR del local para unirte a la lista." />

/**
 * Las rutas espejan la API del back: /venues/:slug y luego la audiencia (diner o host).
 *   /venues/:slug/diner                  pantalla 1: unirse
 *   /venues/:slug/diner/turn/:token      pantalla 2: tu turno
 *   /venues/:slug/host/login             login de la tablet
 *   /venues/:slug/host                   pantalla 4: la cola
 */
export const router = createBrowserRouter([
  { path: '/', element: notFound },
  { path: '/venues/:slug', element: <ToDiner /> },
  { path: '/venues/:slug/diner', element: <Lazy><JoinPage /></Lazy> },
  { path: '/venues/:slug/diner/turn/:token', element: <Lazy><TurnPage /></Lazy> },
  { path: '/venues/:slug/host/login', element: <Lazy><LoginPage /></Lazy> },
  {
    path: '/venues/:slug/host',
    element: <Lazy><RequireHost /></Lazy>,
    children: [{ index: true, element: <Lazy><QueuePage /></Lazy> }],
  },
  { path: '*', element: notFound },
])
