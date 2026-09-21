import { api } from '@/services/api'

export const login = (credentials) => api.post('/auth/login', credentials)
export const logout = () => api.post('/auth/logout', undefined, { auth: true })
