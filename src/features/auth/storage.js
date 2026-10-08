// Unico modulo que lee y escribe la sesion en el almacenamiento del navegador.
// Se conservan las claves historicas para no cerrar las sesiones ya abiertas.

export const STORAGE_KEYS = {
  TOKEN: 'token',
  ROL: 'rol',
  MATRICULA: 'matricula',
  NOMBRE: 'nombre',
  CORREO: 'correo',
  REGISTRO_PENDIENTE: 'registroPendiente',
}

export const SESION_VACIA = { token: '', rol: '', matricula: '', nombre: '', correo: '' }

const CAMPOS = {
  token: STORAGE_KEYS.TOKEN,
  rol: STORAGE_KEYS.ROL,
  matricula: STORAGE_KEYS.MATRICULA,
  nombre: STORAGE_KEYS.NOMBRE,
  correo: STORAGE_KEYS.CORREO,
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

// Registro pendiente del primer acceso: { tokenRegistro, perfil, expira }. Vive en
// sessionStorage (solo esta pestana) porque el tokenRegistro vence a los 15 minutos.
export const leerRegistroPendiente = () => {
  try {
    const guardado = JSON.parse(sessionStorage.getItem(STORAGE_KEYS.REGISTRO_PENDIENTE) ?? 'null')
    if (!guardado?.tokenRegistro) return null
    return guardado
  } catch {
    return null
  }
}

export const guardarRegistroPendiente = (registro) => {
  try {
    if (registro) sessionStorage.setItem(STORAGE_KEYS.REGISTRO_PENDIENTE, JSON.stringify(registro))
    else sessionStorage.removeItem(STORAGE_KEYS.REGISTRO_PENDIENTE)
  } catch {
    // Sin almacenamiento el registro vive solo en memoria.
  }
}
