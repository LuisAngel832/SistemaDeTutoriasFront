// Calculos de fechas en hora local del navegador.

const MS_POR_MINUTO = 60_000

// Fecha de hoy en formato "YYYY-MM-DD" segun la zona horaria local.
// toISOString() devuelve UTC: en Mexico, despues de las 18:00 ya seria "manana".
export const hoyLocalISO = (ahora = new Date()) => {
  const local = new Date(ahora.getTime() - ahora.getTimezoneOffset() * MS_POR_MINUTO)
  return local.toISOString().slice(0, 10)
}

// Combina "YYYY-MM-DD" y "HH:mm[:ss]" en un Date local. Devuelve null si no es valido.
export const combinarFechaHora = (fecha, hora) => {
  if (!fecha || !hora) return null
  const date = new Date(`${fecha}T${hora}`)
  return Number.isNaN(date.getTime()) ? null : date
}

// Minutos que faltan para la fecha/hora indicada (negativo si ya paso).
export const minutosHasta = (fecha, hora, ahora = Date.now()) => {
  const objetivo = combinarFechaHora(fecha, hora)
  if (!objetivo) return null
  return Math.floor((objetivo.getTime() - ahora) / MS_POR_MINUTO)
}

export const yaInicio = (fecha, hora, ahora = Date.now()) => {
  const objetivo = combinarFechaHora(fecha, hora)
  return objetivo ? objetivo.getTime() <= ahora : false
}

export const formatTiempoRestante = (minutos) => {
  if (minutos == null) return ''
  if (minutos < 0) return 'la tutoria ya inicio'
  if (minutos < 60) return `comienza en ${minutos} min`
  const horas = Math.floor(minutos / 60)
  const resto = minutos % 60
  if (horas < 24) return `comienza en ${horas}h ${resto}m`
  const dias = Math.floor(horas / 24)
  return `comienza en ${dias} dia${dias === 1 ? '' : 's'}`
}
