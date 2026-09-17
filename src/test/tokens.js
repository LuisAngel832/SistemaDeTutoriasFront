// JWT falsos para pruebas (la firma no se valida en el frontend).
const base64url = (objeto) =>
  btoa(JSON.stringify(objeto)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')

export const crearToken = ({ rol = 'TUTOR', matricula = 1001, expiraEnSeg = 3600 } = {}) => {
  const ahora = Math.floor(Date.now() / 1000)
  const payload = { matricula, rol, iat: ahora }
  if (expiraEnSeg !== null) payload.exp = ahora + expiraEnSeg
  return `${base64url({ alg: 'HS256' })}.${base64url(payload)}.firma`
}
