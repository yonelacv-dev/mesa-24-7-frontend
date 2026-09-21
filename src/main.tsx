import '@fontsource-variable/nunito'
import './index.css'

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import App from '@/App'
import { setupAuth } from '@/modules/auth'

setupAuth()

const rootElement = document.getElementById('root')
if (!rootElement) throw new Error('Falta el elemento #root en index.html')

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
