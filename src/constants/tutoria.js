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

// Limite por tema: evita textos tan largos que desborden las tarjetas.
export const MAX_CARACTERES_TEMA = 60
export const MAX_TEMAS = 10

// Regla del backend: no se puede cancelar con menos de 15 minutos de anticipacion.
export const MIN_MINUTOS_CANCELACION = 15
