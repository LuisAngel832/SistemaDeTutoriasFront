// Lectura del payload del JWT (sin verificar la firma: eso lo hace el backend).
// El backend incluye { matricula, rol, iat, exp }.

export const decodificarToken = (token) => {
  try {
    const payload = String(token).split('.')[1]
    if (!payload) return null
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/')
    const bytes = Uint8Array.from(atob(base64), (caracter) => caracter.charCodeAt(0))
    return JSON.parse(new TextDecoder().decode(bytes))
  } catch {
    return null
  }
}

// Momento (ms) en que expira el token, o null si no trae `exp`.
export const expiracionDelToken = (token) => {
  const exp = decodificarToken(token)?.exp
  return typeof exp === 'number' ? exp * 1000 : null
}

// Un token ilegible se considera expirado. `margenSeg` evita usar tokens a punto de vencer.
export const tokenExpirado = (token, { margenSeg = 30, ahora = Date.now() } = {}) => {
  if (!decodificarToken(token)) return true
  const expira = expiracionDelToken(token)
  return expira !== null && expira <= ahora + margenSeg * 1000
}
