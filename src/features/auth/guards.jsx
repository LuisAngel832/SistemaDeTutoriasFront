import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { HOME_POR_ROL } from '../../constants/roles'
import { ROUTES } from '../../constants/routes'
import { useAuth } from './AuthContext'

// Rutas privadas. Sin sesion: manda a /login recordando la ruta pedida (salvo que el usuario
// haya cerrado sesion por su cuenta). Con otro rol: manda al inicio de su propio rol.
export const RequireRole = ({ roles }) => {
  const { isAuthenticated, rol, cierreVoluntario } = useAuth()
  const location = useLocation()

  if (!isAuthenticated) {
    const state = cierreVoluntario ? undefined : { from: location }
    return <Navigate to={ROUTES.login} replace state={state} />
  }

  if (!roles.includes(rol)) {
    return <Navigate to={HOME_POR_ROL[rol] ?? ROUTES.login} replace />
  }

  return <Outlet />
}

// Login y registro. Con sesion activa se sale de aqui: es la unica redireccion posterior al
// login, asi no compite con otra navegacion mientras se descarga la pagina de destino.
export const SoloInvitados = () => {
  const { isAuthenticated, rol } = useAuth()
  const location = useLocation()
  const inicio = HOME_POR_ROL[rol]

  if (isAuthenticated && inicio) {
    return <Navigate to={location.state?.from?.pathname ?? inicio} replace />
  }

  return <Outlet />
}

// "/" lleva al inicio del rol o al login.
export const RedireccionInicio = () => {
  const { rol } = useAuth()
  return <Navigate to={HOME_POR_ROL[rol] ?? ROUTES.login} replace />
}
