import { DIAS_SEMANA } from '../constants/horarios'
import { ESTADO_CLASS, ESTADOS_TUTORIA } from '../constants/tutoria'
import { combinarFechaHora, yaInicio } from './fechas'
import { formatHora } from './formatters'

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

const normalizarTexto = (texto) =>
  String(texto ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()

// El DTO de tutoria no incluye idHorario (solo horaInicio/horaFin), asi que se deduce
// buscando el horario del tutor con las mismas horas y el dia de la semana de la fecha.
export const buscarHorarioDeTutoria = (horarios, tutoria) => {
  if (!tutoria || !horarios?.length) return null
  if (tutoria.idHorario != null) {
    return horarios.find((h) => String(h.idHorario) === String(tutoria.idHorario)) ?? null
  }

  const mismasHoras = horarios.filter(
    (h) =>
      formatHora(h.horaInicio) === formatHora(tutoria.horaInicio) &&
      formatHora(h.horaFin) === formatHora(tutoria.horaFin),
  )
  const indiceDia = combinarFechaHora(tutoria.fecha, '00:00')?.getDay()
  const dia = DIAS_SEMANA.find((d) => d.indice === indiceDia)
  const mismoDia = mismasHoras.find((h) => normalizarTexto(h.dia) === normalizarTexto(dia?.label))

  return mismoDia ?? (mismasHoras.length === 1 ? mismasHoras[0] : null)
}
