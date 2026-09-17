import { useRouteError } from 'react-router-dom'
import './sistema.css'

// Error inesperado al renderizar o al descargar una pagina (p. ej. tras un nuevo despliegue).
// No usa el contexto de sesion porque puede mostrarse fuera de AuthProvider.
const PaginaError = () => {
  const error = useRouteError()

  if (import.meta.env.DEV) {
    console.error(error)
  }

  return (
    <main className="sistema-page">
      <section className="sistema-card" role="alert">
        <p className="sistema-codigo">Ups</p>
        <h1 className="sistema-titulo">Algo salio mal</h1>
        <p className="sistema-texto">
          Ocurrio un error inesperado al mostrar esta pagina. Intenta de nuevo; si el problema
          continua, vuelve al inicio.
        </p>
        <div className="sistema-acciones">
          <button
            type="button"
            className="sistema-btn primario"
            onClick={() => window.location.reload()}
          >
            Reintentar
          </button>
          {/* Recarga completa: reinicia el estado de la aplicacion. */}
          <a href="/" className="sistema-btn">
            Ir al inicio
          </a>
        </div>
      </section>
    </main>
  )
}

export default PaginaError
