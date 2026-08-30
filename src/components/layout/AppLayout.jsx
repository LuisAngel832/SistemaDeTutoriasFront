import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'
import { getSesion, suscribirSesion } from '../../utils/sesion'
import '../../assets/css/components/sidebar.css'

const MENU_POR_ROL = {
  tutor: {
    seccion: 'Panel del tutor',
    brandTo: '/tutor/home',
    items: [
      { to: '/tutor/home', label: 'Mis Tutorias', icon: 'tutorias', end: true },
      { to: '/tutor/crear', label: 'Crear Tutoria', icon: 'crear' },
      { to: '/tutor/agregar-horario', label: 'Crear Horario', icon: 'horario' },
    ],
  },
  tutorado: {
    seccion: 'Panel del tutorado',
    brandTo: '/tutorado/home',
    items: [
      { to: '/tutorado/home', label: 'Explorar Tutorias', icon: 'explorar', end: true },
      { to: '/tutorado/tutorias', label: 'Mis Tutorias', icon: 'misTutorias' },
    ],
  },
}

const STORAGE_KEY = 'sidebarCollapsed'

const AppLayout = ({ children, className = '' }) => {
  const location = useLocation()
  const [collapsed, setCollapsed] = useState(
    () => localStorage.getItem(STORAGE_KEY) === 'true',
  )
  const [mobileOpen, setMobileOpen] = useState(false)
  const [sesion, setSesion] = useState(getSesion)

  const { nombre, matricula, rol } = sesion
  const menu = MENU_POR_ROL[rol] ?? MENU_POR_ROL.tutorado

  const activo = menu.items.find((item) =>
    item.end
      ? location.pathname === item.to
      : location.pathname.startsWith(item.to),
  )

  // El nombre puede completarse despues del login (ver utils/sesion).
  useEffect(() => suscribirSesion(() => setSesion(getSesion())), [])

  useEffect(() => {
    setMobileOpen(false)
  }, [location.pathname])

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape') setMobileOpen(false)
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [])

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [mobileOpen])

  const toggleCollapse = () => {
    setCollapsed((valor) => {
      localStorage.setItem(STORAGE_KEY, String(!valor))
      return !valor
    })
  }

  return (
    <div className={`app-shell${collapsed ? ' collapsed' : ''}`}>
      <Sidebar
        items={menu.items}
        brandTo={menu.brandTo}
        seccion={menu.seccion}
        nombre={nombre}
        matricula={matricula}
        rol={rol}
        collapsed={collapsed}
        onToggleCollapse={toggleCollapse}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />

      {mobileOpen ? (
        <div
          className="sidebar-overlay"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      ) : null}

      <div className={`app-content${className ? ` ${className}` : ''}`}>
        <header className="app-topbar">
          <button
            type="button"
            className="topbar-burger"
            onClick={() => setMobileOpen(true)}
            aria-label="Abrir menu"
            aria-expanded={mobileOpen}
            aria-controls="app-sidebar"
          >
            <span />
            <span />
            <span />
          </button>
          <span className="topbar-title">
            {activo?.label ?? 'Sistema de Tutorias'}
          </span>
        </header>

        {children}
      </div>
    </div>
  )
}

export default AppLayout
