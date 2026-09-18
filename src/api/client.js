// Cliente HTTP unico para hablar con el backend.
// Centraliza: URL base, token, timeout, formato de errores y respuesta ante 401.

// Vacio en desarrollo para usar el proxy de Vite (mismo origen, sin CORS).
const BASE_URL = import.meta.env.VITE_API_URL ?? ''
const TIMEOUT_MS = 15_000

export const MENSAJES_ERROR = {
  red: 'Error al conectar con el servidor',
  timeout: 'El servidor tardó demasiado en responder, inténtalo de nuevo',
  sesion: 'Tu sesión expiró, vuelve a iniciar sesión',
  permisos: 'No tienes permiso para realizar esta acción',
  generico: 'Ocurrió un error inesperado',
}

export class ApiError extends Error {
  constructor(message, { status = 0, data = null } = {}) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.data = data
  }
}

// La sesion se inyecta desde fuera para no acoplar el cliente a React ni a localStorage.
let getToken = () => null
let onUnauthorized = () => {}

export const configureApi = (opciones = {}) => {
  if (opciones.getToken) getToken = opciones.getToken
  if (opciones.onUnauthorized) onUnauthorized = opciones.onUnauthorized
}

// Una peticion cancelada por quien la hizo (p. ej. al desmontar) no es un error que mostrar.
export const esCancelacion = (error) => error?.name === 'AbortError'

const leerCuerpo = async (response) => {
  const texto = await response.text().catch(() => '')
  if (!texto) return null
  try {
    return JSON.parse(texto)
  } catch {
    return texto
  }
}

// El backend responde { success, message, data }. En errores de validacion `data` trae
// { campo: 'mensaje' }; ante un token invalido responde texto plano.
const extraerMensaje = (cuerpo, fallback) => {
  if (typeof cuerpo === 'string') {
    const texto = cuerpo.trim()
    // Se descartan paginas HTML (p. ej. un 502 del proxy).
    return texto && !texto.startsWith('<') && texto.length <= 200 ? texto : fallback
  }
  if (cuerpo?.message) {
    const detalle =
      cuerpo.data && typeof cuerpo.data === 'object' && !Array.isArray(cuerpo.data)
        ? Object.values(cuerpo.data).find((valor) => typeof valor === 'string')
        : null
    return detalle ? `${cuerpo.message}: ${detalle}` : cuerpo.message
  }
  return fallback
}

export async function request(
  path,
  { method = 'GET', body, auth = true, signal, timeout = TIMEOUT_MS } = {},
) {
  const headers = { Accept: 'application/json' }
  if (body !== undefined) headers['Content-Type'] = 'application/json'
  const token = auth ? getToken() : null
  if (token) headers.Authorization = `Bearer ${token}`

  const controller = new AbortController()
  const cancelarDesdeFuera = () => controller.abort()
  if (signal?.aborted) controller.abort()
  signal?.addEventListener('abort', cancelarDesdeFuera, { once: true })
  let expiro = false
  const temporizador = setTimeout(() => {
    expiro = true
    controller.abort()
  }, timeout)

  let response
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    })
  } catch {
    if (signal?.aborted) throw new DOMException('Peticion cancelada', 'AbortError')
    throw new ApiError(expiro ? MENSAJES_ERROR.timeout : MENSAJES_ERROR.red)
  } finally {
    clearTimeout(temporizador)
    signal?.removeEventListener('abort', cancelarDesdeFuera)
  }

  const cuerpo = await leerCuerpo(response)

  if (response.status === 401 && auth) {
    onUnauthorized()
    throw new ApiError(MENSAJES_ERROR.sesion, { status: 401, data: cuerpo })
  }

  if (!response.ok || cuerpo?.success === false) {
    const fallback = response.status === 403 ? MENSAJES_ERROR.permisos : MENSAJES_ERROR.generico
    throw new ApiError(extraerMensaje(cuerpo, fallback), { status: response.status, data: cuerpo })
  }

  return cuerpo?.data ?? null
}

export const api = {
  get: (path, opciones) => request(path, { ...opciones, method: 'GET' }),
  post: (path, body, opciones) => request(path, { ...opciones, method: 'POST', body }),
  put: (path, body, opciones) => request(path, { ...opciones, method: 'PUT', body }),
  patch: (path, body, opciones) => request(path, { ...opciones, method: 'PATCH', body }),
  delete: (path, opciones) => request(path, { ...opciones, method: 'DELETE' }),
}
