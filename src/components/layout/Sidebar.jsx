import { Link, NavLink } from 'react-router-dom'
import useAutentificacion from '../../hooks/useAutentificacion'
import {
  IconClose,
  IconCollapse,
  IconCrear,
  IconExplorar,
  IconHorario,
  IconLogout,
  IconMisTutorias,
  IconTutorias,
} from './icons'

const iconsByName = {
  tutorias: IconTutorias,
  crear: IconCrear,
  horario: IconHorario,
  explorar: IconExplorar,
  misTutorias: IconMisTutorias,
}

const getIniciales = (texto) => {
  const partes = texto.trim().split(/\s+/).filter(Boolean)
  if (partes.length === 0) return '?'
  if (partes.length === 1) return partes[0].slice(0, 2).toUpperCase()
  return `${partes[0][0]}${partes[1][0]}`.toUpperCase()
}

const Sidebar = ({
  items,
  brandTo,
  seccion,
  nombre,
  matricula,
  rol,
  collapsed,
  onToggleCollapse,
  mobileOpen,
  onCloseMobile,
}) => {
  const { logout } = useAutentificacion()

  const nombreVisible = nombre || 'Usuario'
  const resumenUsuario = [nombre, matricula, rol].filter(Boolean).join(' - ')

  return (
    <aside
      id="app-sidebar"
      className={`app-sidebar${mobileOpen ? ' open' : ''}`}
      aria-label="Navegacion principal"
    >
      <div className="sidebar-brand-row">
        <Link to={brandTo} className="sidebar-brand" onClick={onCloseMobile}>
          <span className="sidebar-brand-dot" aria-hidden="true" />
          <span className="sidebar-brand-text">Sistema de Tutorias</span>
        </Link>

        <button
          type="button"
          className="sidebar-collapse-btn"
          onClick={onToggleCollapse}
          aria-label={collapsed ? 'Expandir menu' : 'Colapsar menu'}
          title={collapsed ? 'Expandir menu' : 'Colapsar menu'}
        >
          <IconCollapse collapsed={collapsed} />
        </button>

        <button
          type="button"
          className="sidebar-close-btn"
          onClick={onCloseMobile}
          aria-label="Cerrar menu"
        >
          <IconClose />
        </button>
      </div>

      <nav className="sidebar-nav">
        <p className="sidebar-section-title">{seccion}</p>

        {items.map((item) => {
          const Icon = iconsByName[item.icon]
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={onCloseMobile}
              title={collapsed ? item.label : undefined}
              className={({ isActive }) =>
                `sidebar-link${isActive ? ' active' : ''}`
              }
            >
              <span className="sidebar-link-icon">
                <Icon />
              </span>
              <span className="sidebar-link-label">{item.label}</span>
            </NavLink>
          )
        })}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-user" title={collapsed ? resumenUsuario : undefined}>
          <span className="sidebar-avatar" aria-hidden="true">
            {getIniciales(nombre || matricula || 'Usuario')}
          </span>
          <span className="sidebar-user-info">
            <span className="sidebar-user-name" title={nombreVisible}>
              {nombreVisible}
            </span>
            {matricula ? (
              <span className="sidebar-user-matricula">
                Matricula: {matricula}
              </span>
            ) : null}
            {rol ? <span className="sidebar-user-role">{rol}</span> : null}
          </span>
        </div>

        <button
          type="button"
          className="sidebar-logout"
          onClick={logout}
          title={collapsed ? 'Cerrar sesion' : undefined}
        >
          <IconLogout />
          <span>Cerrar sesion</span>
        </button>
      </div>
    </aside>
  )
}

export default Sidebar
