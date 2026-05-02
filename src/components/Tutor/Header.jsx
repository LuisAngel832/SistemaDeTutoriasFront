import { Link } from 'react-router-dom'
import '../../assets/css/components/header.css'

const Header = () => {
  return (
    <header className="header">
      <div className="header-content">
        <Link to="/tutor/home" className="header-brand">
          Sistema de Tutorias
        </Link>

        <div className="header-buttons">
          <Link to="/tutor/home">
            <button type="button">Tutorias</button>
          </Link>
          <Link to="/tutor/crear">
            <button type="button">Crear Tutoria</button>
          </Link>
          <Link to="/tutor/agregar-horario">
            <button type="button">Agregar horario</button>
          </Link>
        </div>
      </div>
    </header>
  )
}

export default Header
