/** localStorage a prueba de fallos: en modo privado o con datos bloqueados lanza, y la app debe seguir. */
export function readJson(key) {
  try {
    const raw = window.localStorage.getItem(key)
    return raw === null ? null : JSON.parse(raw)
  } catch {
    return null
  }
}

export function writeJson(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // sin almacenamiento: la sesión solo dura mientras la página esté abierta
  }
}

export function removeKey(key) {
  try {
    window.localStorage.removeItem(key)
  } catch {
    // ídem
  }
}
