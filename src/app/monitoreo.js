import { ApiError, esCancelacion } from '@/api/client'

// Monitorizacion de errores con Sentry (o GlitchTip, que usa el mismo SDK). Solo se activa con
// VITE_SENTRY_DSN: sin DSN no se descarga el SDK ni se envia nada.

let sentry = null
// Errores ocurridos mientras se descarga el SDK; null cuando no hay nada que esperar.
let pendientes = null

// No se recoge nada que identifique al usuario ni datos de las peticiones (el token viaja en
// la cabecera Authorization y la contrasena en el cuerpo del login).
const RECOLECCION = {
  userInfo: false,
  cookies: false,
  httpHeaders: false,
  httpBodies: [],
  urlQueryParams: false,
  stackFrameVariables: false,
}

// Errores esperados que no se reportan: cancelaciones, respuestas 4xx (validacion, sesion
// vencida, permisos, no encontrado) y fallos de red o timeouts, que dependen de la conexion
// del usuario. Los ApiError solo se reportan si el backend fallo (5xx).
export const debeReportarse = (error) => {
  if (!error || esCancelacion(error)) return false
  if (error instanceof ApiError) return error.status >= 500
  // Respuestas de error del router, p. ej. { status: 404 }.
  if (typeof error.status === 'number') return error.status >= 500
  return true
}

const capturar = (error, { origen, extra }) =>
  sentry.captureException(error, { tags: { origen }, extra })

// origen: 'router' | 'query' | 'mutation' | ...; extra: datos sin informacion personal.
export const reportarError = (error, { origen = 'app', extra } = {}) => {
  if (!debeReportarse(error)) return
  if (sentry) capturar(error, { origen, extra })
  else pendientes?.push([error, { origen, extra }])
}

// release: SHA del commit desplegado, para saber que version produjo cada error.
export const iniciarMonitoreo = async ({ dsn, release, entorno } = {}) => {
  if (!dsn || sentry || pendientes) return false
  pendientes = []
  try {
    const Sentry = await import('./sentry')
    Sentry.init({
      dsn,
      release: release || undefined,
      environment: entorno,
      dataCollection: RECOLECCION,
      // No cambia el mensaje de los errores de fetch en la app, solo el que se envia.
      enhanceFetchErrorMessages: 'report-only',
    })
    sentry = Sentry
    for (const [error, contexto] of pendientes) capturar(error, contexto)
    return true
  } catch {
    return false
  } finally {
    pendientes = null
  }
}
