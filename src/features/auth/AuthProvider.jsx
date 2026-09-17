import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authApi } from '../../api/auth'
import { configureApi } from '../../api/client'
import { HOME_POR_ROL, normalizarRol } from '../../constants/roles'
import { AuthContext } from './AuthContext'
import { expiracionDelToken, tokenExpirado } from './jwt'
import { esClaveDeSesion, guardarSesion, leerSesion, limpiarSesion, SESION_VACIA } from './storage'

// Si el token guardado ya vencio, se descarta antes de renderizar las rutas.
const sesionInicial = () => {
  const guardada = leerSesion()
  if (guardada.token && tokenExpirado(guardada.token)) {
    limpiarSesion()
    return { sesion: SESION_VACIA, expirada: true }
  }
  return { sesion: guardada, expirada: false }
}

const nombreCompleto = ({ nombre, apellidoP, apellidoM } = {}) =>
  [nombre, apellidoP, apellidoM].filter(Boolean).join(' ').trim()

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate()
  const [inicial] = useState(sesionInicial)
  const [sesion, setSesion] = useState(inicial.sesion)
  const [sesionExpirada, setSesionExpirada] = useState(inicial.expirada)
  const tokenRef = useRef(sesion.token)

  const cerrarSesion = useCallback(
    ({ expirada = false } = {}) => {
      limpiarSesion()
      tokenRef.current = ''
      setSesion(SESION_VACIA)
      setSesionExpirada(expirada)
      navigate('/login', { replace: true })
    },
    [navigate],
  )

  // Layout effect: el cliente queda configurado antes de que los hijos hagan peticiones
  // (los efectos normales de los hijos se ejecutan despues).
  useLayoutEffect(() => {
    tokenRef.current = sesion.token
    configureApi({
      getToken: () => tokenRef.current,
      // Se ignoran los 401 de peticiones que terminan despues de cerrar sesion.
      onUnauthorized: () => {
        if (tokenRef.current) cerrarSesion({ expirada: true })
      },
    })
  }, [sesion.token, cerrarSesion])

  // Cierra la sesion justo cuando vence el token, aunque no haya peticiones en curso.
  useEffect(() => {
    const expira = expiracionDelToken(sesion.token)
    if (!expira) return undefined
    // setTimeout admite como maximo ~24.8 dias.
    const espera = Math.min(Math.max(expira - Date.now(), 0), 2_147_483_647)
    const id = setTimeout(() => cerrarSesion({ expirada: true }), espera)
    return () => clearTimeout(id)
  }, [sesion.token, cerrarSesion])

  // Mantiene sincronizadas las pestanas abiertas (login o logout en otra pestana).
  useEffect(() => {
    const alCambiar = (evento) => {
      if (esClaveDeSesion(evento.key)) setSesion(leerSesion())
    }
    window.addEventListener('storage', alCambiar)
    return () => window.removeEventListener('storage', alCambiar)
  }, [])

  const login = useCallback(async (matricula, pwd) => {
    try {
      const data = await authApi.iniciarSesion({ matricula, pwd })
      const rol = normalizarRol(data?.rol)
      if (!data?.token || !rol) {
        return { ok: false, message: 'Respuesta del servidor invalida' }
      }

      const nueva = {
        token: data.token,
        rol,
        matricula: String(matricula),
        // El login actual no devuelve el nombre; se completa despues (ver actualizarNombre).
        nombre: nombreCompleto(data),
      }
      guardarSesion(nueva)
      tokenRef.current = nueva.token
      setSesion(nueva)
      setSesionExpirada(false)
      return { ok: true, destino: HOME_POR_ROL[rol] ?? '/login' }
    } catch (err) {
      return { ok: false, message: err.message }
    }
  }, [])

  const registro = useCallback(async (usuario) => {
    try {
      await authApi.registrarse(usuario)
      return { ok: true }
    } catch (err) {
      return { ok: false, message: err.message }
    }
  }, [])

  const logout = useCallback(() => cerrarSesion(), [cerrarSesion])

  const actualizarNombre = useCallback(
    (nombre) => {
      const limpio = (nombre || '').trim()
      if (!limpio || !sesion.token || sesion.nombre === limpio) return
      const nueva = { ...sesion, nombre: limpio }
      guardarSesion(nueva)
      setSesion(nueva)
    },
    [sesion],
  )

  const valor = useMemo(
    () => ({
      ...sesion,
      isAuthenticated: Boolean(sesion.token),
      sesionExpirada,
      login,
      registro,
      logout,
      actualizarNombre,
    }),
    [sesion, sesionExpirada, login, registro, logout, actualizarNombre],
  )

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>
}
