import { describe, expect, it, vi } from 'vitest'
import { ApiError } from '@/api/client'
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
