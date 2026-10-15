import { useEffect, useRef, useState } from 'react'
import { Outlet, useLocation, useMatches } from 'react-router-dom'
import { ID_CONTENIDO } from './Pagina'
import { Sidebar } from './Sidebar'
import { ROLES } from '@/constants/roles'
import { ROUTES } from '@/constants/routes'
import { useAuth } from '@/features/auth/AuthContext'
import { useUsuarioActual } from '@/features/auth/useUsuarioActual'
import './sidebar.css'

const MENU_POR_ROL = {
  [ROLES.TUTOR]: {
    seccion: 'Panel del tutor',
    brandTo: ROUTES.tutor.inicio,
    items: [
      { to: ROUTES.tutor.inicio, label: 'Mis tutorías', icon: 'tutorias', end: true },
      { to: ROUTES.tutor.nuevaTutoria, label: 'Crear tutoría', icon: 'crear' },
      { to: ROUTES.tutor.historial(), label: 'Historial de asistencia', icon: 'historial' },
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
  [ROLES.ADMIN]: {
    seccion: 'Panel de administración',
    brandTo: ROUTES.admin.inicio,
    items: [
      { to: ROUTES.admin.inicio, label: 'Tutorías', icon: 'cuadricula' },
      { to: ROUTES.admin.experiencias, label: 'Experiencias Educativas', icon: 'tutorias' },
      { to: ROUTES.admin.tutores, label: 'Tutores', icon: 'usuarios' },
    ],
  },
}

const STORAGE_KEY = 'sidebarCollapsed'
const ID_SIDEBAR = 'app-sidebar'

// Lleva el foco al contenido sin cambiar la URL (un href="#..." dispararia una navegacion).
const saltarAlContenido = (evento) => {
  const contenido = document.getElementById(ID_CONTENIDO)
  if (!contenido) return
  evento.preventDefault()
  contenido.focus()
}

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
  useUsuarioActual()
  const [collapsed, setCollapsed] = useState(leerPreferenciaColapsado)
  // El menu movil queda abierto solo en la ruta donde se abrio: al navegar se cierra solo.
  const [menuAbiertoEn, setMenuAbiertoEn] = useState(null)
  const mobileOpen = menuAbiertoEn === location.pathname
  const botonMenuRef = useRef(null)

  const menu = MENU_POR_ROL[rol] ?? MENU_POR_ROL[ROLES.TUTORADO]
  const titulo = matches.findLast((match) => match.handle?.titulo)?.handle.titulo

  const abrirMenu = () => setMenuAbiertoEn(location.pathname)
  const cerrarMenu = () => setMenuAbiertoEn(null)

  // Menu movil abierto: el foco pasa al primer enlace y el contenido queda inerte (`inert` mas
  // abajo), asi que Tab no sale del menu. Al cerrarse, el foco vuelve al boton que lo abrio.
  useEffect(() => {
    if (!mobileOpen) return undefined
    const sidebar = document.getElementById(ID_SIDEBAR)
    const botonMenu = botonMenuRef.current
    sidebar?.querySelector('.sidebar-nav a')?.focus()

    const handleEscape = (event) => {
      if (event.key === 'Escape') setMenuAbiertoEn(null)
    }
    document.addEventListener('keydown', handleEscape)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = ''
      const foco = document.activeElement
      if (!foco || foco === document.body || sidebar?.contains(foco)) botonMenu?.focus()
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
      <a href={`#${ID_CONTENIDO}`} className="saltar-contenido" onClick={saltarAlContenido}>
        Saltar al contenido
      </a>

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

      <div className="app-content" inert={mobileOpen}>
        <header className="app-topbar">
          <button
            ref={botonMenuRef}
            type="button"
            className="topbar-burger"
            onClick={abrirMenu}
            aria-label="Abrir menú"
            aria-expanded={mobileOpen}
            aria-controls={ID_SIDEBAR}
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
