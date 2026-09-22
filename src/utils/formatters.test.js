import { describe, expect, it } from 'vitest'
import {
  formatFecha,
  formatHora,
  formatHorario,
  formatRangoHora,
  formatTema,
  getInicial,
  getIniciales,
  SIN_DATO,
} from './formatters'

describe('formatFecha', () => {
  it('usa el formato corto por defecto', () => {
    expect(formatFecha('2026-09-20')).toBe('dom, 20 de sep de 2026')
  })

  it('usa el formato largo cuando se pide', () => {
    expect(formatFecha('2026-09-20', { variant: 'larga' })).toBe(
      'domingo, 20 de septiembre de 2026',
    )
  })

  it('interpreta la fecha en hora local y no muestra el dia anterior', () => {
    expect(formatFecha('2026-01-01')).toContain('01 de ene de 2026')
  })

  it('devuelve un guion si no hay fecha y el texto original si no es valida', () => {
    expect(formatFecha(null)).toBe(SIN_DATO)
    expect(formatFecha('no-es-fecha')).toBe('no-es-fecha')
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

describe('formatHorario', () => {
  it('combina dia y rango de horas', () => {
    expect(formatHorario({ dia: 'Lunes', horaInicio: '10:00:00', horaFin: '12:00:00' })).toBe(
      'Lunes · 10:00 - 12:00',
    )
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
