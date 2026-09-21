/** localStorage a prueba de fallos: en modo privado o con datos bloqueados lanza, y la app debe seguir. */
export function readJson<T = unknown>(key: string): T | null {
  try {
    const raw = window.localStorage.getItem(key)
    return raw === null ? null : (JSON.parse(raw) as T)
  } catch {
    return null
  }
}

export function writeJson(key: string, value: unknown): void {
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // sin almacenamiento: la sesión solo dura mientras la página esté abierta
  }
}

export function removeKey(key: string): void {
  try {
    window.localStorage.removeItem(key)
  } catch {
    // ídem
  }
}
