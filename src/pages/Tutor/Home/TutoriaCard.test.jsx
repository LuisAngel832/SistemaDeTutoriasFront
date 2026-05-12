import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import TutoriaCard from './TutoriaCard'

const fullTutoria = {
  idTutoria: 7,
  estado: 'PROGRAMADA',
  aula: '204',
  edificio: 'CUCEI',
  horario: { horaInicio: '08:30:00', horaFin: '10:00:00' },
  materia: { nombreMateria: 'Estructuras de Datos', nrc: '67890' },
}

describe('TutoriaCard', () => {
  it('renders all fields when data is complete', () => {
    render(<TutoriaCard tutoria={fullTutoria} />)

    expect(screen.getByText('Estructuras de Datos')).toBeInTheDocument()
    expect(screen.getByText('PROGRAMADA')).toBeInTheDocument()
    expect(screen.getByText('08:30')).toBeInTheDocument()
    expect(screen.getByText('67890')).toBeInTheDocument()
    expect(screen.getByText('204')).toBeInTheDocument()
    expect(screen.getByText('CUCEI')).toBeInTheDocument()
  })

  it('shows fallback placeholders when fields are missing', () => {
    render(<TutoriaCard tutoria={{ idTutoria: 1 }} />)

    expect(screen.getByText('Materia sin nombre')).toBeInTheDocument()
    // Hora, NRC, Aula, Edificio + estado fallback
    expect(screen.getAllByText('—').length).toBeGreaterThanOrEqual(4)
    expect(screen.queryByText(/undefined/i)).not.toBeInTheDocument()
  })

  it('applies a status-specific class for styling hooks', () => {
    render(<TutoriaCard tutoria={{ ...fullTutoria, estado: 'CANCELADA' }} />)

    const badge = screen.getByText('CANCELADA')
    expect(badge.className).toContain('estado-cancelada')
  })
})
