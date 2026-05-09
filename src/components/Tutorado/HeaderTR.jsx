import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import './HeaderTR.css'

const HeaderTR = () => {
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setMenuOpen(false)
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [])

  return (
    <>
      <header className="header-tutorado">
        <button className="menu-button" onClick={() => setMenuOpen(true)} aria-label="Abrir menu">
          <span></span>
          <span></span>
          <span></span>
        </button>
        <p className="header-title">Panel Tutorado</p>
      </header>

      {menuOpen ? <div className="overlay" onClick={() => setMenuOpen(false)}></div> : null}

      <aside className={`sidebar left ${menuOpen ? 'open' : ''}`}>
        <nav>
          <button className="menu-button" onClick={() => setMenuOpen(false)} aria-label="Cerrar menu">
            <span></span>
            <span></span>
            <span></span>
          </button>

          <Link to="/tutorado/home">
            <button type="button" onClick={() => setMenuOpen(false)}>
              Explorar
            </button>
          </Link>

          <Link to="/tutorado/tutorias">
            <button type="button" onClick={() => setMenuOpen(false)}>
              Mis tutorias
            </button>
          </Link>
        </nav>
      </aside>
    </>
  )
}

export default HeaderTR
