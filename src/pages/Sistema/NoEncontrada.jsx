import { Link } from 'react-router-dom'
import { ROUTES } from '../../constants/routes'
import './sistema.css'

const NoEncontrada = () => (
  <main className="sistema-page">
    <section className="sistema-card">
      <p className="sistema-codigo">404</p>
      <h1 className="sistema-titulo">No encontramos esta página</h1>
      <p className="sistema-texto">
        Es posible que el enlace esté mal escrito o que la página ya no exista.
      </p>
      <div className="sistema-acciones">
        <Link to={ROUTES.inicio} className="sistema-btn primario">
          Ir al inicio
        </Link>
      </div>
    </section>
  </main>
)

export default NoEncontrada
