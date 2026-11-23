import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useEsperaLarga } from './useEsperaLarga'

beforeEach(() => vi.useFakeTimers())
afterEach(() => vi.useRealTimers())

describe('useEsperaLarga', () => {
  it('se enciende solo cuando la espera supera el limite', () => {
    const { result } = renderHook(() => useEsperaLarga(true, 5000))
    expect(result.current).toBe(false)

    act(() => vi.advanceTimersByTime(4999))
    expect(result.current).toBe(false)

    act(() => vi.advanceTimersByTime(1))
    expect(result.current).toBe(true)
  })

  it('se apaga al terminar y vuelve a contar desde cero en la siguiente espera', () => {
    const { result, rerender } = renderHook(({ activo }) => useEsperaLarga(activo, 5000), {
      initialProps: { activo: true },
    })
    act(() => vi.advanceTimersByTime(5000))
    expect(result.current).toBe(true)

    rerender({ activo: false })
    expect(result.current).toBe(false)

    rerender({ activo: true })
    expect(result.current).toBe(false)
    act(() => vi.advanceTimersByTime(5000))
    expect(result.current).toBe(true)
  })

  it('no se enciende si nunca estuvo activo', () => {
    const { result } = renderHook(() => useEsperaLarga(false, 5000))
    act(() => vi.advanceTimersByTime(10_000))
    expect(result.current).toBe(false)
  })
})
