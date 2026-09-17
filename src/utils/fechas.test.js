import { describe, expect, it } from 'vitest'
import {
  combinarFechaHora,
  formatTiempoRestante,
  hoyLocalISO,
  minutosHasta,
  yaInicio,
} from './fechas'

// America/Mexico_City es UTC-6 todo el año.
const enMexico = (iso) => new Date(`${iso}-06:00`)

describe('hoyLocalISO', () => {
  it('devuelve la fecha local aunque en UTC ya sea el dia siguiente', () => {
    expect(hoyLocalISO(enMexico('2026-09-17T19:30:00'))).toBe('2026-09-17')
    expect(hoyLocalISO(enMexico('2026-09-17T23:59:00'))).toBe('2026-09-17')
  })

  it('devuelve la fecha local por la manana', () => {
    expect(hoyLocalISO(enMexico('2026-09-17T00:05:00'))).toBe('2026-09-17')
  })
})

describe('combinarFechaHora', () => {
  it('combina fecha y hora en hora local', () => {
    expect(combinarFechaHora('2026-09-20', '10:00:00')).toEqual(enMexico('2026-09-20T10:00:00'))
  })

  it('devuelve null si falta algun dato o no es valido', () => {
    expect(combinarFechaHora(null, '10:00')).toBeNull()
    expect(combinarFechaHora('2026-09-20', '')).toBeNull()
    expect(combinarFechaHora('fecha', 'hora')).toBeNull()
  })
})

describe('minutosHasta y yaInicio', () => {
  const ahora = enMexico('2026-09-17T09:45:00').getTime()

  it('calcula los minutos restantes', () => {
    expect(minutosHasta('2026-09-17', '10:00:00', ahora)).toBe(15)
    expect(minutosHasta('2026-09-17', '09:30:00', ahora)).toBe(-15)
    expect(minutosHasta(null, '10:00:00', ahora)).toBeNull()
  })

  it('indica si la hora ya paso', () => {
    expect(yaInicio('2026-09-17', '09:45:00', ahora)).toBe(true)
    expect(yaInicio('2026-09-17', '09:46:00', ahora)).toBe(false)
    expect(yaInicio(undefined, undefined, ahora)).toBe(false)
  })
})

describe('formatTiempoRestante', () => {
  it.each([
    [null, ''],
    [-1, 'la tutoria ya inicio'],
    [0, 'comienza en 0 min'],
    [59, 'comienza en 59 min'],
    [125, 'comienza en 2h 5m'],
    [60 * 24, 'comienza en 1 dia'],
    [60 * 72 + 30, 'comienza en 3 dias'],
  ])('%s minutos -> "%s"', (minutos, esperado) => {
    expect(formatTiempoRestante(minutos)).toBe(esperado)
  })
})
