import { describe, expect, it } from 'vitest'
import {
  formatCuando,
  formatDiaMes,
  formatDiaSemanaCorto,
  formatFechaCompleta,
  formatFechaCorta,
  formatFechaLarga,
  formatHora,
  formatListaDias,
  formatLugar,
  formatMes,
  formatPorcentaje,
  formatRangoHora,
  formatResumenHorarios,
  formatSesionesPorSemana,
  formatTema,
  getInicial,
  getIniciales,
  horasComunes,
  nombreCompleto,
  ordenarHorarios,
  pluralizar,
  SIN_DATO,
} from './formatters'

const horario = (dia, horaInicio, horaFin) => ({ dia, horaInicio, horaFin })
const lunMie = [horario('MIERCOLES', '10:00', '12:00'), horario('LUNES', '10:00', '12:00')]

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
    expect(formatFechaCompleta('2026-08-26')).toBe('26 de agosto de 2026')
    expect(formatMes('2026-08-01')).toBe('agosto')
    expect(formatFechaCorta('no')).toBe(SIN_DATO)
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
    expect(nombreCompleto({ nombre: 'Rocío', apellidos: 'Hernández Aguilar' })).toBe(
      'Rocío Hernández Aguilar',
    )
  })
})

describe('formatHora y formatRangoHora', () => {
  it('recorta los segundos', () => {
    expect(formatHora('10:30:00')).toBe('10:30')
    expect(formatRangoHora('10:00:00', '12:00:00')).toBe('10:00 – 12:00')
  })

  it('usa un guion cuando falta la hora', () => {
    expect(formatHora(undefined)).toBe(SIN_DATO)
    expect(formatRangoHora(null, '12:00:00')).toBe(`${SIN_DATO} – 12:00`)
  })
})

describe('formatTema', () => {
  it('acepta el DTO del backend, variantes antiguas y strings', () => {
    expect(formatTema({ idTema: 1, tema: 'Balance general' })).toBe('Balance general')
    expect(formatTema({ nombre: 'Depreciaciones' })).toBe('Depreciaciones')
    expect(formatTema('Costos')).toBe('Costos')
  })
})

describe('iniciales', () => {
  it('getInicial acepta numeros (matriculas) y textos vacios', () => {
    expect(getInicial('luis')).toBe('L')
    expect(getInicial(2001)).toBe('2')
    expect(getInicial('')).toBe('?')
    expect(getInicial(null)).toBe('?')
  })

  it('getIniciales toma nombre y apellido o dos letras de una sola palabra', () => {
    expect(getIniciales('Ana Garcia Lopez')).toBe('AG')
    expect(getIniciales('Usuario')).toBe('US')
    expect(getIniciales('   ')).toBe('?')
  })
})
