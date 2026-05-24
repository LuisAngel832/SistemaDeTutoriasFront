import { NavLink, Link } from 'react-router-dom'
import useAutentificacion from '../../hooks/useAutentificacion'
import '../../assets/css/components/header.css'

const navLinks = [
  { to: '/tutor/home', label: 'Tutorias', end: true },
  { to: '/tutor/crear', label: 'Crear Tutoria' },
  { to: '/tutor/agregar-horario', label: 'Agregar Horario' },
]

const Header = () => {
  const { logout } = useAutentificacion()
  const nombre = localStorage.getItem('nombre') || ''

  return (
    <header className="header">
      <div className="header-content">
        <Link to="/tutor/home" className="header-brand">
          <span className="header-brand-dot" aria-hidden="true" />
          Sistema de Tutorias
        </Link>

        <nav className="header-nav" aria-label="Navegacion principal">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                `header-link${isActive ? ' header-link-active' : ''}`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="header-actions">
          {nombre ? <span className="header-user">Hola, {nombre}</span> : null}
          <button
            type="button"
            className="header-logout"
            onClick={logout}
          >
            Cerrar sesion
          </button>
        </div>
      </div>
    </header>
  )
}

export default Header
