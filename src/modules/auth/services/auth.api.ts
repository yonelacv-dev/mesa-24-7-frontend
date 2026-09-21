import { api } from '@/services/api'
import type { Credentials, LoginResult } from '@/shared/types'

export const login = (credentials: Credentials) => api.post<LoginResult>('/auth/login', credentials)
export const logout = () => api.post<null>('/auth/logout', undefined, { auth: true })
