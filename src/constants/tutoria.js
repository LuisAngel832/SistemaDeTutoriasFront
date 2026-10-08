// Reglas del backend (REGLAS_DE_NEGOCIO.md). El backend las valida; el front las usa para
// mostrar limites y avisos antes de enviar.
export const CUPO_MAXIMO = 7
export const INASISTENCIAS_PERMITIDAS = 2
export const MINUTOS_LIMITE_CANCELACION = 15
export const MAX_TEMAS = 10
export const MAX_CARACTERES_TEMA = 60
export const MAX_CARACTERES_COMENTARIO = 255
export const MAX_CARACTERES_EE = 100

export const ESTADO_TUTORIA = {
  ACTIVA: 'ACTIVA',
  INACTIVA: 'INACTIVA',
}

// Una sesion es la ocurrencia de un horario en una fecha (RN-6).
export const ESTADO_SESION = {
  PROGRAMADA: 'PROGRAMADA',
  LISTA_ABIERTA: 'LISTA_ABIERTA',
  COMPLETADA: 'COMPLETADA',
  CANCELADA: 'CANCELADA',
}

export const ESTADO_INSCRIPCION = {
  ACTIVA: 'ACTIVA',
  BAJA: 'BAJA',
  BAJA_AUTOMATICA: 'BAJA_AUTOMATICA',
}

// Estado del panel de inscripcion del tutorado en el detalle de una tutoria (pantalla 06).
export const ESTADO_PANEL = {
  CON_LUGAR: 'CON_LUGAR',
  INSCRIPCION_ACTIVA: 'INSCRIPCION_ACTIVA',
  CHOQUE_HORARIO: 'CHOQUE_HORARIO',
  LLENA: 'LLENA',
  NO_ACTIVA: 'NO_ACTIVA',
  BAJA_AUTOMATICA: 'BAJA_AUTOMATICA',
}

// Asistencia del tutorado en cada sesion de su historial (pantalla 08).
export const MI_ASISTENCIA = {
  ASISTIO: 'ASISTIO',
  NO_ASISTIO: 'NO_ASISTIO',
  PENDIENTE: 'PENDIENTE',
  NO_CUENTA: 'NO_CUENTA',
  SIN_MARCA: 'SIN_MARCA',
}

// Por debajo de este porcentaje la asistencia de una tutoria se marca con un aviso (pantalla 15).
export const UMBRAL_ASISTENCIA_BAJA = 80

// --- Modelo anterior (se elimina al terminar la migracion) ---

export const ESTADOS_TUTORIA = {
  PROGRAMADA: 'PROGRAMADA',
  COMPLETADA: 'COMPLETADA',
  CANCELADA: 'CANCELADA',
}

// Clase CSS asociada a cada estado (badges de las tarjetas y detalles).
export const ESTADO_CLASS = {
  [ESTADOS_TUTORIA.PROGRAMADA]: 'programada',
  [ESTADOS_TUTORIA.COMPLETADA]: 'completada',
  [ESTADOS_TUTORIA.CANCELADA]: 'cancelada',
}

// Regla del backend: no se puede cancelar con menos de 15 minutos de anticipacion.
export const MIN_MINUTOS_CANCELACION = MINUTOS_LIMITE_CANCELACION
