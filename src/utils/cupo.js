import { pluralizar } from './formatters'

// Cupo del backend: { ocupados, maximo, disponibles }.

export const estaLlena = (cupo) => (cupo?.disponibles ?? 0) <= 0

// Tono de la barra de cupo: normal, al limite (queda un lugar) o llena.
export const tonoCupo = (cupo) => {
  if (!cupo) return 'normal'
  if (estaLlena(cupo)) return 'lleno'
  return cupo.disponibles === 1 ? 'limite' : 'normal'
}

// Insignia de lugares disponibles: "3 lugares", "Último lugar" o "Llena".
export const etiquetaLugares = (cupo) => {
  const tono = tonoCupo(cupo)
  if (tono === 'lleno') return { texto: 'Llena', tone: 'danger' }
  if (tono === 'limite') return { texto: 'Último lugar', tone: 'warning' }
  return { texto: pluralizar(cupo?.disponibles ?? 0, 'lugar', 'lugares'), tone: 'success' }
}

export const porcentajeCupo = (cupo) =>
  cupo?.maximo ? Math.min(100, Math.round((cupo.ocupados / cupo.maximo) * 100)) : 0
