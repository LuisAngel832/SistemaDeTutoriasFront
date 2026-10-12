import { formatDiaNombre, formatRangoHora } from './formatters'

// Textos de los choques de horario que calcula el backend (RN-4):
// { dia, horaInicio, horaFin, conTutoria: { idTutoria, materia, horaInicio, horaFin } }.

// "El jueves choca con Bases de Datos (16:00 – 18:00)."
export const describirChoqueCorto = (choque) =>
  `El ${formatDiaNombre(choque.dia).toLowerCase()} choca con ${choque.conTutoria?.materia} (${formatRangoHora(
    choque.conTutoria?.horaInicio,
    choque.conTutoria?.horaFin,
  )}).`

// "El jueves de 17:00 a 19:00 choca con tu inscripción en Bases de Datos (jueves 16:00 – 18:00)."
export const describirChoque = (choque) => {
  const dia = formatDiaNombre(choque.dia).toLowerCase()
  const otra = choque.conTutoria ?? {}
  return `El ${dia} de ${choque.horaInicio} a ${choque.horaFin} choca con tu inscripción en ${otra.materia} (${dia} ${formatRangoHora(otra.horaInicio, otra.horaFin)}).`
}
