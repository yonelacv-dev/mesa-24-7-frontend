import { useEffect, useState } from 'react'

/** Reloj que se actualiza cada `intervalMs`: para cuentas regresivas y "hace N min". */
export function useNow(intervalMs = 1000) {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), intervalMs)
    return () => clearInterval(id)
  }, [intervalMs])
  return now
}
