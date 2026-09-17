import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import '@fontsource-variable/montserrat'
import './index.css'
import App from './App.jsx'
import { configureApi } from './api/client'

// Temporal: el token sigue en localStorage hasta que exista el contexto de autenticacion.
configureApi({ getToken: () => localStorage.getItem('token') })

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
