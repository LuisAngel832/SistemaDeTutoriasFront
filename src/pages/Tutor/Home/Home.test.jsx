import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import TutorHome from './Home'

const tutorias = [
  {
    idTutoria: 1,
    estado: 'PROGRAMADA',
    aula: '101',
    edificio: 'A',
    horario: { horaInicio: '10:00:00', horaFin: '11:00:00' },
    materia: { nombreMateria: 'Cálculo', nrc: '111' },
  },
  {
    idTutoria: 2,
    estado: 'CANCELADA',
    aula: '202',
    edificio: 'B',
    horario: { horaInicio: '14:00:00', horaFin: '15:00:00' },
    materia: { nombreMateria: 'Estructuras de Datos', nrc: '222' },
  },
]

const renderHome = () =>
  render(
    <MemoryRouter>
      <TutorHome />
    </MemoryRouter>,
  )

describe('TutorHome', () => {
  beforeEach(() => {
    localStorage.setItem('token', 'fake-token')
    vi.spyOn(globalThis, 'fetch')
  })

  afterEach(() => {
    vi.restoreAllMocks()
    localStorage.clear()
  })

  it('renders cards when the backend returns data', async () => {
    globalThis.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: tutorias }),
    })

    renderHome()

    expect(screen.getByText('Cargando tutorías...')).toBeInTheDocument()
    await waitFor(() =>
      expect(screen.getByText('Estructuras de Datos')).toBeInTheDocument(),
    )
    expect(screen.getByText('Cálculo')).toBeInTheDocument()
  })

  it('filters cards by estado and materia', async () => {
    globalThis.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: tutorias }),
    })

    renderHome()
    await waitFor(() => expect(screen.getByText('Cálculo')).toBeInTheDocument())

    await userEvent.selectOptions(
      screen.getByLabelText(/filtrar por estado/i),
      'CANCELADA',
    )
    expect(screen.queryByText('Cálculo')).not.toBeInTheDocument()
    expect(screen.getByText('Estructuras de Datos')).toBeInTheDocument()

    await userEvent.selectOptions(screen.getByLabelText(/filtrar por estado/i), '')
    await userEvent.type(screen.getByLabelText(/buscar tutoria/i), 'cálc')
    expect(screen.getByText('Cálculo')).toBeInTheDocument()
    expect(screen.queryByText('Estructuras de Datos')).not.toBeInTheDocument()
  })

  it('shows empty state with CTA when there are no tutorias', async () => {
    globalThis.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: [] }),
    })

    renderHome()

    await waitFor(() =>
      expect(screen.getByText(/aún no tienes tutorías/i)).toBeInTheDocument(),
    )
    expect(screen.getByRole('link', { name: /crear tutoría/i })).toHaveAttribute(
      'href',
      '/tutor/crear',
    )
  })

  it('shows no-match message when filters exclude everything', async () => {
    globalThis.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: tutorias }),
    })

    renderHome()
    await waitFor(() => expect(screen.getByText('Cálculo')).toBeInTheDocument())

    await userEvent.type(screen.getByLabelText(/buscar tutoria/i), 'xyz')
    expect(
      screen.getByText(/ninguna tutoría coincide con los filtros/i),
    ).toBeInTheDocument()
  })

  it('shows error and retries on click', async () => {
    globalThis.fetch
      .mockResolvedValueOnce({ ok: false, json: async () => ({ message: 'No autorizado' }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ data: tutorias }) })

    renderHome()

    await waitFor(() => expect(screen.getByText('No autorizado')).toBeInTheDocument())

    await userEvent.click(screen.getByRole('button', { name: /reintentar/i }))
    await waitFor(() => expect(screen.getByText('Cálculo')).toBeInTheDocument())
  })
})
