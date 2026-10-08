import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { authApi } from '@/api/auth'
import { configureApi } from '@/api/client'
import { normalizarRol } from '@/constants/roles'
import { nombreCompleto } from '@/utils/formatters'
import { AuthContext } from './AuthContext'
import { expiracionDelToken, tokenExpirado } from './jwt'
import {
  esClaveDeSesion,
  guardarRegistroPendiente,
  guardarSesion,
  leerRegistroPendiente,
  leerSesion,
  limpiarSesion,
  SESION_VACIA,
} from './storage'

// Por que termino la ultima sesion: el login muestra un aviso si expiro y, si el usuario
// salio por su cuenta, no se recuerda la pagina en la que estaba.
const MOTIVOS_CIERRE = { EXPIRADA: 'expirada', LOGOUT: 'logout' }

// El tokenRegistro del primer acceso vale 15 minutos; se descarta un poco antes.
const VIGENCIA_REGISTRO_MS = 14 * 60_000

const MENSAJE_REGISTRO_VENCIDO =
  'El tiempo para completar tu registro terminó. Vuelve a entrar con tu cuenta.'

// Si el token guardado ya vencio, se descarta antes de renderizar las rutas.
const sesionInicial = () => {
  const guardada = leerSesion()
  if (guardada.token && tokenExpirado(guardada.token)) {
    limpiarSesion()
    return { sesion: SESION_VACIA, motivoCierre: MOTIVOS_CIERRE.EXPIRADA }
  }
  return { sesion: guardada, motivoCierre: null }
}

const registroVigente = () => {
  const registro = leerRegistroPendiente()
  if (registro && registro.expira > Date.now()) return registro
  if (registro) guardarRegistroPendiente(null)
  return null
}

// Sesion a partir de la respuesta del login o del registro: { token, usuario }.
const sesionDesdeRespuesta = ({ token, usuario }) => ({
  token,
  rol: normalizarRol(usuario?.rol),
  matricula: usuario?.matricula ?? '',
  nombre: nombreCompleto(usuario),
  correo: usuario?.correo ?? '',
})

export const AuthProvider = ({ children }) => {
  const [inicial] = useState(sesionInicial)
  const [sesion, setSesion] = useState(inicial.sesion)
  const [motivoCierre, setMotivoCierre] = useState(inicial.motivoCierre)
  const [registroPendiente, setRegistroPendiente] = useState(registroVigente)
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

  const iniciarSesion = useCallback((data) => {
    const nueva = sesionDesdeRespuesta(data)
    if (!nueva.token || !nueva.rol) throw new Error('Respuesta del servidor inválida')
    guardarSesion(nueva)
    guardarRegistroPendiente(null)
    tokenRef.current = nueva.token
    setRegistroPendiente(null)
    setSesion(nueva)
    setMotivoCierre(null)
  }, [])

  // proveedor: 'microsoft' | 'google'. Con un usuario registrado inicia la sesion (SoloInvitados
  // redirige); en el primer acceso guarda el registro pendiente y responde `registroPendiente`.
  const entrarConProveedor = useCallback(
    async (proveedor, idToken) => {
      try {
        const data = await authApi[proveedor](idToken)
        if (data?.registroPendiente) {
          const registro = {
            tokenRegistro: data.tokenRegistro,
            perfil: data.perfil,
            expira: Date.now() + VIGENCIA_REGISTRO_MS,
          }
          guardarRegistroPendiente(registro)
          setRegistroPendiente(registro)
          return { ok: true, registroPendiente: true }
        }
        iniciarSesion(data ?? {})
        return { ok: true, registroPendiente: false }
      } catch (err) {
        return { ok: false, message: err.message }
      }
    },
    [iniciarSesion],
  )

  const descartarRegistro = useCallback(() => {
    guardarRegistroPendiente(null)
    setRegistroPendiente(null)
  }, [])

  // rol: 'TUTORADO' | 'TUTOR'. `errores` trae los errores por campo del backend.
  const completarRegistro = useCallback(
    async ({ matricula, rol }) => {
      const registro = registroVigente()
      if (!registro) {
        setRegistroPendiente(null)
        return { ok: false, vencido: true, message: MENSAJE_REGISTRO_VENCIDO }
      }
      try {
        const data = await authApi.completarRegistro({
          tokenRegistro: registro.tokenRegistro,
          matricula,
          rol,
        })
        iniciarSesion(data ?? {})
        return { ok: true }
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
      registroPendiente,
      entrarConProveedor,
      completarRegistro,
      descartarRegistro,
      logout,
      sincronizarUsuario,
    }),
    [
      sesion,
      motivoCierre,
      registroPendiente,
      entrarConProveedor,
      completarRegistro,
      descartarRegistro,
      logout,
      sincronizarUsuario,
    ],
  )

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>
}
