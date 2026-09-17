import { Navigate, useLocation } from 'react-router-dom'
import { HOME_POR_ROL } from '../constants/roles'
import { useAuth } from '../features/auth/AuthContext'

// Sin sesion: manda a /login recordando la ruta pedida.
// Con otro rol: manda a la pantalla inicial de su propio rol.
const PrivateRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, rol } = useAuth()
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  if (!allowedRoles.includes(rol)) {
    return <Navigate to={HOME_POR_ROL[rol] ?? '/login'} replace />
  }

  return children
}

export default PrivateRoute
