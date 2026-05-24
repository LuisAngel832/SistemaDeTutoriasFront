import { useEffect, useState } from 'react'
import { NavLink, Link, useLocation } from 'react-router-dom'
import useAutentificacion from '../../hooks/useAutentificacion'
import '../../assets/css/components/header.css'

const navLinks = [
  { to: '/tutorado/home', label: 'Explorar', end: true },
  { to: '/tutorado/tutorias', label: 'Mis Tutorias' },
]

const HeaderTR = () => {
  const { logout } = useAutentificacion()
  const nombre = localStorage.getItem('nombre') || ''
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    setMenuOpen(false)
  }, [location.pathname])

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape') setMenuOpen(false)
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [])

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [menuOpen])

  return (
    <>
      <header className="header">
        <div className="header-content">
          <Link to="/tutorado/home" className="header-brand">
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
            <button type="button" className="header-logout" onClick={logout}>
              Cerrar sesion
            </button>
          </div>

          <button
            type="button"
            className={`header-burger${menuOpen ? ' open' : ''}`}
            onClick={() => setMenuOpen((v) => !v)}
            aria-label={menuOpen ? 'Cerrar menu' : 'Abrir menu'}
            aria-expanded={menuOpen}
            aria-controls="header-mobile-menu"
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </header>

      {menuOpen ? (
        <div
          className="header-overlay"
          onClick={() => setMenuOpen(false)}
          aria-hidden="true"
        />
      ) : null}

      <aside
        id="header-mobile-menu"
        className={`header-drawer${menuOpen ? ' open' : ''}`}
        aria-hidden={!menuOpen}
      >
        {nombre ? (
          <div className="header-drawer-user">
            <span className="header-drawer-greet">Hola,</span>
            <strong>{nombre}</strong>
          </div>
        ) : null}

        <nav className="header-drawer-nav">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                `header-drawer-link${isActive ? ' active' : ''}`
              }
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <button type="button" className="header-drawer-logout" onClick={logout}>
          Cerrar sesion
        </button>
      </aside>
    </>
  )
}

export default HeaderTR
