import { describe, expect, it } from 'vitest'
import { diaRelativo, fechaEnMexico, inicioDePeriodo, sumarDias } from './fechas'
import { fechaDeMarca } from './formatters'

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
