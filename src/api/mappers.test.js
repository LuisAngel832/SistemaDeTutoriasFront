import { describe, expect, it } from 'vitest'
import {
  mapComentario,
  mapHorario,
  mapInscripcion,
  mapInscrito,
  mapLista,
  mapTema,
  mapTutoria,
} from './mappers'

describe('mapTutoria', () => {
  it('normaliza TutoriaResponsive y sus temas', () => {
    const dto = {
      id: 1,
      fecha: '2026-09-20',
      nombreTutor: 'Ana Garcia Lopez',
      horaInicio: '10:00:00',
      horaFin: '12:00:00',
      materia: 'Contabilidad Financiera',
      edificio: 1,
      aula: 5,
      estado: 'PROGRAMADA',
      temas: [{ idTema: 3, tema: 'Balance general' }, 'Costos'],
    }

    expect(mapTutoria(dto)).toEqual({
      id: 1,
      materia: 'Contabilidad Financiera',
      nombreTutor: 'Ana Garcia Lopez',
      fecha: '2026-09-20',
      horaInicio: '10:00:00',
      horaFin: '12:00:00',
      idHorario: null,
      edificio: 1,
      aula: 5,
      estado: 'PROGRAMADA',
      temas: [
        { idTema: 3, tema: 'Balance general' },
        { idTema: null, tema: 'Costos' },
      ],
    })
  })

  it('acepta horario anidado y temas ausentes', () => {
    const tutoria = mapTutoria({
      idTutoria: 9,
      horario: { id: 4, horaInicio: '08:00:00', horaFin: '09:00:00' },
    })
    expect(tutoria).toMatchObject({ id: 9, idHorario: 4, horaInicio: '08:00:00', temas: [] })
  })
})

describe('mapInscripcion', () => {
  it('toma el nombre del tutor del campo "tutor" de MisInscripcionResponsive', () => {
    const inscripcion = mapInscripcion({
      idAsistencia: 12,
      idTutoria: 1,
      fecha: '2026-09-20',
      materia: 'Contabilidad Financiera',
      dia: 'Lunes',
      horaInicio: '10:00:00',
      horaFin: '12:00:00',
      edificio: 1,
      aula: 5,
      tutor: 'Ana Garcia Lopez',
      estado: 'PROGRAMADA',
      asistio: false,
      calificacion: null,
    })

    expect(inscripcion).toMatchObject({
      idAsistencia: 12,
      idTutoria: 1,
      nombreTutor: 'Ana Garcia Lopez',
      dia: 'Lunes',
      asistio: false,
    })
  })

  it('acepta la tutoria anidada', () => {
    const inscripcion = mapInscripcion({
      idAsistencia: 5,
      tutoria: { id: 3, materia: 'Estadistica', nombreTutor: 'Ana' },
    })
    expect(inscripcion).toMatchObject({ idAsistencia: 5, idTutoria: 3, materia: 'Estadistica' })
  })
})

describe('otros mappers', () => {
  it('mapHorario resuelve los distintos nombres del id', () => {
    expect(mapHorario({ id: 1, dia: 'Lunes' }).idHorario).toBe(1)
    expect(mapHorario({ idHorarios: 2 }).idHorario).toBe(2)
    expect(mapHorario({ horarioId: 3 }).idHorario).toBe(3)
  })

  it('mapInscrito y mapComentario convierten la matricula a string', () => {
    expect(mapInscrito({ idAsistencia: 1, matricula: 2001, nombre: 'Luis' }).matricula).toBe('2001')
    expect(mapComentario({ idComentario: 1, matricula: 2001 }).matricula).toBe('2001')
    expect(mapComentario({ idComentario: 2 }).matricula).toBeNull()
  })

  it('mapTema tolera valores vacios', () => {
    expect(mapTema(null)).toEqual({ idTema: null, tema: '' })
    expect(mapTema({ nombre: 'Costos' })).toEqual({ idTema: null, tema: 'Costos' })
  })

  it('mapLista devuelve [] si el backend no envia un arreglo', () => {
    expect(mapLista(null, mapTema)).toEqual([])
    expect(mapLista(['a'], mapTema)).toEqual([{ idTema: null, tema: 'a' }])
  })
})
