import type { ApiError } from '@/services/api'

// Todas las consultas y mutaciones de la app fallan con ApiError: así `error.status` y `error.code` están tipados.
declare module '@tanstack/react-query' {
  interface Register {
    defaultError: ApiError
  }
}
