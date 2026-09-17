import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { MemoryRouter, Link } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import {
  Alert,
  Button,
  Chip,
  ConfirmDialog,
  FormField,
  Input,
  Modal,
  PasswordInput,
  RadioGroup,
} from './index'

describe('Button', () => {
  it('es type="button" por defecto para no enviar formularios por accidente', () => {
    render(<Button>Guardar</Button>)
    expect(screen.getByRole('button', { name: 'Guardar' })).toHaveAttribute('type', 'button')
  })

  it('en carga se deshabilita y lo anuncia con aria-busy', async () => {
    const onClick = vi.fn()
    render(
      <Button loading onClick={onClick}>
        Guardando...
      </Button>,
    )
    const boton = screen.getByRole('button', { name: 'Guardando...' })
    expect(boton).toBeDisabled()
    expect(boton).toHaveAttribute('aria-busy', 'true')
    await userEvent.click(boton)
    expect(onClick).not.toHaveBeenCalled()
  })

  it('puede renderizarse como enlace', () => {
    render(
      <MemoryRouter>
        <Button as={Link} to="/tutor/horarios">
          Ir a horarios
        </Button>
      </MemoryRouter>,
    )
    const enlace = screen.getByRole('link', { name: 'Ir a horarios' })
    expect(enlace).toHaveAttribute('href', '/tutor/horarios')
    expect(enlace).not.toHaveAttribute('type')
  })
})

describe('Alert', () => {
  it.each([
    ['error', 'alert'],
    ['warning', 'alert'],
    ['success', 'status'],
    ['info', 'status'],
  ])('tone %s usa role="%s"', (tone, rol) => {
    render(<Alert tone={tone}>Mensaje</Alert>)
    expect(screen.getByRole(rol)).toHaveTextContent('Mensaje')
  })
})

describe('Chip', () => {
  it('muestra un boton para quitarlo con nombre accesible', async () => {
    const onRemove = vi.fn()
    render(
      <Chip onRemove={onRemove} removeLabel="Quitar tema Costos">
        Costos
      </Chip>,
    )
    await userEvent.click(screen.getByRole('button', { name: 'Quitar tema Costos' }))
    expect(onRemove).toHaveBeenCalledTimes(1)
  })
})

describe('FormField', () => {
  it('asocia etiqueta, ayuda y error al control', () => {
    const { rerender } = render(
      <FormField label="Correo" htmlFor="correo" hint="Usa tu correo institucional">
        <Input id="correo" />
      </FormField>,
    )
    const campo = screen.getByLabelText('Correo')
    expect(campo).toHaveAccessibleDescription('Usa tu correo institucional')
    expect(campo).not.toHaveAttribute('aria-invalid')

    rerender(
      <FormField
        label="Correo"
        htmlFor="correo"
        hint="Usa tu correo institucional"
        error="Formato invalido"
      >
        <Input id="correo" />
      </FormField>,
    )
    expect(campo).toHaveAttribute('aria-invalid', 'true')
    expect(campo).toHaveAccessibleDescription('Formato invalido Usa tu correo institucional')
  })

  it('PasswordInput alterna la visibilidad de la contrasena', async () => {
    render(
      <FormField label="Contrasena" htmlFor="pwd">
        <PasswordInput id="pwd" />
      </FormField>,
    )
    const campo = screen.getByLabelText('Contrasena')
    const alternar = screen.getByRole('button', { name: 'Mostrar' })
    expect(campo).toHaveAttribute('type', 'password')

    await userEvent.click(alternar)
    expect(campo).toHaveAttribute('type', 'text')
    expect(screen.getByRole('button', { name: 'Ocultar' })).toHaveAttribute('aria-pressed', 'true')
  })
})

describe('RadioGroup', () => {
  const opciones = [
    { value: 'tutorado', label: 'Tutorado', description: 'Quiero inscribirme' },
    { value: 'tutor', label: 'Tutor', description: 'Quiero impartir' },
  ]

  const Controlado = () => {
    const [valor, setValor] = useState('tutorado')
    return (
      <RadioGroup
        name="rol"
        legend="Tipo de cuenta"
        options={opciones}
        value={valor}
        onChange={setValor}
      />
    )
  }

  it('usa radios nativos agrupados por la leyenda', async () => {
    render(<Controlado />)
    const grupo = screen.getByRole('group', { name: 'Tipo de cuenta' })
    expect(grupo).toBeInTheDocument()

    const tutorado = screen.getByRole('radio', { name: 'Tutorado' })
    const tutor = screen.getByRole('radio', { name: 'Tutor' })
    expect(tutor).toHaveAccessibleDescription('Quiero impartir')
    expect(tutorado).toBeChecked()

    await userEvent.click(screen.getByText('Tutor'))
    expect(tutor).toBeChecked()
    expect(tutorado).not.toBeChecked()
  })

  it('en la variante chip el nombre accesible es la etiqueta completa', () => {
    render(
      <RadioGroup
        name="dia"
        legend="Dia"
        variant="chip"
        options={[{ value: 'LUNES', label: 'Lunes', shortLabel: 'LUN' }]}
        value=""
        onChange={() => {}}
      />,
    )
    expect(screen.getByRole('radio', { name: 'Lunes' })).toBeInTheDocument()
  })
})

describe('Modal y ConfirmDialog', () => {
  it('se abre, se nombra con el titulo y avisa al cerrar con Escape o el fondo', () => {
    const onClose = vi.fn()
    const { rerender } = render(
      <Modal open={false} onClose={onClose} title="Resultado">
        <p>Contenido</p>
      </Modal>,
    )
    const dialogo = document.querySelector('dialog')
    expect(dialogo).not.toHaveAttribute('open')

    rerender(
      <Modal open onClose={onClose} title="Resultado">
        <p>Contenido</p>
      </Modal>,
    )
    expect(dialogo).toHaveAttribute('open')
    expect(dialogo).toHaveAccessibleName('Resultado')

    fireEvent(dialogo, new Event('cancel', { cancelable: true }))
    expect(onClose).toHaveBeenCalledTimes(1)

    fireEvent.keyDown(screen.getByText('Contenido'), { key: 'Escape' })
    expect(onClose).toHaveBeenCalledTimes(2)
    onClose.mockClear()

    fireEvent.click(screen.getByText('Contenido'))
    expect(onClose).not.toHaveBeenCalled()

    fireEvent.click(dialogo)
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('ConfirmDialog ejecuta la accion y no se cierra mientras carga', async () => {
    const onConfirm = vi.fn()
    const onCancel = vi.fn()
    const { rerender } = render(
      <ConfirmDialog
        open
        title="Cancelar tutoria"
        description="Los inscritos seran notificados."
        confirmLabel="Si, cancelar"
        tone="danger"
        onConfirm={onConfirm}
        onCancel={onCancel}
      />,
    )
    await userEvent.click(screen.getByRole('button', { name: 'Si, cancelar' }))
    expect(onConfirm).toHaveBeenCalledTimes(1)

    rerender(
      <ConfirmDialog
        open
        loading
        title="Cancelar tutoria"
        confirmLabel="Si, cancelar"
        onConfirm={onConfirm}
        onCancel={onCancel}
      />,
    )
    expect(screen.getByRole('button', { name: 'Volver' })).toBeDisabled()
    fireEvent(document.querySelector('dialog'), new Event('cancel', { cancelable: true }))
    expect(onCancel).not.toHaveBeenCalled()
  })
})
