import { nombreDeDia } from '@/constants/horarios'

// Formateo de datos para mostrarlos en la interfaz.

export const SIN_DATO = '—'

const OPCIONES_FECHA = {
  corta: { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' },
  larga: { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' },
}

// Recibe fechas "YYYY-MM-DD" del backend y las interpreta en hora local
// (new Date('YYYY-MM-DD') las tomaria como UTC y podria mostrar el dia anterior).
export const formatFecha = (fecha, { variant = 'corta' } = {}) => {
  if (!fecha) return SIN_DATO
  const date = new Date(`${fecha}T00:00:00`)
  if (Number.isNaN(date.getTime())) return fecha
  return date.toLocaleDateString('es-MX', OPCIONES_FECHA[variant] ?? OPCIONES_FECHA.corta)
}

// "10:00:00" -> "10:00"
export const formatHora = (hora) => (hora ? hora.slice(0, 5) : SIN_DATO)

export const formatRangoHora = (inicio, fin) => `${formatHora(inicio)} – ${formatHora(fin)}`

// Horario recurrente del tutor: "Lunes · 10:00 - 12:00"
export const formatHorario = (horario) =>
  `${nombreDeDia(horario.dia)} · ${formatHora(horario.horaInicio)} - ${formatHora(horario.horaFin)}`

// El backend devuelve { idTema, tema }; se aceptan tambien strings sueltos.
export const formatTema = (tema) => tema?.tema || tema?.nombre || String(tema)

export const getInicial = (texto) => (String(texto || '?').trim()[0] || '?').toUpperCase()

export const getIniciales = (texto) => {
  const partes = String(texto || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
  if (partes.length === 0) return '?'
  if (partes.length === 1) return partes[0].slice(0, 2).toUpperCase()
  return `${partes[0][0]}${partes[1][0]}`.toUpperCase()
}
