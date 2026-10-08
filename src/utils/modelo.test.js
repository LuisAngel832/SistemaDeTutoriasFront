import { describe, expect, it } from 'vitest'
import { estaLlena, etiquetaLugares, porcentajeCupo, tonoCupo } from './cupo'
import { diaRelativo, fechaEnMexico, inicioDePeriodo, sumarDias } from './fechas'
import {
  fechaDeMarca,
  formatCuando,
  formatDiaMes,
  formatDiaSemanaCorto,
  formatFechaCorta,
  formatFechaLarga,
  formatListaDias,
  formatLugar,
  formatPorcentaje,
  formatResumenHorarios,
  formatSesionesPorSemana,
  horasComunes,
  ordenarHorarios,
  pluralizar,
} from './formatters'

const horario = (dia, horaInicio, horaFin) => ({ dia, horaInicio, horaFin })
const lunMie = [horario('MIERCOLES', '10:00', '12:00'), horario('LUNES', '10:00', '12:00')]

describe('fechas en la zona de Mexico', () => {
  it('toma el dia de Mexico aunque en UTC ya sea el siguiente', () => {
    expect(fechaEnMexico(new Date('2026-10-06T05:30:00Z'))).toBe('2026-10-05')
    expect(fechaDeMarca('2026-09-28T23:05:00-06:00')).toBe('2026-09-28')
  })

  it('suma dias y reconoce hoy y mañana', () => {
    expect(sumarDias('2026-10-31', 1)).toBe('2026-11-01')
    expect(diaRelativo('2026-10-05', '2026-10-05')).toBe('hoy')
    expect(diaRelativo('2026-10-06', '2026-10-05')).toBe('mañana')
    expect(diaRelativo('2026-10-09', '2026-10-05')).toBeNull()
  })

  it('calcula el inicio del periodo escolar', () => {
    expect(inicioDePeriodo('2026-10-05')).toBe('2026-08-01')
    expect(inicioDePeriodo('2026-03-15')).toBe('2026-02-01')
    expect(inicioDePeriodo('2027-01-20')).toBe('2026-08-01')
  })
})

describe('formato de fechas', () => {
  it('formatea fechas cortas, largas y de dia y mes', () => {
    expect(formatFechaCorta('2026-10-07')).toBe('Mié 7 oct')
    expect(formatFechaLarga('2026-10-07')).toBe('Miércoles 7 de octubre')
    expect(formatFechaLarga('2026-10-05', { anio: true, mayuscula: false })).toBe(
      'lunes 5 de octubre de 2026',
    )
    expect(formatDiaMes('2026-09-07')).toBe('7 sep')
    expect(formatDiaMes('2026-09-28', { anio: true })).toBe('28 sep 2026')
    expect(formatDiaSemanaCorto('2026-09-23')).toBe('MIÉ')
  })

  it('describe cuando ocurre una sesion', () => {
    expect(formatCuando('2026-10-05', '16:00', '2026-10-05')).toBe('hoy, 16:00')
    expect(formatCuando('2026-10-06', '16:00', '2026-10-05')).toBe('mañana, 16:00')
    expect(formatCuando('2026-10-09', '08:00', '2026-10-05')).toBe('viernes 9 oct, 08:00')
  })
})

describe('formato de horarios', () => {
  it('ordena de lunes a viernes y lista los dias', () => {
    expect(ordenarHorarios(lunMie).map((h) => h.dia)).toEqual(['LUNES', 'MIERCOLES'])
    expect(formatListaDias(lunMie)).toBe('Lunes y miércoles')
    expect(formatListaDias(lunMie, { abreviado: true })).toBe('Lun y mié')
  })

  it('resume horas comunes o distintas', () => {
    expect(horasComunes(lunMie)).toBe('10:00 – 12:00')
    expect(formatResumenHorarios(lunMie)).toBe('Lunes y miércoles · 10:00 – 12:00')
    const distintas = [horario('VIERNES', '10:00', '12:00'), horario('MIERCOLES', '08:00', '10:00')]
    expect(horasComunes(distintas)).toBeNull()
    expect(formatResumenHorarios(distintas, { abreviado: true })).toBe(
      'Mié 08:00 – 10:00 · Vie 10:00 – 12:00',
    )
  })

  it('cuenta las sesiones por semana', () => {
    expect(formatSesionesPorSemana(lunMie)).toBe('2 sesiones de 2 horas')
    expect(formatSesionesPorSemana([horario('JUEVES', '17:00', '18:00')])).toBe(
      '1 sesión de 1 hora',
    )
  })

  it('formatea lugar, porcentaje y plurales', () => {
    expect(formatLugar(2, 7)).toBe('Edificio 2 · Aula 7')
    expect(formatLugar(1, 12, { corto: true })).toBe('E1 · Aula 12')
    expect(formatPorcentaje(86)).toBe('86 %')
    expect(formatPorcentaje(null)).toBe('—')
    expect(pluralizar(1, 'lugar', 'lugares')).toBe('1 lugar')
  })
})

describe('cupo', () => {
  const cupo = (ocupados) => ({ ocupados, maximo: 7, disponibles: 7 - ocupados })

  it('elige la insignia de lugares', () => {
    expect(etiquetaLugares(cupo(4))).toEqual({ texto: '3 lugares', tone: 'success' })
    expect(etiquetaLugares(cupo(6))).toEqual({ texto: 'Último lugar', tone: 'warning' })
    expect(etiquetaLugares(cupo(7))).toEqual({ texto: 'Llena', tone: 'danger' })
  })

  it('elige el tono y el porcentaje de la barra', () => {
    expect(tonoCupo(cupo(3))).toBe('normal')
    expect(tonoCupo(cupo(6))).toBe('limite')
    expect(tonoCupo(cupo(7))).toBe('lleno')
    expect(estaLlena(cupo(7))).toBe(true)
    expect(porcentajeCupo(cupo(4))).toBe(57)
  })
})
