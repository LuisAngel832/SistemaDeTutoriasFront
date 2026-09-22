import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import { AuthContext } from '@/features/auth/AuthContext'
import { renderConProveedores } from '@/test/render'
import { respuestaOk, servidor, usarServidorMock } from '@/test/servidor'
import { Comentarios } from './Comentarios'

usarServidorMock()

const renderComentarios = (props) =>
  renderConProveedores(
    <AuthContext.Provider value={{ matricula: '2001' }}>
      <Comentarios idTutoria={1} {...props} />
    </AuthContext.Provider>,
  )

describe('Comentarios', () => {
  it('reconoce los comentarios propios (matricula numerica del backend) y permite borrarlos', async () => {
    let comentarios = [
      { idComentario: 1, idTutoria: 1, matricula: 2001, nombre: 'Luis Perez', comentario: 'Mio' },
      { idComentario: 2, idTutoria: 1, matricula: 2002, nombre: 'Maria Soto', comentario: 'Ajeno' },
    ]
    servidor.use(
      http.get('*/comentarios/tutoria/1', () => HttpResponse.json(respuestaOk(comentarios))),
      http.delete('*/comentarios/1', () => {
        comentarios = comentarios.filter((c) => c.idComentario !== 1)
        return HttpResponse.json(respuestaOk(null, 'Comentario eliminado.'))
      }),
    )
    renderComentarios({ modo: 'tutorado' })

    expect(await screen.findByText('Mio')).toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: 'Eliminar mi comentario' })).toHaveLength(1)

    await userEvent.click(screen.getByRole('button', { name: 'Eliminar mi comentario' }))
    await waitFor(() => expect(screen.queryByText('Mio')).not.toBeInTheDocument())
    expect(await screen.findByText('Comentario eliminado')).toBeInTheDocument()
  })

  it('en modo lectura no muestra el formulario ni botones de borrar', async () => {
    servidor.use(
      http.get('*/comentarios/tutoria/1', () =>
        HttpResponse.json(respuestaOk([{ idComentario: 1, matricula: 2001, comentario: 'Hola' }])),
      ),
    )
    renderComentarios({ modo: 'lectura' })

    expect(await screen.findByText('Hola')).toBeInTheDocument()
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('publica un comentario y limpia el campo', async () => {
    let publicado = null
    servidor.use(
      http.get('*/comentarios/tutoria/1', () =>
        HttpResponse.json(respuestaOk(publicado ? [publicado] : [])),
      ),
      http.post('*/comentarios', async ({ request }) => {
        const cuerpo = await request.json()
        publicado = { idComentario: 9, matricula: 2001, nombre: 'Luis', ...cuerpo }
        return HttpResponse.json(respuestaOk(null))
      }),
    )
    renderComentarios({ modo: 'tutorado' })

    const campo = await screen.findByLabelText(/Tema u observación/)
    await userEvent.type(campo, 'Ver depreciaciones')
    expect(screen.getByText('18/280 caracteres')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Publicar comentario' }))

    expect(await screen.findByText('Ver depreciaciones')).toBeInTheDocument()
    expect(campo).toHaveValue('')
    expect(publicado).toMatchObject({ idTutoria: 1, comentario: 'Ver depreciaciones' })
  })
})
