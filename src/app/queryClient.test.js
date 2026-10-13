import { describe, expect, it, vi } from 'vitest'
import { ApiError, RespuestaInvalidaError } from '@/api/client'
import { reportarError } from './monitoreo'
import { crearQueryClient } from './queryClient'

vi.mock('./monitoreo', () => ({ reportarError: vi.fn() }))

describe('crearQueryClient', () => {
  it('reporta los errores de las consultas con su clave', async () => {
    const error = new ApiError('Error', { status: 500 })
    const cliente = crearQueryClient()

    await expect(
      cliente.fetchQuery({
        queryKey: ['tutorias', 3],
        queryFn: () => Promise.reject(error),
        retry: 0,
      }),
    ).rejects.toBe(error)

    expect(reportarError).toHaveBeenCalledWith(error, {
      origen: 'query',
      extra: { clave: ['tutorias', 3] },
    })
  })

  it('reporta los errores de las mutaciones sin sus variables', async () => {
    const error = new TypeError('fallo')
    const cliente = crearQueryClient()
    const mutacion = cliente.getMutationCache().build(cliente, {
      mutationKey: ['inscribirse'],
      mutationFn: () => Promise.reject(error),
    })

    await expect(mutacion.execute({ matricula: 'S23014587' })).rejects.toBe(error)

    expect(reportarError).toHaveBeenCalledWith(error, {
      origen: 'mutation',
      extra: { clave: ['inscribirse'] },
    })
  })
})

describe('reintentos', () => {
  const reintentar = (error, intentos = 0) =>
    crearQueryClient().getDefaultOptions().queries.retry(intentos, error)

  it('reintenta una vez los fallos del servidor y de red', () => {
    expect(reintentar(new ApiError('Error', { status: 502 }))).toBe(true)
    expect(reintentar(new ApiError('Error al conectar con el servidor'))).toBe(true)
    expect(reintentar(new ApiError('Error', { status: 502 }), 1)).toBe(false)
  })

  it('no reintenta un 4xx ni una respuesta con otra forma', () => {
    expect(reintentar(new ApiError('No encontrado', { status: 404 }))).toBe(false)
    expect(reintentar(new RespuestaInvalidaError('GET /x', []))).toBe(false)
  })
})
