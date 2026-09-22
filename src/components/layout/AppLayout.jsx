import { useEffect, useState } from 'react'
import { Outlet, useLocation, useMatches } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { ROLES } from '@/constants/roles'
import { ROUTES } from '@/constants/routes'
import { useAuth } from '@/features/auth/AuthContext'
import './sidebar.css'

const MENU_POR_ROL = {
  [ROLES.TUTOR]: {
    seccion: 'Panel del tutor',
    brandTo: ROUTES.tutor.inicio,
    items: [
      { to: ROUTES.tutor.inicio, label: 'Mis tutorías', icon: 'tutorias', end: true },
      { to: ROUTES.tutor.nuevaTutoria, label: 'Crear tutoría', icon: 'crear' },
      { to: ROUTES.tutor.horarios, label: 'Crear horario', icon: 'horario' },
    ],
  },
  [ROLES.TUTORADO]: {
    seccion: 'Panel del tutorado',
    brandTo: ROUTES.tutorado.inicio,
    items: [
      { to: ROUTES.tutorado.inicio, label: 'Explorar tutorías', icon: 'explorar', end: true },
      { to: ROUTES.tutorado.inscripciones, label: 'Mis tutorías', icon: 'misTutorias' },
    ],
  },
}

const STORAGE_KEY = 'sidebarCollapsed'

const leerPreferenciaColapsado = () => {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'true'
  } catch {
    return false
  }
}

// Estructura de las paginas privadas: sidebar + contenido de la ruta activa.
export const AppLayout = () => {
  const location = useLocation()
  const matches = useMatches()
  const { nombre, matricula, rol } = useAuth()
  const [collapsed, setCollapsed] = useState(leerPreferenciaColapsado)
  // El menu movil queda abierto solo en la ruta donde se abrio: al navegar se cierra solo.
  const [menuAbiertoEn, setMenuAbiertoEn] = useState(null)
  const mobileOpen = menuAbiertoEn === location.pathname

  // El admin usa las pantallas del tutor, asi que comparte su menu.
  const menu = MENU_POR_ROL[rol === ROLES.ADMIN ? ROLES.TUTOR : rol] ?? MENU_POR_ROL[ROLES.TUTORADO]
  const titulo = matches.findLast((match) => match.handle?.titulo)?.handle.titulo

  const abrirMenu = () => setMenuAbiertoEn(location.pathname)
  const cerrarMenu = () => setMenuAbiertoEn(null)

  useEffect(() => {
    if (!mobileOpen) return undefined
    const handleEscape = (event) => {
      if (event.key === 'Escape') setMenuAbiertoEn(null)
    }
    document.addEventListener('keydown', handleEscape)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = ''
    }
  }, [mobileOpen])

  const toggleCollapse = () => {
    setCollapsed((valor) => {
      try {
        localStorage.setItem(STORAGE_KEY, String(!valor))
      } catch {
        // La preferencia solo dura hasta recargar.
      }
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
        onCloseMobile={cerrarMenu}
      />

      {mobileOpen ? (
        <div className="sidebar-overlay" onClick={cerrarMenu} aria-hidden="true" />
      ) : null}

      <div className="app-content">
        <header className="app-topbar">
          <button
            type="button"
            className="topbar-burger"
            onClick={abrirMenu}
            aria-label="Abrir menú"
            aria-expanded={mobileOpen}
            aria-controls="app-sidebar"
          >
            <span />
            <span />
            <span />
          </button>
          <span className="topbar-title">{titulo ?? 'Sistema de Tutorías'}</span>
        </header>

        <Outlet />
      </div>
    </div>
  )
}
