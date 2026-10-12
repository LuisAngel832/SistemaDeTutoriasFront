import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { z } from 'zod'
import '@fontsource-variable/montserrat'
import '@/styles/tokens.css'
import '@/styles/animations.css'
import '@/styles/global.css'
import { crearRouter } from './router'

// Sin el modo JIT de Zod (usa new Function), que la CSP sin 'unsafe-eval' reporta como violacion.
z.config({ jitless: true })

const router = crearRouter()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
