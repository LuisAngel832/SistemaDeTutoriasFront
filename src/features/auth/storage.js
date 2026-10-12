// Unico modulo que lee y escribe la sesion en el almacenamiento del navegador.
// Solo se guarda el token: el rol y la matricula salen de sus claims y el nombre y el correo de
// GET /usuarios/me. Al ser una sola clave, las demas pestanas nunca ven una sesion a medias.

export const CLAVE_TOKEN = 'token'

// Claves de la version anterior, que guardaba la sesion campo por campo. Se borran al guardar.
const CLAVES_ANTERIORES = ['rol', 'matricula', 'nombre', 'correo']

// localStorage puede lanzar (modo privado, almacenamiento bloqueado): se trata como vacio.
export const leerToken = () => {
  try {
    return localStorage.getItem(CLAVE_TOKEN) ?? ''
  } catch {
    return ''
  }
}

export const guardarToken = (token) => {
  try {
    if (token) localStorage.setItem(CLAVE_TOKEN, token)
    else localStorage.removeItem(CLAVE_TOKEN)
    for (const clave of CLAVES_ANTERIORES) localStorage.removeItem(clave)
  } catch {
    // Sin almacenamiento la sesion vive solo en memoria hasta recargar.
  }
}

export const limpiarToken = () => guardarToken('')

// null = localStorage.clear() en otra pestana.
export const esClaveDeSesion = (clave) => clave === null || clave === CLAVE_TOKEN
