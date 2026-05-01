import { Navigate } from 'react-router-dom'

const PrivateRoute = ({ children, allowedRoles }) => {
  const userRole = localStorage.getItem('rol')
  const token = localStorage.getItem('token')

  if (!token || !allowedRoles.includes(userRole)) {
    return <Navigate to="/login" replace />
  }

  return children
}

export default PrivateRoute
