import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import { renderConProveedores } from '../../../test/render'
import { respuestaError, respuestaOk, servidor, usarServidorMock } from '../../../test/servidor'
import CrearTutoria from './CrearTutoria'

usarServidorMock()

const HORARIOS = [{ idHorario: 7, dia: 'Lunes', horaInicio: '10:00:00', horaFin: '12:00:00' }]
const MATERIAS = [{ nrc: 12345, materia: 'Cálculo' }]

// Fecha futura estable para no depender del dia en que corren las pruebas.
const FECHA = '2030-05-20'

const listasOk = () => {
  servidor.use(
    http.get('*/horario', () => HttpResponse.json(respuestaOk(HORARIOS))),
    http.get('*/materia', () => HttpResponse.json(respuestaOk(MATERIAS))),
  )
}

const llenarFormulario = async () => {
  const usuario = userEvent.setup()
  // Las opciones llegan de las consultas: se espera a que esten en el select.
  await screen.findByRole('option', { name: 'Cálculo (NRC 12345)' })
  await usuario.selectOptions(
    screen.getByLabelText('Experiencia Educativa que impartirás'),
    '12345',
  )
  await usuario.selectOptions(screen.getByLabelText('Horario en el que darás la tutoría'), '7')
  await usuario.type(screen.getByLabelText('Fecha en que se dará la tutoría'), FECHA)
  await usuario.selectOptions(screen.getByLabelText('Edificio donde se dará la tutoría'), '1')
  await usuario.selectOptions(screen.getByLabelText('Aula donde se dará la tutoría'), '5')
  return usuario
}

describe('CrearTutoria', () => {
  it('exige los campos obligatorios antes de llamar al backend', async () => {
    listasOk()
    let llamadas = 0
    servidor.use(
      http.post('*/tutoria', () => {
        llamadas += 1
        return HttpResponse.json(respuestaOk(null, 'Creada'))
      }),
    )
    renderConProveedores(<CrearTutoria />)

    await userEvent.click(await screen.findByRole('button', { name: 'Crear tutoría' }))

    expect(await screen.findByText('Elige la Experiencia Educativa')).toBeInTheDocument()
    expect(screen.getByText('Elige el horario')).toBeInTheDocument()
    expect(screen.getByText('Elige la fecha de la tutoría')).toBeInTheDocument()
    expect(screen.getByText('Elige el edificio')).toBeInTheDocument()
    expect(screen.getByText('Elige el aula')).toBeInTheDocument()
    expect(llamadas).toBe(0)
  })

  it('envía los datos como números, limpia el formulario y avisa del éxito', async () => {
    listasOk()
    let recibido = null
    servidor.use(
      http.post('*/tutoria', async ({ request }) => {
        recibido = await request.json()
        return HttpResponse.json(respuestaOk(null, 'Tutoría creada'))
      }),
    )
    renderConProveedores(<CrearTutoria />)

    const usuario = await llenarFormulario()
    await usuario.type(
      screen.getByLabelText('Temas a tratar durante la tutoría (opcional)'),
      'Derivadas',
    )
    await usuario.click(screen.getByRole('button', { name: 'Crear' }))
    await usuario.click(screen.getByRole('button', { name: 'Crear tutoría' }))

    await waitFor(() =>
      expect(recibido).toEqual({
        nrc: 12345,
        idHorario: 7,
        fecha: FECHA,
        edificio: 1,
        aula: 5,
        temas: ['Derivadas'],
      }),
    )
    expect(await screen.findByText('Tutoría creada')).toBeInTheDocument()
    expect(screen.getByLabelText('Horario en el que darás la tutoría')).toHaveValue('')
  })

  it('muestra el mensaje del backend cuando rechaza la tutoría', async () => {
    listasOk()
    servidor.use(
      http.post('*/tutoria', () =>
        HttpResponse.json(respuestaError('Ya tienes una tutoría en ese horario'), { status: 409 }),
      ),
    )
    renderConProveedores(<CrearTutoria />)

    const usuario = await llenarFormulario()
    await usuario.click(screen.getByRole('button', { name: 'Crear tutoría' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Ya tienes una tutoría en ese horario',
    )
  })

  it('avisa cuando el tutor no tiene horarios registrados', async () => {
    servidor.use(
      http.get('*/horario', () => HttpResponse.json(respuestaOk([]))),
      http.get('*/materia', () => HttpResponse.json(respuestaOk(MATERIAS))),
    )
    renderConProveedores(<CrearTutoria />)

    expect(await screen.findByText(/Primero/)).toBeInTheDocument()
    expect(screen.getByLabelText('Horario en el que darás la tutoría')).toBeDisabled()
  })
})
