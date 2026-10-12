import { buscarDia, ordenDeDia } from '@/constants/horarios'
import { diaRelativo, fechaEnMexico, leerFecha } from './fechas'

// Formateo de datos para mostrarlos en la interfaz.

export const SIN_DATO = '—'

const DIAS_NOMBRE = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado']
const DIAS_ABREVIADOS = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb']
const MESES = [
  'enero',
  'febrero',
  'marzo',
  'abril',
  'mayo',
  'junio',
  'julio',
  'agosto',
  'septiembre',
  'octubre',
  'noviembre',
  'diciembre',
]
const MESES_CORTOS = MESES.map((mes) => mes.slice(0, 3))

const listaY = new Intl.ListFormat('es', { type: 'conjunction' })

export const capitalizar = (texto) => (texto ? texto[0].toUpperCase() + texto.slice(1) : '')

// "Rocío Hernández Aguilar" a partir de { nombre, apellidos }.
export const nombreCompleto = ({ nombre, apellidos } = {}) =>
  [nombre, apellidos].filter(Boolean).join(' ').trim()

// "3 lugares", "1 lugar"
export const pluralizar = (cantidad, singular, plural = `${singular}s`) =>
  `${cantidad} ${cantidad === 1 ? singular : plural}`

// Partes de una fecha "YYYY-MM-DD" (sin depender de la zona del navegador).
const partesDeFecha = (fecha) => {
  const date = leerFecha(fecha)
  if (!date) return null
  return {
    diaSemana: date.getUTCDay(),
    dia: date.getUTCDate(),
    mes: date.getUTCMonth(),
    anio: date.getUTCFullYear(),
  }
}

// "Mié 7 oct"
export const formatFechaCorta = (fecha) => {
  const p = partesDeFecha(fecha)
  if (!p) return SIN_DATO
  return `${capitalizar(DIAS_ABREVIADOS[p.diaSemana])} ${p.dia} ${MESES_CORTOS[p.mes]}`
}

// "Miércoles 7 de octubre"; con `anio`: "Miércoles 7 de octubre de 2026".
export const formatFechaLarga = (fecha, { anio = false, mayuscula = true } = {}) => {
  const p = partesDeFecha(fecha)
  if (!p) return SIN_DATO
  const texto = `${DIAS_NOMBRE[p.diaSemana]} ${p.dia} de ${MESES[p.mes]}${anio ? ` de ${p.anio}` : ''}`
  return mayuscula ? capitalizar(texto) : texto
}

// Nombre del mes de una fecha ("agosto").
export const formatMes = (fecha) => {
  const p = partesDeFecha(fecha)
  return p ? MESES[p.mes] : SIN_DATO
}

// "26 de agosto de 2026"
export const formatFechaCompleta = (fecha) => {
  const p = partesDeFecha(fecha)
  return p ? `${p.dia} de ${MESES[p.mes]} de ${p.anio}` : SIN_DATO
}

// "7 sep"; con `anio`: "28 sep 2026".
export const formatDiaMes = (fecha, { anio = false } = {}) => {
  const p = partesDeFecha(fecha)
  if (!p) return SIN_DATO
  return `${p.dia} ${MESES_CORTOS[p.mes]}${anio ? ` ${p.anio}` : ''}`
}

// Abreviatura en mayusculas del dia de una fecha ("LUN"), para encabezados de tabla.
export const formatDiaSemanaCorto = (fecha) => {
  const p = partesDeFecha(fecha)
  return p ? DIAS_ABREVIADOS[p.diaSemana].toUpperCase() : SIN_DATO
}

// Nombre del dia de una fecha ("miércoles").
export const formatNombreDiaDeFecha = (fecha) => {
  const p = partesDeFecha(fecha)
  return p ? DIAS_NOMBRE[p.diaSemana] : SIN_DATO
}

// Fecha (en la zona de Mexico) de una marca de tiempo ISO del backend.
export const fechaDeMarca = (marca) => (marca ? fechaEnMexico(marca) : null)

// Cuando ocurre una sesion: "hoy, 16:00", "mañana, 12:00" o "viernes 9 oct, 08:00".
export const formatCuando = (fecha, hora, hoy = fechaEnMexico()) => {
  if (!fecha) return SIN_DATO
  const relativo = diaRelativo(fecha, hoy)
  const dia = relativo ?? `${formatNombreDiaDeFecha(fecha)} ${formatDiaMes(fecha)}`
  return hora ? `${dia}, ${formatHora(hora)}` : dia
}

// Dias de la semana del backend ("MIERCOLES").
export const formatDiaCorto = (dia) => buscarDia(dia)?.corto ?? String(dia ?? SIN_DATO)
export const formatDiaNombre = (dia) => buscarDia(dia)?.nombre ?? String(dia ?? SIN_DATO)

// Horarios de lunes a viernes y, dentro del dia, por hora de inicio.
export const ordenarHorarios = (horarios = []) =>
  [...horarios].sort(
    (a, b) =>
      ordenDeDia(a.dia) - ordenDeDia(b.dia) ||
      String(a.horaInicio).localeCompare(String(b.horaInicio)),
  )

// Dias de una lista de horarios: "Lunes y miércoles" o, abreviados, "Lun y mié".
export const formatListaDias = (horarios = [], { abreviado = false } = {}) => {
  const dias = [...new Set(ordenarHorarios(horarios).map((horario) => horario.dia))]
  const nombres = dias.map((dia) => {
    const encontrado = buscarDia(dia)
    const texto = abreviado ? encontrado?.abreviado : encontrado?.nombre
    return (texto ?? String(dia)).toLowerCase()
  })
  return nombres.length ? capitalizar(listaY.format(nombres)) : SIN_DATO
}

// Rango comun si todos los horarios tienen las mismas horas; null si difieren.
export const horasComunes = (horarios = []) => {
  if (!horarios.length) return null
  const rangos = new Set(horarios.map((h) => formatRangoHora(h.horaInicio, h.horaFin)))
  return rangos.size === 1 ? [...rangos][0] : null
}

// "Lunes y miércoles · 10:00 – 12:00" o, con horas distintas,
// "Miércoles 08:00 – 10:00 · Viernes 10:00 – 12:00".
export const formatResumenHorarios = (horarios = [], { abreviado = false } = {}) => {
  if (!horarios.length) return SIN_DATO
  const comunes = horasComunes(horarios)
  if (comunes) return `${formatListaDias(horarios, { abreviado })} · ${comunes}`
  return ordenarHorarios(horarios)
    .map((horario) => {
      const dia = buscarDia(horario.dia)
      const nombre = (abreviado ? dia?.abreviado : dia?.nombre) ?? horario.dia
      return `${nombre} ${formatRangoHora(horario.horaInicio, horario.horaFin)}`
    })
    .join(' · ')
}

const minutosDe = (hora) => {
  const [horas, minutos] = String(hora ?? '')
    .split(':')
    .map(Number)
  return Number.isFinite(horas) ? horas * 60 + (minutos || 0) : null
}

export const duracionEnMinutos = (horaInicio, horaFin) => {
  const inicio = minutosDe(horaInicio)
  const fin = minutosDe(horaFin)
  return inicio == null || fin == null ? null : fin - inicio
}

const formatDuracion = (minutos) => {
  if (minutos % 60 === 0) return pluralizar(minutos / 60, 'hora')
  if (minutos < 60) return `${minutos} min`
  return `${Math.floor(minutos / 60)} h ${minutos % 60} min`
}

// "2 sesiones de 2 horas" (o "2 sesiones por semana" si duran distinto).
export const formatSesionesPorSemana = (horarios = []) => {
  if (!horarios.length) return SIN_DATO
  const duraciones = new Set(horarios.map((h) => duracionEnMinutos(h.horaInicio, h.horaFin)))
  const sesiones = pluralizar(horarios.length, 'sesión', 'sesiones')
  const [duracion] = [...duraciones]
  return duraciones.size === 1 && duracion > 0
    ? `${sesiones} de ${formatDuracion(duracion)}`
    : `${sesiones} por semana`
}

// "Edificio 2 · Aula 7" o, corto, "E2 · Aula 7".
export const formatLugar = (edificio, aula, { corto = false } = {}) => {
  if (edificio == null && aula == null) return SIN_DATO
  const textoEdificio = corto ? `E${edificio ?? SIN_DATO}` : `Edificio ${edificio ?? SIN_DATO}`
  return `${textoEdificio} · Aula ${aula ?? SIN_DATO}`
}

// "86 %"
export const formatPorcentaje = (valor) => (valor == null ? SIN_DATO : `${valor} %`)

// "10:00:00" -> "10:00"
export const formatHora = (hora) => (hora ? hora.slice(0, 5) : SIN_DATO)

export const formatRangoHora = (inicio, fin) => `${formatHora(inicio)} – ${formatHora(fin)}`

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
