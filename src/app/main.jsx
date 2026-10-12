import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import * as z from 'zod/mini'
import '@fontsource-variable/montserrat'
import '@/styles/tokens.css'
import '@/styles/animations.css'
import '@/styles/global.css'
import { iniciarMonitoreo } from './monitoreo'
import { crearRouter } from './router'

// Sin el modo JIT de Zod (usa new Function), que la CSP sin 'unsafe-eval' reporta como violacion.
z.config({ jitless: true })

// No bloquea el arranque: los errores previos a que cargue el SDK se envian despues.
iniciarMonitoreo({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  release: import.meta.env.VITE_RELEASE,
  entorno: import.meta.env.MODE,
})

const router = crearRouter()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
