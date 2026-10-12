import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import { renderConProveedores } from '@/test/render'
import { respuestaOk, servidor, usarServidorMock } from '@/test/servidor'
import { Comentarios } from './Comentarios'

usarServidorMock()

const comentario = (idComentario, texto, cambios = {}) => ({
  idComentario,
  matricula: 'S23011873',
  nombreCompleto: 'Diego Ramírez Soto',
  comentario: texto,
  fechaComentario: '2026-10-04T19:22:00-06:00',
  esMio: false,
  ...cambios,
})

const renderComentarios = (props) => renderConProveedores(<Comentarios idTutoria={7} {...props} />)

describe('Comentarios', () => {
  it('marca los comentarios propios con "Tú" y permite borrarlos', async () => {
    let comentarios = [
      comentario(1, 'Mio', { nombreCompleto: 'Valeria Mendoza Cruz', esMio: true }),
      comentario(2, 'Ajeno'),
    ]
    servidor.use(
      http.get('*/tutorias/7/comentarios', () => HttpResponse.json(respuestaOk(comentarios))),
      http.delete('*/comentarios/1', () => {
        comentarios = comentarios.filter((c) => c.idComentario !== 1)
        return HttpResponse.json(respuestaOk(null, 'Comentario eliminado.'))
      }),
    )
    renderComentarios({ modo: 'tutorado' })

    expect(await screen.findByText('Mio')).toBeInTheDocument()
    expect(screen.getByText('Tú')).toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: 'Eliminar mi comentario' })).toHaveLength(1)

    // Pide confirmacion: si se cancela, el comentario se queda.
    await userEvent.click(screen.getByRole('button', { name: 'Eliminar mi comentario' }))
    const dialogo = await screen.findByRole('dialog', { name: '¿Eliminar tu comentario?' })
    await userEvent.click(within(dialogo).getByRole('button', { name: 'Volver' }))
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
    expect(screen.getByText('Mio')).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Eliminar mi comentario' }))
    await userEvent.click(
      within(await screen.findByRole('dialog')).getByRole('button', { name: 'Eliminar' }),
    )
    await waitFor(() => expect(screen.queryByText('Mio')).not.toBeInTheDocument())
    expect(await screen.findByText('Comentario eliminado.')).toBeInTheDocument()
  })

  it('en modo lectura no muestra el formulario ni botones de borrar', async () => {
    servidor.use(
      http.get('*/tutorias/7/comentarios', () =>
        HttpResponse.json(respuestaOk([comentario(1, 'Hola', { esMio: true })])),
      ),
    )
    renderComentarios({ modo: 'lectura' })

    expect(await screen.findByText('Hola')).toBeInTheDocument()
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('publica un comentario, cuenta los caracteres y limpia el campo', async () => {
    let cuerpo = null
    servidor.use(
      http.get('*/tutorias/7/comentarios', () =>
        HttpResponse.json(respuestaOk(cuerpo ? [comentario(3, cuerpo.comentario)] : [])),
      ),
      http.post('*/tutorias/7/comentarios', async ({ request }) => {
        cuerpo = await request.json()
        return HttpResponse.json(respuestaOk(comentario(3, cuerpo.comentario)))
      }),
    )
    renderComentarios({ modo: 'tutorado' })

    const campo = await screen.findByLabelText('Tema u observación para el tutor')
    expect(screen.getByText('0/255 caracteres')).toBeInTheDocument()
    await userEvent.type(campo, 'Repasar índices')
    expect(screen.getByText('15/255 caracteres')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Publicar comentario' }))

    expect(await screen.findByText('Repasar índices')).toBeInTheDocument()
    expect(cuerpo).toEqual({ comentario: 'Repasar índices' })
    expect(campo).toHaveValue('')
  })
})
