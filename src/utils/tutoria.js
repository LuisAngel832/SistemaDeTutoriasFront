import { ESTADO_CLASS, ESTADOS_TUTORIA } from '../constants/tutoria'
import { yaInicio } from './fechas'

export const normalizarEstado = (estado) => (estado ? String(estado).toUpperCase() : '')

export const getEstadoClass = (estado) => ESTADO_CLASS[normalizarEstado(estado)] || 'otro'

export const esProgramada = (tutoria) =>
  normalizarEstado(tutoria?.estado) === ESTADOS_TUTORIA.PROGRAMADA

// La tutoria ya ocurrio si esta completada/cancelada o si ya paso su hora de inicio.
export const yaTuvoLugar = (tutoria, ahora = Date.now()) => {
  if (!tutoria) return false
  const estado = normalizarEstado(tutoria.estado)
  if (estado === ESTADOS_TUTORIA.COMPLETADA || estado === ESTADOS_TUTORIA.CANCELADA) return true
  return yaInicio(tutoria.fecha, tutoria.horaInicio, ahora)
}
