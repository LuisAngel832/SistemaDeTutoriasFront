import { http, HttpResponse } from 'msw'
import { beforeEach, describe, expect, it } from 'vitest'
import { respuestaOk, servidor, usarServidorMock } from '@/test/servidor'
import { adminApi } from './admin'
import { authApi } from './auth'
import { catalogosApi } from './catalogos'
import { configureApi, conParametros, RespuestaInvalidaError } from './client'
import { comentariosApi } from './comentarios'
import { inscripcionesApi } from './inscripciones'
import { materiasApi } from './materias'
import { sesionesApi } from './sesiones'
import { temasApi } from './temas'
import { tutoriasApi } from './tutorias'
import { usuariosApi } from './usuarios'

usarServidorMock()

// Registra la ultima peticion para comprobar metodo, ruta, query y cuerpo.
let peticion

beforeEach(() => {
  peticion = null
  configureApi({ getToken: () => 'token', onUnauthorized: () => {} })
  servidor.use(
    http.all('*', async ({ request }) => {
      const url = new URL(request.url)
      const texto = await request.text()
      peticion = {
        metodo: request.method,
        ruta: `${url.pathname}${url.search}`,
        cuerpo: texto ? JSON.parse(texto) : undefined,
        auth: request.headers.get('Authorization'),
      }
      return HttpResponse.json(respuestaOk(null))
    }),
  )
})

// Aqui solo importa la peticion: el backend simulado responde null y los endpoints que validan
// su respuesta la rechazan (ver esquemas.test.js).
const pedir = (llamada) =>
  llamada().catch((error) => {
    if (!(error instanceof RespuestaInvalidaError)) throw error
  })

const casos = [
  [
    'login con matricula',
    () => authApi.iniciarSesion({ matricula: 'S23014587', pwd: 'secreta1' }),
    'POST',
    '/auth/signin',
    { matricula: 'S23014587', pwd: 'secreta1' },
  ],
  [
    'login con correo',
    () => authApi.iniciarSesion({ correo: 'ana@uv.mx', pwd: 'secreta1' }),
    'POST',
    '/auth/signin',
    { correo: 'ana@uv.mx', pwd: 'secreta1' },
  ],
  [
    'crear cuenta',
    () =>
      authApi.registrarse({
        nombre: 'Sofía',
        apellidos: 'Ramos Gutiérrez',
        matricula: 'S24011236',
        correo: 'zs24011236@estudiantes.uv.mx',
        pwd: 'secreta12',
        rol: 'TUTORADO',
      }),
    'POST',
    '/auth/signup',
    {
      nombre: 'Sofía',
      apellidos: 'Ramos Gutiérrez',
      matricula: 'S24011236',
      correo: 'zs24011236@estudiantes.uv.mx',
      pwd: 'secreta12',
      rol: 'TUTORADO',
    },
  ],
  ['usuario actual', () => usuariosApi.actual(), 'GET', '/usuarios/me'],
  [
    'catalogo de EE con busqueda',
    () => materiasApi.listar({ q: 'redes' }),
    'GET',
    '/materias?q=redes',
  ],
  ['catalogo de EE sin busqueda', () => materiasApi.listar(), 'GET', '/materias'],
  [
    'alta de EE',
    () => materiasApi.crear({ nombre: 'Redes', nrc: 52310 }),
    'POST',
    '/materias',
    { nombre: 'Redes', nrc: 52310 },
  ],
  [
    'cambio de EE',
    () => materiasApi.actualizar(13, { nombre: 'Redes', nrc: 52311 }),
    'PUT',
    '/materias/13',
    { nombre: 'Redes', nrc: 52311 },
  ],
  ['baja de EE', () => materiasApi.eliminar(13), 'DELETE', '/materias/13'],
  ['edificios', () => catalogosApi.edificios(), 'GET', '/catalogos/edificios'],
  [
    'explorar con filtros',
    () =>
      tutoriasApi.explorar({ q: 'datos', dia: 'LUNES', soloConLugar: true, ocultarChoques: false }),
    'GET',
    '/tutorias?q=datos&dia=LUNES&soloConLugar=true',
  ],
  ['detalle de tutoria', () => tutoriasApi.detalle(12), 'GET', '/tutorias/12'],
  [
    'tutorias del tutor',
    () => tutoriasApi.mias({ estado: 'TODAS' }),
    'GET',
    '/tutorias/mis-tutorias?estado=TODAS',
  ],
  [
    'crear tutoria',
    () => tutoriasApi.crear({ idMateria: 13, edificio: 1, aula: 10, horarios: [] }),
    'POST',
    '/tutorias',
    { idMateria: 13, edificio: 1, aula: 10, horarios: [] },
  ],
  [
    'editar tutoria',
    () => tutoriasApi.actualizar(12, { edificio: 2, aula: 7, horarios: [] }),
    'PUT',
    '/tutorias/12',
    { edificio: 2, aula: 7, horarios: [] },
  ],
  [
    'desactivar tutoria',
    () => tutoriasApi.desactivar(12),
    'PATCH',
    '/tutorias/12/estado',
    { estado: 'INACTIVA' },
  ],
  ['inscritos', () => tutoriasApi.inscritos(12), 'GET', '/tutorias/12/inscritos'],
  [
    'sesiones de la tutoria',
    () => tutoriasApi.sesiones(12, { dias: 7 }),
    'GET',
    '/tutorias/12/sesiones?dias=7',
  ],
  [
    'historial',
    () => tutoriasApi.historialAsistencia(12),
    'GET',
    '/tutorias/12/historial-asistencia',
  ],
  [
    'agregar tema',
    () => temasApi.agregar(31, 'Grafos'),
    'POST',
    '/horarios/31/temas',
    { tema: 'Grafos' },
  ],
  ['quitar tema', () => temasApi.eliminar(101), 'DELETE', '/temas/101'],
  [
    'inscribirse',
    () => inscripcionesApi.inscribirse('12'),
    'POST',
    '/inscripciones',
    { idTutoria: 12 },
  ],
  ['mis inscripciones', () => inscripcionesApi.mias(), 'GET', '/inscripciones'],
  ['mi asistencia', () => inscripcionesApi.deTutoria(7), 'GET', '/inscripciones/tutorias/7'],
  ['darse de baja', () => inscripcionesApi.darseDeBaja(7), 'DELETE', '/inscripciones/tutorias/7'],
  ['mi semana', () => inscripcionesApi.semana(), 'GET', '/inscripciones/semana'],
  ['sesiones de hoy', () => sesionesApi.hoy(), 'GET', '/sesiones/hoy'],
  [
    'abrir lista',
    () => sesionesApi.abrirLista({ idHorario: 31, fecha: '2026-10-05' }),
    'POST',
    '/sesiones/abrir-lista',
    { idHorario: 31, fecha: '2026-10-05' },
  ],
  [
    'cancelar sesion',
    () => sesionesApi.cancelar({ idHorario: 32, fecha: '2026-10-07' }),
    'POST',
    '/sesiones/cancelar',
    { idHorario: 32, fecha: '2026-10-07' },
  ],
  ['pase de lista', () => sesionesApi.lista(88), 'GET', '/sesiones/88/lista'],
  [
    'guardar marcas',
    () => sesionesApi.guardarMarcas(88, [{ matricula: 'S1', asistio: true }]),
    'PUT',
    '/sesiones/88/lista',
    { marcas: [{ matricula: 'S1', asistio: true }] },
  ],
  ['cerrar lista', () => sesionesApi.cerrarLista(88), 'POST', '/sesiones/88/cerrar-lista'],
  ['comentarios', () => comentariosApi.deTutoria(12), 'GET', '/tutorias/12/comentarios'],
  [
    'publicar comentario',
    () => comentariosApi.publicar(12, 'Hola'),
    'POST',
    '/tutorias/12/comentarios',
    { comentario: 'Hola' },
  ],
  ['borrar comentario', () => comentariosApi.eliminar(15), 'DELETE', '/comentarios/15'],
  [
    'resumen admin',
    () => adminApi.resumen({ desde: '2026-08-01' }),
    'GET',
    '/admin/resumen?desde=2026-08-01',
  ],
  [
    'tutorias admin',
    () => adminApi.tutorias({ q: 'web', matriculaTutor: 'S21009342', estado: 'TODAS' }),
    'GET',
    '/admin/tutorias?q=web&matriculaTutor=S21009342&estado=TODAS',
  ],
  ['tutores', () => adminApi.tutores(), 'GET', '/admin/tutores'],
  [
    'cierre de periodo',
    () => adminApi.cerrarPeriodo(),
    'POST',
    '/admin/tutorias/cierre-periodo',
    { confirmar: true },
  ],
]

describe('rutas del contrato', () => {
  it.each(casos)('%s', async (_nombre, llamar, metodo, ruta, cuerpo) => {
    await pedir(llamar)
    expect(peticion).toMatchObject({ metodo, ruta })
    expect(peticion.cuerpo).toEqual(cuerpo)
  })

  it('el login no envia el token de la sesion', async () => {
    await authApi.iniciarSesion({ matricula: 'S23014587', pwd: 'x' })
    expect(peticion.auth).toBeNull()
    await pedir(() => usuariosApi.actual())
    expect(peticion.auth).toBe('Bearer token')
  })
})

describe('conParametros', () => {
  it('omite los valores vacios y los booleanos en false', () => {
    expect(conParametros('/x', { a: '', b: null, c: undefined, d: false, e: 0, f: 'á b' })).toBe(
      '/x?e=0&f=%C3%A1+b',
    )
    expect(conParametros('/x')).toBe('/x')
  })
})
