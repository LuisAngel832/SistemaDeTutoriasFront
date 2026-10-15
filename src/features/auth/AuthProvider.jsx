import { useQueryClient } from '@tanstack/react-query'
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { authApi } from '@/api/auth'
import { configureApi } from '@/api/client'
import { normalizarRol } from '@/constants/roles'
import { nombreCompleto } from '@/utils/formatters'
import { AuthContext } from './AuthContext'
import { decodificarToken, expiracionDelToken, tokenExpirado } from './jwt'
import { esClaveDeSesion, guardarToken, leerToken, limpiarToken } from './storage'

// Por que termino la ultima sesion: el login muestra un aviso si expiro y, si el usuario
// salio por su cuenta, no se recuerda la pagina en la que estaba.
const MOTIVOS_CIERRE = { EXPIRADA: 'expirada', LOGOUT: 'logout' }

const SESION_VACIA = { token: '', rol: '', matricula: '', nombre: '', correo: '' }

// El rol y la matricula salen siempre de los claims del token (el backend valida su firma). El
// nombre y el correo no se guardan: los trae la respuesta del login o GET /usuarios/me.
const sesionDesdeToken = (token, { nombre = '', correo = '' } = {}) => {
  const claims = decodificarToken(token)
  if (!claims) return SESION_VACIA
  return {
    token,
    rol: normalizarRol(claims.rol),
    matricula: String(claims.sub ?? claims.matricula ?? ''),
    nombre,
    correo,
  }
}

// Si el token guardado ya vencio, se descarta antes de renderizar las rutas.
const sesionInicial = () => {
  const token = leerToken()
  if (!token) return { sesion: SESION_VACIA, motivoCierre: null }
  if (tokenExpirado(token)) {
    limpiarToken()
    return { sesion: SESION_VACIA, motivoCierre: MOTIVOS_CIERRE.EXPIRADA }
  }
  // Reescribirlo borra las claves de la version anterior (rol, matricula, nombre, correo).
  guardarToken(token)
  return { sesion: sesionDesdeToken(token), motivoCierre: null }
}

// Sesion a partir de la respuesta del login o del registro: { token, usuario } o { token, rol }.
// El rol y la matricula salen del token (claim `sub`, o `matricula` en la version anterior);
// la respuesta solo los suple si el token no los trae. El nombre y el correo, si no vienen, los
// completa GET /usuarios/me.
const sesionDesdeRespuesta = ({ token, usuario, rol }, credenciales = {}) => {
  const claims = decodificarToken(token) ?? {}
  return {
    token,
    rol: normalizarRol(claims.rol ?? usuario?.rol ?? rol),
    matricula: String(
      claims.sub ?? claims.matricula ?? usuario?.matricula ?? credenciales.matricula ?? '',
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
  const queryClient = useQueryClient()
  // Ultimo usuario con sesion en esta pestana; se conserva despues del logout.
  const usuarioRef = useRef(sesion.matricula)

  // Al entrar otro usuario se descartan los datos del anterior antes de cambiar la sesion, para
  // que ninguna pantalla los muestre (p. ej. /usuarios/me se guarda 5 minutos).
  const prepararDatosDe = useCallback(
    (matricula) => {
      if (!matricula) return
      if (usuarioRef.current && usuarioRef.current !== matricula) queryClient.clear()
      usuarioRef.current = matricula
    },
    [queryClient],
  )

  // No navega: al quedar sin sesion, RequireRole manda a /login. Navegar aqui competiria con
  // esa redireccion mientras se descarga la pagina de login.
  const cerrarSesion = useCallback((motivo) => {
    limpiarToken()
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

  // Mantiene sincronizadas las pestanas abiertas: login, logout o cambio de usuario en otra
  // pestana. Un token vencido se trata como sesion expirada.
  useEffect(() => {
    const alCambiar = (evento) => {
      if (!esClaveDeSesion(evento.key)) return
      const token = leerToken()
      if (token && tokenExpirado(token)) {
        cerrarSesion(MOTIVOS_CIERRE.EXPIRADA)
        return
      }
      if (token === tokenRef.current) return
      const nueva = sesionDesdeToken(token)
      prepararDatosDe(nueva.matricula)
      setSesion((actual) =>
        // Mismo usuario con un token renovado: conserva el nombre y el correo ya cargados.
        nueva.matricula && nueva.matricula === actual.matricula
          ? { ...nueva, nombre: actual.nombre, correo: actual.correo }
          : nueva,
      )
    }
    window.addEventListener('storage', alCambiar)
    return () => window.removeEventListener('storage', alCambiar)
  }, [cerrarSesion, prepararDatosDe])

  const iniciarSesion = useCallback(
    (data, credenciales) => {
      const nueva = sesionDesdeRespuesta(data, credenciales)
      if (!nueva.token || !nueva.rol) throw new Error('Respuesta del servidor inválida')
      prepararDatosDe(nueva.matricula)
      guardarToken(nueva.token)
      tokenRef.current = nueva.token
      setSesion(nueva)
      setMotivoCierre(null)
    },
    [prepararDatosDe],
  )

  // credenciales: { correo, pwd } o { matricula, pwd }. Con exito no navega: SoloInvitados
  // redirige a la pagina pedida o al inicio del rol.
  const login = useCallback(
    async (credenciales) => {
      try {
        const data = await authApi.iniciarSesion(credenciales)
        iniciarSesion(data ?? {}, credenciales)
        return { ok: true }
      } catch (err) {
        return { ok: false, message: err.message, errores: err.errores ?? {} }
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

  // Actualiza nombre y correo con GET /usuarios/me (el rol lo define el token). Solo viven en
  // memoria: al recargar se vuelven a pedir.
  const sincronizarUsuario = useCallback((usuario) => {
    if (!usuario) return
    setSesion((actual) => {
      const nombre = nombreCompleto(usuario) || actual.nombre
      const correo = usuario.correo || actual.correo
      if (!actual.token || (actual.nombre === nombre && actual.correo === correo)) return actual
      return { ...actual, nombre, correo }
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
