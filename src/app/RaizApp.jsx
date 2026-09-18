import { useEffect } from 'react'
import { Outlet, ScrollRestoration, useMatches, useNavigation } from 'react-router-dom'
import { AuthProvider } from '../features/auth/AuthProvider'
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
  useTituloDocumento()

  return (
    <Providers>
      <AuthProvider>
        {navegacion.state !== 'idle' ? (
          <div className="barra-navegacion" role="progressbar" aria-label="Cargando página" />
        ) : null}
        <Outlet />
        <ScrollRestoration />
      </AuthProvider>
    </Providers>
  )
}
