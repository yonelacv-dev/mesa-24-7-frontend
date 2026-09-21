import { useState } from 'react'

import { loadTurn } from '../services/turn.storage'

/** Token recordado para este local (se lee una vez al abrir la página). */
export function useSavedTurn(slug: string): string | null {
  const [token] = useState(() => loadTurn(slug))
  return token
}
