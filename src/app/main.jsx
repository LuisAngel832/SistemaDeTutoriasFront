import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import '@fontsource-variable/montserrat'
import '@/styles/tokens.css'
import '@/styles/animations.css'
import '@/styles/global.css'
import { crearRouter } from './router'

const router = crearRouter()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
