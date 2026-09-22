import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { AccionesTutoria } from './AccionesTutoria'
import { EditarTutoriaForm } from './EditarTutoriaForm'
import { EstadoBadge } from './EstadoBadge'
import { InscritosList } from './InscritosList'
import { TemasInput } from './TemasInput'
import { TutoriaCard } from './TutoriaCard'
import { TutoriaInfoGrid } from './TutoriaInfoGrid'

const tutoria = {
  id: 1,
  materia: 'Contabilidad Financiera',
  nombreTutor: 'Ana Garcia Lopez',
  fecha: '2026-09-21',
  horaInicio: '10:00:00',
  horaFin: '12:00:00',
  edificio: 1,
  aula: 5,
  estado: 'PROGRAMADA',
  temas: [{ idTema: 3, tema: 'Balance general' }],
}

const conRouter = (ui) => render(<MemoryRouter>{ui}</MemoryRouter>)

describe('EstadoBadge', () => {
  it('muestra el estado con texto legible', () => {
    render(<EstadoBadge estado="COMPLETADA" />)
    expect(screen.getByText('Completada')).toBeInTheDocument()
  })
})

describe('TutoriaCard', () => {
  it('variante tutor: el titulo es el enlace al detalle', () => {
    conRouter(<TutoriaCard tutoria={tutoria} to="/tutor/tutorias/1" />)
    const tarjeta = screen.getByRole('article', { name: 'Contabilidad Financiera' })
    expect(within(tarjeta).getByRole('link', { name: 'Contabilidad Financiera' })).toHaveAttribute(
      'href',
      '/tutor/tutorias/1',
    )
    expect(within(tarjeta).getByText('Programada')).toBeInTheDocument()
    expect(within(tarjeta).getByText('Balance general')).toBeInTheDocument()
  })

  it('variante explorar: boton de detalle descrito por el titulo', () => {
    conRouter(<TutoriaCard tutoria={tutoria} to="/tutorado/tutorias/1" variant="explorar" />)
    const enlace = screen.getByRole('link', { name: /Ver detalle e inscribirme/ })
    expect(enlace).toHaveAttribute('href', '/tutorado/tutorias/1')
    expect(enlace).toHaveAccessibleDescription('Contabilidad Financiera')
    expect(screen.getByText('Imparte Ana Garcia Lopez')).toBeInTheDocument()
  })

  it('variante inscripcion sin datos muestra un aviso', () => {
    conRouter(<TutoriaCard tutoria={{ idAsistencia: 4 }} variant="inscripcion" />)
    expect(screen.getByText('Inscripción sin detalles')).toBeInTheDocument()
  })
})

describe('TutoriaInfoGrid', () => {
  it('presenta los datos como lista de definiciones', () => {
    render(<TutoriaInfoGrid tutoria={tutoria} />)
    expect(screen.getByText('Fecha').closest('div')).toHaveTextContent(
      'lunes, 21 de septiembre de 2026',
    )
    expect(screen.getByText('Horario').closest('div')).toHaveTextContent('10:00 – 12:00')
    expect(screen.getByText('Aula').closest('div')).toHaveTextContent('5')
  })
})

describe('TemasInput', () => {
  const Controlado = ({ inicial = [], ...props }) => {
    const [temas, setTemas] = useState(inicial)
    return (
      <TemasInput
        temas={temas}
        onAdd={(tema) => setTemas((actuales) => [...actuales, tema])}
        onRemove={(tema) => setTemas((actuales) => actuales.filter((t) => t !== tema))}
        {...props}
      />
    )
  }

  it('agrega con Enter o coma y quita con el boton del chip', async () => {
    render(<Controlado />)
    const campo = screen.getByRole('textbox', { name: 'Tema nuevo' })

    await userEvent.type(campo, 'Costos{Enter}')
    await userEvent.type(campo, 'Presupuestos,')
    expect(screen.getByText('Costos')).toBeInTheDocument()
    expect(screen.getByText('Presupuestos')).toBeInTheDocument()
    expect(campo).toHaveValue('')

    await userEvent.click(screen.getByRole('button', { name: 'Quitar tema Costos' }))
    expect(screen.queryByText('Costos')).not.toBeInTheDocument()
  })

  it('respeta el maximo de temas y de caracteres', async () => {
    render(<Controlado inicial={['Uno', 'Dos']} max={2} maxCaracteres={5} />)
    expect(screen.getByRole('textbox', { name: 'Tema nuevo' })).toBeDisabled()
    expect(screen.getByText('2/2 temas')).toBeInTheDocument()
  })

  it('en modo compacto solo permite quitar los temas indicados', () => {
    render(
      <TemasInput
        compact
        temas={[
          { idTema: 1, tema: 'Guardado' },
          { idTema: null, tema: 'Sin id' },
        ]}
        onAdd={vi.fn()}
        onRemove={vi.fn()}
        canRemove={(tema) => Boolean(tema.idTema)}
      />,
    )
    expect(screen.getByRole('button', { name: 'Agregar tema' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Quitar tema Guardado' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Quitar tema Sin id' })).not.toBeInTheDocument()
  })
})

describe('InscritosList', () => {
  const inscritos = [
    { idAsistencia: 1, matricula: '2001', nombre: 'Luis Perez', asistio: true },
    { idAsistencia: 2, matricula: '2002', nombre: 'Maria Soto', asistio: false },
  ]

  it('muestra pendiente antes de la sesion y la asistencia despues', () => {
    const { rerender } = render(<InscritosList inscritos={inscritos} mostrarAsistencia={false} />)
    expect(screen.getAllByText('Pendiente')).toHaveLength(2)

    rerender(<InscritosList inscritos={inscritos} mostrarAsistencia />)
    expect(screen.getByText('Asistió')).toBeInTheDocument()
    expect(screen.getByText('No asistió')).toBeInTheDocument()
  })
})

describe('AccionesTutoria', () => {
  it('pide confirmacion antes de cancelar', async () => {
    const onCancelar = vi.fn().mockResolvedValue({ ok: true })
    render(
      <AccionesTutoria
        tutoria={tutoria}
        puedeCompletar={false}
        puedeCancelar
        isSubmitting={false}
        onCompletar={vi.fn()}
        onCancelar={onCancelar}
      />,
    )

    const completar = screen.getByRole('button', { name: 'Marcar como completada' })
    expect(completar).toBeDisabled()
    expect(completar).toHaveAccessibleDescription(/cuando inicie la sesión/)

    await userEvent.click(screen.getByRole('button', { name: 'Cancelar tutoría' }))
    expect(onCancelar).not.toHaveBeenCalled()

    await userEvent.click(screen.getByRole('button', { name: 'Sí, cancelar' }))
    expect(onCancelar).toHaveBeenCalledTimes(1)
  })

  it('en una tutoria finalizada solo informa el estado', () => {
    render(<AccionesTutoria tutoria={{ ...tutoria, estado: 'CANCELADA' }} />)
    expect(screen.getByText(/Esta tutoría está cancelada/)).toBeInTheDocument()
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })
})

describe('EditarTutoriaForm', () => {
  const horarios = [{ idHorario: 7, dia: 'Lunes', horaInicio: '10:00:00', horaFin: '12:00:00' }]

  it('precarga los datos actuales y envia el payload numerico', async () => {
    const onGuardar = vi.fn().mockResolvedValue({ ok: true })
    render(
      <EditarTutoriaForm
        tutoria={tutoria}
        horarios={horarios}
        isSubmitting={false}
        onGuardar={onGuardar}
        onCancelar={vi.fn()}
      />,
    )

    expect(screen.getByLabelText('Horario en el que darás la tutoría')).toHaveValue('7')
    expect(screen.getByLabelText('Aula donde se dará la tutoría')).toHaveValue('5')

    await userEvent.click(screen.getByRole('button', { name: 'Guardar cambios' }))
    expect(onGuardar).toHaveBeenCalledWith({
      idHorario: 7,
      fecha: '2026-09-21',
      edificio: 1,
      aula: 5,
    })
  })

  it('muestra el error de validacion o del backend', async () => {
    const onGuardar = vi.fn().mockResolvedValue({ ok: false, message: 'El horario no existe' })
    render(
      <EditarTutoriaForm
        tutoria={{ ...tutoria, aula: null }}
        horarios={horarios}
        isSubmitting={false}
        onGuardar={onGuardar}
        onCancelar={vi.fn()}
      />,
    )

    await userEvent.click(screen.getByRole('button', { name: 'Guardar cambios' }))
    expect(await screen.findByText('Elige el aula')).toBeInTheDocument()
    expect(onGuardar).not.toHaveBeenCalled()

    await userEvent.selectOptions(screen.getByLabelText('Aula donde se dará la tutoría'), '3')
    await userEvent.click(screen.getByRole('button', { name: 'Guardar cambios' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('El horario no existe')
  })
})
