import { delay, http, HttpResponse } from 'msw'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { respuestaError, respuestaOk, servidor, usarServidorMock } from '@/test/servidor'
import { api, ApiError, configureApi, esCancelacion, MENSAJES_ERROR } from './client'

usarServidorMock()

const onUnauthorized = vi.fn()

beforeEach(() => {
  onUnauthorized.mockReset()
  configureApi({ getToken: () => 'token-de-prueba', onUnauthorized })
})

const capturarError = async (promesa) => {
  try {
    await promesa
  } catch (error) {
    return error
  }
  throw new Error('Se esperaba que la peticion fallara')
}

describe('respuestas correctas', () => {
  it('devuelve data y envia el token y el cuerpo en JSON', async () => {
    let recibido
    servidor.use(
      http.post('*/tutorias', async ({ request }) => {
        recibido = {
          auth: request.headers.get('Authorization'),
          tipo: request.headers.get('Content-Type'),
          cuerpo: await request.json(),
        }
        return HttpResponse.json(respuestaOk({ idTutoria: 7 }, 'Tutoría creada.'))
      }),
    )

    await expect(api.post('/tutorias', { aula: 3 })).resolves.toEqual({ idTutoria: 7 })
    expect(recibido).toEqual({
      auth: 'Bearer token-de-prueba',
      tipo: 'application/json',
      cuerpo: { aula: 3 },
    })
  })

  it('no envia el token cuando auth es false', async () => {
    let auth = 'sin revisar'
    servidor.use(
      http.post('*/auth/microsoft', ({ request }) => {
        auth = request.headers.get('Authorization')
        return HttpResponse.json(respuestaOk({ registroPendiente: false, token: 't' }))
      }),
    )

    await api.post('/auth/microsoft', {}, { auth: false })
    expect(auth).toBeNull()
  })

  it('devuelve null si la respuesta no tiene cuerpo', async () => {
    servidor.use(http.delete('*/temas/1', () => new HttpResponse(null, { status: 204 })))
    await expect(api.delete('/temas/1')).resolves.toBeNull()
  })
})

describe('errores del backend', () => {
  it('usa el mensaje del backend en un 400', async () => {
    servidor.use(
      http.delete('*/tutorias/1', () =>
        HttpResponse.json(
          respuestaError('Ya no puedes cancelar: faltan menos de 15 minutos para la sesión.'),
          { status: 400 },
        ),
      ),
    )

    const error = await capturarError(api.delete('/tutorias/1'))
    expect(error).toBeInstanceOf(ApiError)
    expect(error.status).toBe(400)
    expect(error.message).toBe('Ya no puedes cancelar: faltan menos de 15 minutos para la sesión.')
  })

  it('agrega el primer error de validacion al mensaje', async () => {
    servidor.use(
      http.post('*/auth/registro', () =>
        HttpResponse.json(
          respuestaError('Error de validación', {
            matricula: 'La matrícula ya está registrada con otra cuenta.',
          }),
          { status: 400 },
        ),
      ),
    )

    const error = await capturarError(api.post('/auth/registro', {}, { auth: false }))
    expect(error.message).toBe(
      'Error de validación: La matrícula ya está registrada con otra cuenta.',
    )
    expect(error.errores).toEqual({ matricula: 'La matrícula ya está registrada con otra cuenta.' })
  })

  it('no expone errores de campo en los errores de negocio', async () => {
    servidor.use(
      http.post('*/inscripciones', () =>
        HttpResponse.json(respuestaError('La tutoría ya no tiene lugares disponibles.'), {
          status: 400,
        }),
      ),
    )

    const error = await capturarError(api.post('/inscripciones', { idTutoria: 1 }))
    expect(error.errores).toEqual({})
  })

  it('trata success: false como error aunque el status sea 200', async () => {
    servidor.use(
      http.get('*/sesiones/hoy', () => HttpResponse.json(respuestaError('Sin sesiones'))),
    )
    const error = await capturarError(api.get('/sesiones/hoy'))
    expect(error.message).toBe('Sin sesiones')
  })

  it('avisa a la sesion ante un 401 con cuerpo de texto', async () => {
    servidor.use(
      http.get('*/tutorias/mis-tutorias', () =>
        HttpResponse.text('Token inválido o expirado', { status: 401 }),
      ),
    )

    const error = await capturarError(api.get('/tutorias/mis-tutorias'))
    expect(onUnauthorized).toHaveBeenCalledTimes(1)
    expect(error.status).toBe(401)
    expect(error.message).toBe(MENSAJES_ERROR.sesion)
  })

  it('no avisa a la sesion por un 401 en peticiones sin autenticacion', async () => {
    servidor.use(http.post('*/auth/microsoft', () => new HttpResponse(null, { status: 401 })))
    await capturarError(api.post('/auth/microsoft', {}, { auth: false }))
    expect(onUnauthorized).not.toHaveBeenCalled()
  })

  it('usa un mensaje de permisos en el 403 por defecto de Spring', async () => {
    servidor.use(
      http.get('*/tutorias', () =>
        HttpResponse.json({ status: 403, error: 'Forbidden' }, { status: 403 }),
      ),
    )
    const error = await capturarError(api.get('/tutorias'))
    expect(error.message).toBe(MENSAJES_ERROR.permisos)
  })

  it('usa un mensaje generico en un 500 sin cuerpo o con HTML', async () => {
    servidor.use(
      http.get('*/materias', () => new HttpResponse(null, { status: 500 })),
      http.get('*/sesiones/hoy', () =>
        HttpResponse.html('<html>Bad Gateway</html>', { status: 502 }),
      ),
    )
    expect((await capturarError(api.get('/materias'))).message).toBe(MENSAJES_ERROR.generico)
    expect((await capturarError(api.get('/sesiones/hoy'))).message).toBe(MENSAJES_ERROR.generico)
  })
})

describe('red, timeout y cancelacion', () => {
  it('informa cuando no hay conexion', async () => {
    servidor.use(http.get('*/materias', () => HttpResponse.error()))
    const error = await capturarError(api.get('/materias'))
    expect(error).toBeInstanceOf(ApiError)
    expect(error.message).toBe(MENSAJES_ERROR.red)
  })

  it('corta la peticion cuando se excede el timeout', async () => {
    servidor.use(
      http.get('*/materias', async () => {
        await delay('infinite')
        return HttpResponse.json(respuestaOk([]))
      }),
    )
    const error = await capturarError(api.get('/materias', { timeout: 30 }))
    expect(error.message).toBe(MENSAJES_ERROR.timeout)
  })

  it('rechaza con AbortError si quien llama cancela la peticion', async () => {
    servidor.use(
      http.get('*/materias', async () => {
        await delay('infinite')
        return HttpResponse.json(respuestaOk([]))
      }),
    )
    const controller = new AbortController()
    const promesa = api.get('/materias', { signal: controller.signal })
    controller.abort()

    const error = await capturarError(promesa)
    expect(esCancelacion(error)).toBe(true)
  })
})
