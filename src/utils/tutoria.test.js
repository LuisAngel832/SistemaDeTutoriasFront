import { describe, expect, it } from 'vitest'
import { buscarHorarioDeTutoria, esProgramada, getEstadoClass, yaTuvoLugar } from './tutoria'

describe('estado de la tutoria', () => {
  it('asigna la clase CSS sin importar mayusculas', () => {
    expect(getEstadoClass('PROGRAMADA')).toBe('programada')
    expect(getEstadoClass('cancelada')).toBe('cancelada')
    expect(getEstadoClass('DESCONOCIDO')).toBe('otro')
    expect(getEstadoClass(undefined)).toBe('otro')
  })

  it('detecta si esta programada', () => {
    expect(esProgramada({ estado: 'programada' })).toBe(true)
    expect(esProgramada({ estado: 'COMPLETADA' })).toBe(false)
    expect(esProgramada(null)).toBe(false)
  })
})

describe('yaTuvoLugar', () => {
  const ahora = new Date('2026-09-17T10:00:00-06:00').getTime()

  it('es verdadero si esta completada o cancelada', () => {
    expect(
      yaTuvoLugar({ estado: 'COMPLETADA', fecha: '2030-01-01', horaInicio: '10:00' }, ahora),
    ).toBe(true)
    expect(yaTuvoLugar({ estado: 'CANCELADA' }, ahora)).toBe(true)
  })

  it('depende de la hora de inicio si esta programada', () => {
    const base = { estado: 'PROGRAMADA', fecha: '2026-09-17' }
    expect(yaTuvoLugar({ ...base, horaInicio: '09:00:00' }, ahora)).toBe(true)
    expect(yaTuvoLugar({ ...base, horaInicio: '11:00:00' }, ahora)).toBe(false)
    expect(yaTuvoLugar(null, ahora)).toBe(false)
  })
})

describe('buscarHorarioDeTutoria', () => {
  const horarios = [
    { idHorario: 1, dia: 'Lunes', horaInicio: '10:00:00', horaFin: '12:00:00' },
    { idHorario: 2, dia: 'Miércoles', horaInicio: '10:00:00', horaFin: '12:00:00' },
    { idHorario: 3, dia: 'Viernes', horaInicio: '16:00:00', horaFin: '18:00:00' },
  ]

  it('usa idHorario si el backend lo envia', () => {
    expect(buscarHorarioDeTutoria(horarios, { idHorario: 3 })).toBe(horarios[2])
  })

  it('elige el horario con las mismas horas y el dia de la semana de la fecha', () => {
    // 2026-09-23 es miercoles; se ignoran los acentos al comparar el dia.
    const tutoria = { fecha: '2026-09-23', horaInicio: '10:00:00', horaFin: '12:00:00' }
    expect(buscarHorarioDeTutoria(horarios, tutoria)).toBe(horarios[1])
  })

  it('usa la unica coincidencia de horas aunque el dia no coincida', () => {
    const tutoria = { fecha: '2026-09-20', horaInicio: '16:00', horaFin: '18:00' }
    expect(buscarHorarioDeTutoria(horarios, tutoria)).toBe(horarios[2])
  })

  it('devuelve null si hay varias coincidencias ambiguas o ninguna', () => {
    const ambigua = { fecha: '2026-09-20', horaInicio: '10:00:00', horaFin: '12:00:00' }
    expect(buscarHorarioDeTutoria(horarios, ambigua)).toBeNull()
    expect(
      buscarHorarioDeTutoria(horarios, { fecha: '2026-09-20', horaInicio: '07:00' }),
    ).toBeNull()
    expect(buscarHorarioDeTutoria([], ambigua)).toBeNull()
  })
})
