// Dias de la semana para los horarios recurrentes del tutor.
// `label` es el valor que se envia y se recibe del backend (sin acentos); `nombre` es el texto
// que se muestra; `indice` coincide con Date#getDay().
export const DIAS_SEMANA = [
  { key: 'LUNES', short: 'LUN', label: 'Lunes', nombre: 'Lunes', indice: 1 },
  { key: 'MARTES', short: 'MAR', label: 'Martes', nombre: 'Martes', indice: 2 },
  { key: 'MIERCOLES', short: 'MIE', label: 'Miercoles', nombre: 'Miércoles', indice: 3 },
  { key: 'JUEVES', short: 'JUE', label: 'Jueves', nombre: 'Jueves', indice: 4 },
  { key: 'VIERNES', short: 'VIE', label: 'Viernes', nombre: 'Viernes', indice: 5 },
  { key: 'SABADO', short: 'SAB', label: 'Sabado', nombre: 'Sábado', indice: 6 },
  { key: 'DOMINGO', short: 'DOM', label: 'Domingo', nombre: 'Domingo', indice: 0 },
]

const sinAcentos = (texto) =>
  String(texto ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()

// Nombre para mostrar del dia que envia el backend ("Miercoles" -> "Miércoles").
export const nombreDeDia = (dia) =>
  DIAS_SEMANA.find((item) => sinAcentos(item.label) === sinAcentos(dia))?.nombre ?? dia
