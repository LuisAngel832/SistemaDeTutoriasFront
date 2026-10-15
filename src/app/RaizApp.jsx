import { useEffect } from 'react'
import { Outlet, ScrollRestoration, useMatches, useNavigation } from 'react-router-dom'
import { AuthProvider } from '@/features/auth/AuthProvider'
import { Providers } from './providers'
import './app.css'

const NOMBRE_APP = 'Sistema de Tutorías'

// Titulo de la pestana a partir del `handle.titulo` de la ruta mas especifica.
const useTituloDocumento = () => {
  const matches = useMatches()
  const titulo = matches.findLast((match) => match.handle?.titulo)?.handle.titulo

  useEffect(() => {
    document.title = titulo ? `${titulo} · ${NOMBRE_APP}` : NOMBRE_APP
  }, [titulo])
}

export const RaizApp = () => {
  const navegacion = useNavigation()
  const cargando = navegacion.state !== 'idle'
  useTituloDocumento()

  return (
    <Providers>
      <AuthProvider>
        {/* La region existe siempre para que el lector de pantalla anuncie el cambio de texto. */}
        <div className="solo-lectores" role="status">
          {cargando ? 'Cargando página' : ''}
        </div>
        {cargando ? <div className="barra-navegacion" aria-hidden="true" /> : null}
        <Outlet />
        <ScrollRestoration />
      </AuthProvider>
    </Providers>
  )
}
