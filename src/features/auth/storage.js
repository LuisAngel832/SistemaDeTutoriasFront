// Unico modulo que lee y escribe la sesion en localStorage.
// Se conservan las claves historicas para no cerrar las sesiones ya abiertas.

export const STORAGE_KEYS = {
  TOKEN: 'token',
  ROL: 'rol',
  MATRICULA: 'matricula',
  NOMBRE: 'nombre',
}

export const SESION_VACIA = { token: '', rol: '', matricula: '', nombre: '' }

const CAMPOS = {
  token: STORAGE_KEYS.TOKEN,
  rol: STORAGE_KEYS.ROL,
  matricula: STORAGE_KEYS.MATRICULA,
  nombre: STORAGE_KEYS.NOMBRE,
}

// localStorage puede lanzar (modo privado, almacenamiento bloqueado): se trata como vacio.
const leer = (clave) => {
  try {
    return localStorage.getItem(clave) ?? ''
  } catch {
    return ''
  }
}

export const leerSesion = () =>
  Object.fromEntries(Object.entries(CAMPOS).map(([campo, clave]) => [campo, leer(clave)]))

export const guardarSesion = (sesion) => {
  try {
    for (const [campo, clave] of Object.entries(CAMPOS)) {
      if (sesion[campo]) localStorage.setItem(clave, sesion[campo])
      else localStorage.removeItem(clave)
    }
  } catch {
    // Sin almacenamiento la sesion vive solo en memoria hasta recargar.
  }
}

export const limpiarSesion = () => guardarSesion(SESION_VACIA)

export const esClaveDeSesion = (clave) => clave === null || Object.values(CAMPOS).includes(clave)
