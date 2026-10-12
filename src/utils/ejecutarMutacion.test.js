import { describe, expect, it } from 'vitest'
import { ApiError } from '@/api/client'
import { ejecutarMutacion } from './ejecutarMutacion'

const mutacion = (implementacion) => ({ mutateAsync: implementacion })

describe('ejecutarMutacion', () => {
  it('con exito devuelve el mensaje y lo que respondio el backend', async () => {
    const res = await ejecutarMutacion(
      mutacion(async (variables) => ({ recibido: variables })),
      { id: 3 },
      'Guardado.',
    )
    expect(res).toEqual({ ok: true, message: 'Guardado.', resultado: { recibido: { id: 3 } } })
  })

  it('con error devuelve el mensaje y los errores por campo', async () => {
    const error = new ApiError('Error de validación', {
      status: 400,
      data: { data: { nrc: 'El NRC ya existe.' } },
    })
    const res = await ejecutarMutacion(
      mutacion(async () => {
        throw error
      }),
    )
    expect(res).toEqual({
      ok: false,
      message: 'Error de validación',
      errores: { nrc: 'El NRC ya existe.' },
    })
  })

  it('los errores que no son del backend llegan sin errores por campo', async () => {
    const res = await ejecutarMutacion(
      mutacion(async () => {
        throw new Error('fallo')
      }),
    )
    expect(res).toEqual({ ok: false, message: 'fallo', errores: {} })
  })
})
