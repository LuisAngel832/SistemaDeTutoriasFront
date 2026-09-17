import { act, renderHook, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { ApiError } from '../api/client'
import { useRecurso } from './useRecurso'

const promesaControlada = () => {
  let resolver
  let rechazar
  const promesa = new Promise((res, rej) => {
    resolver = res
    rechazar = rej
  })
  return { promesa, resolver, rechazar }
}

describe('useRecurso', () => {
  it('carga los datos al montar', async () => {
    const cargador = vi.fn().mockResolvedValue(['a', 'b'])
    const { result } = renderHook(() => useRecurso(cargador, []))

    expect(result.current.isLoading).toBe(true)
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.datos).toEqual(['a', 'b'])
    expect(result.current.error).toBe('')
    expect(cargador).toHaveBeenCalledWith({ signal: expect.any(AbortSignal) })
  })

  it('expone el mensaje del error y conserva el valor inicial', async () => {
    const cargador = vi.fn().mockRejectedValue(new ApiError('No se pudo cargar'))
    const { result } = renderHook(() => useRecurso(cargador, []))

    await waitFor(() => expect(result.current.error).toBe('No se pudo cargar'))
    expect(result.current.datos).toEqual([])
    expect(result.current.isLoading).toBe(false)
  })

  it('cancela la peticion al desmontar', async () => {
    let signal
    const cargador = vi.fn(({ signal: s }) => {
      signal = s
      return new Promise(() => {})
    })
    const { unmount } = renderHook(() => useRecurso(cargador, null))

    unmount()
    expect(signal.aborted).toBe(true)
  })

  it('refrescar actualiza sin volver a mostrar la carga', async () => {
    const primera = promesaControlada()
    const segunda = promesaControlada()
    const cargador = vi
      .fn()
      .mockReturnValueOnce(primera.promesa)
      .mockReturnValueOnce(segunda.promesa)
    const { result } = renderHook(() => useRecurso(cargador, 0))

    await act(async () => primera.resolver(1))
    expect(result.current).toMatchObject({ datos: 1, isLoading: false })

    let refresco
    act(() => {
      refresco = result.current.refrescar()
    })
    expect(result.current.isLoading).toBe(false)

    await act(async () => {
      segunda.resolver(2)
      await refresco
    })
    expect(result.current.datos).toBe(2)
  })

  it('recargar muestra la carga y cancela la peticion anterior', async () => {
    const signals = []
    const cargador = vi.fn(({ signal }) => {
      signals.push(signal)
      return new Promise(() => {})
    })
    const { result } = renderHook(() => useRecurso(cargador, null))

    act(() => {
      result.current.recargar()
    })

    expect(result.current.isLoading).toBe(true)
    expect(signals).toHaveLength(2)
    expect(signals[0].aborted).toBe(true)
    expect(signals[1].aborted).toBe(false)
  })
})
