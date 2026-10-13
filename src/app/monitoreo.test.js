import * as Sentry from '@sentry/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ApiError } from '@/api/client'

vi.mock('@sentry/react', () => ({ init: vi.fn(), captureException: vi.fn() }))

// El modulo guarda si ya se inicio: cada prueba lo carga de nuevo.
let monitoreo
beforeEach(async () => {
  vi.resetModules()
  vi.mocked(Sentry.init).mockClear()
  vi.mocked(Sentry.captureException).mockClear()
  monitoreo = await import('./monitoreo')
})

describe('debeReportarse', () => {
  it.each([
    ['un error de programacion', new TypeError('x is undefined'), true],
    ['un 5xx del backend', new ApiError('Error', { status: 502 }), true],
    ['un 4xx del backend', new ApiError('No encontrado', { status: 404 }), false],
    ['una sesion vencida', new ApiError('Sesion', { status: 401 }), false],
    ['un fallo de red o timeout', new ApiError('Error al conectar con el servidor'), false],
    ['una cancelacion', new DOMException('Peticion cancelada', 'AbortError'), false],
    ['un 404 del router', { status: 404, statusText: 'Not Found', data: null }, false],
    ['un 500 del router', { status: 500, statusText: 'Error', data: null }, true],
    ['nada', undefined, false],
  ])('%s -> %s', (_caso, error, esperado) => {
    expect(monitoreo.debeReportarse(error)).toBe(esperado)
  })
})

describe('iniciarMonitoreo', () => {
  it('sin DSN no carga el SDK ni envia errores', async () => {
    expect(await monitoreo.iniciarMonitoreo({ dsn: '' })).toBe(false)
    monitoreo.reportarError(new Error('fallo'))

    expect(Sentry.init).not.toHaveBeenCalled()
    expect(Sentry.captureException).not.toHaveBeenCalled()
  })

  it('con DSN inicia Sentry sin datos personales y con el release', async () => {
    expect(
      await monitoreo.iniciarMonitoreo({
        dsn: 'https://clave@o1.ingest.sentry.io/1',
        release: 'abc123',
        entorno: 'production',
      }),
    ).toBe(true)

    expect(Sentry.init).toHaveBeenCalledTimes(1)
    expect(Sentry.init).toHaveBeenCalledWith(
      expect.objectContaining({
        dsn: 'https://clave@o1.ingest.sentry.io/1',
        release: 'abc123',
        environment: 'production',
        dataCollection: expect.objectContaining({
          userInfo: false,
          httpHeaders: false,
          httpBodies: [],
        }),
      }),
    )
    expect(await monitoreo.iniciarMonitoreo({ dsn: 'https://otro@o1.ingest.sentry.io/1' })).toBe(
      false,
    )
    expect(Sentry.init).toHaveBeenCalledTimes(1)
  })

  it('envia los errores ocurridos mientras se descargaba el SDK', async () => {
    const inicio = monitoreo.iniciarMonitoreo({ dsn: 'https://clave@o1.ingest.sentry.io/1' })
    const temprano = new Error('antes de cargar')
    monitoreo.reportarError(temprano, { origen: 'router' })
    await inicio

    expect(Sentry.captureException).toHaveBeenCalledWith(temprano, {
      tags: { origen: 'router' },
      extra: undefined,
    })
  })
})

describe('reportarError', () => {
  it('envia los errores inesperados con su origen y omite los esperados', async () => {
    await monitoreo.iniciarMonitoreo({ dsn: 'https://clave@o1.ingest.sentry.io/1' })
    const error = new ApiError('Error', { status: 500 })

    monitoreo.reportarError(error, { origen: 'query', extra: { clave: ['tutorias'] } })
    monitoreo.reportarError(new ApiError('Datos invalidos', { status: 400 }), { origen: 'query' })

    expect(Sentry.captureException).toHaveBeenCalledTimes(1)
    expect(Sentry.captureException).toHaveBeenCalledWith(error, {
      tags: { origen: 'query' },
      extra: { clave: ['tutorias'] },
    })
  })
})

describe('respuestas con otra forma', () => {
  it('se reportan con la ruta y los campos que fallaron', async () => {
    const { RespuestaInvalidaError } = await import('@/api/client')
    await monitoreo.iniciarMonitoreo({ dsn: 'https://clave@o1.ingest.sentry.io/1' })
    const error = new RespuestaInvalidaError('GET /tutorias/12', ['materia: se esperaba string'])

    monitoreo.reportarError(error, { origen: 'query', extra: { clave: ['tutorias', 12] } })

    expect(Sentry.captureException).toHaveBeenCalledWith(error, {
      tags: { origen: 'query' },
      extra: {
        clave: ['tutorias', 12],
        ruta: 'GET /tutorias/12',
        detalles: ['materia: se esperaba string'],
      },
    })
  })
})
