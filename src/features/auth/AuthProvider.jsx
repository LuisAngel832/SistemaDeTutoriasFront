import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { authApi } from '@/api/auth'
import { configureApi } from '@/api/client'
import { normalizarRol } from '@/constants/roles'
import { nombreCompleto } from '@/utils/formatters'
import { AuthContext } from './AuthContext'
import { decodificarToken, expiracionDelToken, tokenExpirado } from './jwt'
import { esClaveDeSesion, guardarSesion, leerSesion, limpiarSesion, SESION_VACIA } from './storage'

// Por que termino la ultima sesion: el login muestra un aviso si expiro y, si el usuario
// salio por su cuenta, no se recuerda la pagina en la que estaba.
const MOTIVOS_CIERRE = { EXPIRADA: 'expirada', LOGOUT: 'logout' }

// Si el token guardado ya vencio, se descarta antes de renderizar las rutas.
const sesionInicial = () => {
  const guardada = leerSesion()
  if (guardada.token && tokenExpirado(guardada.token)) {
    limpiarSesion()
    return { sesion: SESION_VACIA, motivoCierre: MOTIVOS_CIERRE.EXPIRADA }
  }
  return { sesion: guardada, motivoCierre: null }
}

// Sesion a partir de la respuesta del login o del registro: { token, usuario }. Si solo trae
// { token, rol }, la matricula sale del token (claim `sub`, o `matricula` en la version
// anterior) y el nombre y el correo los completa GET /usuarios/me.
const sesionDesdeRespuesta = ({ token, usuario, rol }, credenciales = {}) => {
  const claims = decodificarToken(token) ?? {}
  return {
    token,
    rol: normalizarRol(usuario?.rol ?? rol ?? claims.rol),
    matricula: String(
      usuario?.matricula ?? claims.sub ?? claims.matricula ?? credenciales.matricula ?? '',
    ),
    nombre: nombreCompleto(usuario),
    correo: usuario?.correo ?? credenciales.correo ?? '',
  }
}

export const AuthProvider = ({ children }) => {
  const [inicial] = useState(sesionInicial)
  const [sesion, setSesion] = useState(inicial.sesion)
  const [motivoCierre, setMotivoCierre] = useState(inicial.motivoCierre)
  const tokenRef = useRef(sesion.token)

  // No navega: al quedar sin sesion, RequireRole manda a /login. Navegar aqui competiria con
  // esa redireccion mientras se descarga la pagina de login.
  const cerrarSesion = useCallback((motivo) => {
    limpiarSesion()
    tokenRef.current = ''
    setSesion(SESION_VACIA)
    setMotivoCierre(motivo)
  }, [])

  // Layout effect: el cliente queda configurado antes de que los hijos hagan peticiones
  // (los efectos normales de los hijos se ejecutan despues).
  useLayoutEffect(() => {
    tokenRef.current = sesion.token
    configureApi({
      getToken: () => tokenRef.current,
      // Se ignoran los 401 de peticiones que terminan despues de cerrar sesion.
      onUnauthorized: () => {
        if (tokenRef.current) cerrarSesion(MOTIVOS_CIERRE.EXPIRADA)
      },
    })
  }, [sesion.token, cerrarSesion])

  // Cierra la sesion justo cuando vence el token, aunque no haya peticiones en curso.
  useEffect(() => {
    const expira = expiracionDelToken(sesion.token)
    if (!expira) return undefined
    // setTimeout admite como maximo ~24.8 dias.
    const espera = Math.min(Math.max(expira - Date.now(), 0), 2_147_483_647)
    const id = setTimeout(() => cerrarSesion(MOTIVOS_CIERRE.EXPIRADA), espera)
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

  const iniciarSesion = useCallback((data, credenciales) => {
    const nueva = sesionDesdeRespuesta(data, credenciales)
    if (!nueva.token || !nueva.rol) throw new Error('Respuesta del servidor inválida')
    guardarSesion(nueva)
    tokenRef.current = nueva.token
    setSesion(nueva)
    setMotivoCierre(null)
  }, [])

  // credenciales: { correo, pwd } o { matricula, pwd }. Con exito no navega: SoloInvitados
  // redirige a la pagina pedida o al inicio del rol.
  const login = useCallback(
    async (credenciales) => {
      try {
        const data = await authApi.iniciarSesion(credenciales)
        iniciarSesion(data ?? {}, credenciales)
        return { ok: true }
      } catch (err) {
        return { ok: false, message: err.message }
      }
    },
    [iniciarSesion],
  )

  // Crea la cuenta. Si el backend ya devuelve el token, entra directo (`sesionIniciada`); si
  // no, la pantalla manda al login. `errores` trae los errores por campo del backend.
  const registro = useCallback(
    async (datos) => {
      try {
        const data = await authApi.registrarse(datos)
        if (data?.token) {
          iniciarSesion(data, datos)
          return { ok: true, sesionIniciada: true }
        }
        return { ok: true, sesionIniciada: false }
      } catch (err) {
        return { ok: false, message: err.message, errores: err.errores ?? {} }
      }
    },
    [iniciarSesion],
  )

  const logout = useCallback(() => cerrarSesion(MOTIVOS_CIERRE.LOGOUT), [cerrarSesion])

  // Actualiza nombre y correo con GET /usuarios/me (el rol lo define el token).
  const sincronizarUsuario = useCallback((usuario) => {
    if (!usuario) return
    setSesion((actual) => {
      const nombre = nombreCompleto(usuario) || actual.nombre
      const correo = usuario.correo || actual.correo
      if (!actual.token || (actual.nombre === nombre && actual.correo === correo)) return actual
      const nueva = { ...actual, nombre, correo }
      guardarSesion(nueva)
      return nueva
    })
  }, [])

  const valor = useMemo(
    () => ({
      ...sesion,
      isAuthenticated: Boolean(sesion.token),
      sesionExpirada: motivoCierre === MOTIVOS_CIERRE.EXPIRADA,
      cierreVoluntario: motivoCierre === MOTIVOS_CIERRE.LOGOUT,
      login,
      registro,
      logout,
      sincronizarUsuario,
    }),
    [sesion, motivoCierre, login, registro, logout, sincronizarUsuario],
  )

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>
}
