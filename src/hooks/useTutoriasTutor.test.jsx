import { renderHook, waitFor, act } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useTutoriasTutor } from './useTutoriasTutor'

const tutoriaSample = {
  idTutoria: 1,
  estado: 'PROGRAMADA',
  aula: '101',
  edificio: 'A',
  horario: { horaInicio: '10:00', horaFin: '11:00' },
  materia: { nombreMateria: 'Cálculo', nrc: '12345' },
}

describe('useTutoriasTutor', () => {
  beforeEach(() => {
    localStorage.setItem('token', 'fake-token')
    vi.spyOn(global, 'fetch')
  })

  afterEach(() => {
    vi.restoreAllMocks()
    localStorage.clear()
  })

  it('loads tutorias on mount', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: [tutoriaSample] }),
    })

    const { result } = renderHook(() => useTutoriasTutor())

    expect(result.current.isLoading).toBe(true)
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.tutorias).toEqual([tutoriaSample])
    expect(result.current.error).toBe('')
  })

  it('exposes a friendly error on non-ok response', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ message: 'No autorizado' }),
    })

    const { result } = renderHook(() => useTutoriasTutor())

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.tutorias).toEqual([])
    expect(result.current.error).toBe('No autorizado')
  })

  it('falls back to generic message when backend gives none', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({}),
    })

    const { result } = renderHook(() => useTutoriasTutor())

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.error).toBe('No se pudieron cargar las tutorias')
  })

  it('handles network failure without crashing', async () => {
    global.fetch.mockRejectedValueOnce(new Error('network down'))

    const { result } = renderHook(() => useTutoriasTutor())

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.tutorias).toEqual([])
    expect(result.current.error).toBe('Error al conectar con el servidor')
  })

  it('refetch reruns the request and clears previous error', async () => {
    global.fetch
      .mockResolvedValueOnce({ ok: false, json: async () => ({ message: 'boom' }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ data: [tutoriaSample] }) })

    const { result } = renderHook(() => useTutoriasTutor())

    await waitFor(() => expect(result.current.error).toBe('boom'))

    await act(async () => {
      await result.current.refetch()
    })

    expect(result.current.error).toBe('')
    expect(result.current.tutorias).toEqual([tutoriaSample])
  })
})
