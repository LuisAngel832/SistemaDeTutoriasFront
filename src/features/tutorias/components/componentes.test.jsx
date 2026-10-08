import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { cupo, detalleTutoria } from '@/test/fixtures'
import { BadgeEstado } from './BadgeEstado'
import { BarraCupo } from './BarraCupo'
import { HorariosSemana } from './HorariosSemana'
import { HorariosYTemas } from './HorariosYTemas'
import { MedidorInasistencias } from './MedidorInasistencias'
import { TemasInput } from './TemasInput'

describe('BadgeEstado', () => {
  it('muestra el texto de cada estado y el valor crudo si no lo conoce', () => {
    const { rerender } = render(<BadgeEstado tipo="sesion" estado="LISTA_ABIERTA" />)
    expect(screen.getByText('Lista abierta')).toBeInTheDocument()

    rerender(<BadgeEstado tipo="inscripcion" estado="BAJA_AUTOMATICA" />)
    expect(screen.getByText('Baja automática')).toBeInTheDocument()

    rerender(<BadgeEstado tipo="tutoria" estado="OTRO" />)
    expect(screen.getByText('OTRO')).toBeInTheDocument()
  })
})

describe('BarraCupo', () => {
  it('describe la ocupacion para lectores de pantalla', () => {
    render(<BarraCupo cupo={cupo(6)} />)
    const barra = screen.getByRole('meter', { name: 'Cupo: 6 de 7 lugares ocupados' })
    expect(barra).toHaveAttribute('aria-valuenow', '6')
    expect(screen.getByText('6 de 7')).toBeInTheDocument()
  })

  it('en la variante mini muestra la cifra compacta', () => {
    render(<BarraCupo cupo={cupo(7)} variante="mini" />)
    expect(screen.getByText('7/7')).toBeInTheDocument()
  })
})

describe('MedidorInasistencias', () => {
  it('muestra las permitidas o, con baja, el total', () => {
    const { rerender } = render(<MedidorInasistencias inasistencias={1} />)
    expect(screen.getByText('1 de 2 permitidas')).toBeInTheDocument()
    expect(screen.getByRole('meter')).toHaveAttribute('aria-valuemax', '3')

    rerender(<MedidorInasistencias inasistencias={3} />)
    expect(screen.getByText('3 inasistencias')).toBeInTheDocument()
  })
})

describe('HorariosSemana', () => {
  it('ordena de lunes a viernes y nombra el dia completo', () => {
    render(
      <HorariosSemana
        horarios={[
          { dia: 'MIERCOLES', horaInicio: '10:00', horaFin: '12:00' },
          { dia: 'LUNES', horaInicio: '08:00', horaFin: '10:00' },
        ]}
      />,
    )
    const filas = screen.getAllByRole('listitem')
    expect(filas[0]).toHaveTextContent('Lunes')
    expect(filas[0]).toHaveTextContent('08:00 – 10:00')
    expect(filas[1]).toHaveTextContent('Miércoles')
  })
})

describe('HorariosYTemas', () => {
  const { horarios } = detalleTutoria()

  it('muestra los temas de cada horario en solo lectura', () => {
    render(<HorariosYTemas horarios={horarios} />)
    expect(screen.getByRole('list', { name: 'Temas del lunes' })).toBeInTheDocument()
    expect(screen.getByText('Montículos')).toBeInTheDocument()
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('en modo editable agrega y quita temas por horario', async () => {
    const onAgregarTema = vi.fn().mockResolvedValue({ ok: true })
    const onQuitarTema = vi.fn()
    render(
      <HorariosYTemas
        horarios={horarios}
        editable
        onAgregarTema={onAgregarTema}
        onQuitarTema={onQuitarTema}
      />,
    )

    const campo = screen.getByRole('textbox', { name: 'Tema nuevo para el miércoles' })
    await userEvent.type(campo, 'Grafos{Enter}')
    expect(onAgregarTema).toHaveBeenCalledWith(horarios[1], 'Grafos')
    expect(campo).toHaveValue('')

    const lunes = screen.getByRole('list', { name: 'Temas del lunes' })
    await userEvent.click(
      within(lunes).getByRole('button', { name: 'Quitar el tema Recursividad' }),
    )
    expect(onQuitarTema).toHaveBeenCalledWith(horarios[0].temas[2], horarios[0])
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

  it('respeta el maximo de temas y cuenta los caracteres', async () => {
    render(<Controlado inicial={['Uno', 'Dos']} max={2} maxCaracteres={5} />)
    expect(screen.getByRole('textbox', { name: 'Tema nuevo' })).toBeDisabled()
    expect(screen.getByText('2/2 temas')).toBeInTheDocument()
    expect(screen.getByText('0/5 caracteres')).toBeInTheDocument()
  })
})
