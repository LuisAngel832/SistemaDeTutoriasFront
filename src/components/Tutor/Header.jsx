import { Link } from 'react-router-dom'
import '../../assets/css/components/header.css'

const Header = () => {
  return (
    <header className="header">
      <div className="header-content">
        <Link className="header-brand" to="/tutor/home">
          Sistema de Tutorias
        </Link>

        <div className="header-buttons">
          <Link to="/tutor/home">
            <button type="button">Tutorias</button>
          </Link>
          <button type="button" disabled>
            Crear Tutoria
          </button>
          <button type="button" disabled>
            Agregar horario
          </button>
        </div>
      </div>
    </header>
  )
}

export default Header
