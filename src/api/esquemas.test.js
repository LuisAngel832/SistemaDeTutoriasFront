import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import {
  choqueBasesDeDatos,
  detalleTutoria,
  historialAsistencia,
  listaDeSesion,
  miAsistencia,
  misInscripciones,
  semana,
  sesionesHoy,
  tutoriaAdmin,
  tutoriaDelTutor,
  tutoriaExplorar,
  USUARIOS,
} from '@/test/fixtures'
import { respuestaOk, servidor, usarServidorMock } from '@/test/servidor'
import { RespuestaInvalidaError } from './client'
import { esquemas, materia } from './esquemas'
import { tutoriasApi } from './tutorias'

usarServidorMock()

describe('materia', () => {
  it('normaliza el texto y el objeto a la misma forma', () => {
    expect(materia.parse('Bases de Datos')).toEqual({
      idMateria: null,
      nombre: 'Bases de Datos',
      nrc: null,
    })
    expect(materia.parse({ idMateria: 5, nombre: 'Estructuras de Datos', nrc: 48215 })).toEqual({
      idMateria: 5,
      nombre: 'Estructuras de Datos',
      nrc: 48215,
    })
  })

  it('rechaza una materia sin nombre', () => {
    expect(materia.safeParse({ idMateria: 5 }).success).toBe(false)
    expect(materia.safeParse(null).success).toBe(false)
  })
})

// Las fixtures reproducen los DTO del backend: cada una debe pasar su esquema.
describe('las respuestas del backend pasan su esquema', () => {
  it.each([
    ['usuario', USUARIOS.tutor],
    ['explorar', [tutoriaExplorar({ choques: [choqueBasesDeDatos] })]],
    ['detalle', detalleTutoria()],
    ['misTutorias', [tutoriaDelTutor()]],
    ['historial', historialAsistencia()],
    ['sesionesHoy', sesionesHoy()],
    ['listaDeSesion', listaDeSesion()],
    ['misInscripciones', misInscripciones()],
    ['miAsistencia', miAsistencia()],
    ['semana', semana],
    ['tutoriasAdmin', [tutoriaAdmin()]],
  ])('%s', (nombre, respuesta) => {
    const resultado = esquemas[nombre].safeParse(respuesta)
    expect(resultado.error?.issues ?? []).toEqual([])
  })

  it('la materia de choques, sesiones y la semana queda como objeto', () => {
    const [tutoria] = esquemas.explorar.parse([tutoriaExplorar({ choques: [choqueBasesDeDatos] })])
    expect(tutoria.choques[0].conTutoria.materia.nombre).toBe('Bases de Datos')
    expect(esquemas.sesionesHoy.parse(sesionesHoy()).sesiones[0].materia.nombre).toBeTruthy()
    expect(esquemas.semana.parse(semana)[0].materia).toMatchObject({ nombre: 'Bases de Datos' })
  })

  it('una lista que llega como null se trata como vacia', () => {
    expect(esquemas.explorar.parse(null)).toEqual([])
    expect(esquemas.sesionesHoy.parse({ sesiones: null, listasSinCerrar: null })).toMatchObject({
      sesiones: [],
      listasSinCerrar: [],
    })
  })
})

describe('validacion en el cliente', () => {
  it('rechaza una respuesta con otra forma con un error propio y sin datos personales', async () => {
    servidor.use(
      http.get('*/tutorias/12', () =>
        HttpResponse.json(respuestaOk({ ...detalleTutoria(), materia: 5, horarios: 'lunes' })),
      ),
    )

    const error = await tutoriasApi.detalle(12).catch((e) => e)

    expect(error).toBeInstanceOf(RespuestaInvalidaError)
    expect(error.message).toBe(
      'El servidor respondió con datos que no esperábamos. Inténtalo más tarde.',
    )
    expect(error.ruta).toBe('GET /tutorias/12')
    expect(error.detalles).toEqual(expect.arrayContaining([expect.stringMatching(/^materia/)]))
    expect(error.detalles).toEqual(expect.arrayContaining(['horarios: se esperaba array']))
  })

  it('la ruta del error no incluye la busqueda del usuario', async () => {
    servidor.use(http.get('*/tutorias', () => HttpResponse.json(respuestaOk({ no: 'lista' }))))

    const error = await tutoriasApi.explorar({ q: 'texto privado' }).catch((e) => e)

    expect(error.ruta).toBe('GET /tutorias')
  })
})
