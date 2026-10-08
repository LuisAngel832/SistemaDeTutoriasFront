import { createContext, useContext } from 'react'

export const AuthContext = createContext(null)

// { token, rol, matricula, nombre, correo, isAuthenticated, sesionExpirada, cierreVoluntario,
//   registroPendiente, entrarConProveedor, completarRegistro, descartarRegistro, logout,
//   sincronizarUsuario }
export const useAuth = () => {
  const contexto = useContext(AuthContext)
  if (!contexto) throw new Error('useAuth debe usarse dentro de <AuthProvider>')
  return contexto
}
