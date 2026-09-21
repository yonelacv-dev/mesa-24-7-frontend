import { useParams } from 'react-router-dom'

/** Parámetro de ruta que la ruta garantiza (p. ej. :slug). Falla claro si el router está mal configurado. */
export function useRequiredParam(name: string): string {
  const value = useParams()[name]
  if (!value) throw new Error(`Falta el parámetro de ruta :${name}`)
  return value
}
