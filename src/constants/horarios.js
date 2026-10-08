// Dias en los que puede haber horarios: el backend solo acepta de lunes a viernes.
// `key` es el valor del backend; `corto`, `abreviado` y `nombre` son textos de la interfaz;
// `indice` coincide con Date#getDay().
export const DIAS_HABILES = [
  { key: 'LUNES', corto: 'LUN', abreviado: 'Lun', nombre: 'Lunes', indice: 1 },
  { key: 'MARTES', corto: 'MAR', abreviado: 'Mar', nombre: 'Martes', indice: 2 },
  { key: 'MIERCOLES', corto: 'MIÉ', abreviado: 'Mié', nombre: 'Miércoles', indice: 3 },
  { key: 'JUEVES', corto: 'JUE', abreviado: 'Jue', nombre: 'Jueves', indice: 4 },
  { key: 'VIERNES', corto: 'VIE', abreviado: 'Vie', nombre: 'Viernes', indice: 5 },
]

const sinAcentos = (texto) =>
  String(texto ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toUpperCase()

// Busca un dia por su valor del backend; acepta tambien acentos y minusculas ("miércoles").
export const buscarDia = (dia) => DIAS_HABILES.find((item) => item.key === sinAcentos(dia))

// Posicion del dia en la semana, para ordenar horarios de lunes a viernes.
export const ordenDeDia = (dia) => buscarDia(dia)?.indice ?? 99
