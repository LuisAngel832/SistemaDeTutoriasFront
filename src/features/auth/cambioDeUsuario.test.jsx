import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import { USUARIOS } from '@/test/fixtures'
import { iniciarSesionComo, renderApp } from '@/test/app'
import { respuestaOk, servidor, usarServidorMock } from '@/test/servidor'
import { crearToken } from '@/test/tokens'
import { decodificarToken } from './jwt'

usarServidorMock()

const USUARIO_POR_MATRICULA = Object.fromEntries(
  Object.values(USUARIOS).map((usuario) => [usuario.matricula, usuario]),
)

describe('cambio de usuario en la misma pestana', () => {
  it('no muestra los datos del usuario anterior', async () => {
    servidor.use(
      // /usuarios/me responde con el dueno del token de la peticion.
      http.get('*/usuarios/me', ({ request }) => {
        const token = request.headers.get('Authorization')?.replace('Bearer ', '')
        return HttpResponse.json(respuestaOk(USUARIO_POR_MATRICULA[decodificarToken(token).sub]))
      }),
      http.get('*', () => HttpResponse.json(respuestaOk([]))),
      http.post('*/auth/signin', () =>
        HttpResponse.json(
          respuestaOk({
            token: crearToken({ rol: 'TUTORADO', matricula: USUARIOS.tutorado.matricula }),
          }),
        ),
      ),
    )
    iniciarSesionComo('tutor')
    renderApp('/tutor/home')
    const navegacion = await screen.findByRole('complementary', { name: 'Navegación principal' })
    expect(await within(navegacion).findByText('Rocío Hernández Aguilar')).toBeInTheDocument()

    await userEvent.click(within(navegacion).getByRole('button', { name: /Cerrar sesión/ }))
    await userEvent.type(await screen.findByLabelText('Correo o matrícula'), 'S23014587')
    await userEvent.type(screen.getByLabelText('Contraseña'), 'secreta12')
    await userEvent.click(screen.getByRole('button', { name: 'Iniciar sesión' }))

    const nueva = await screen.findByRole('complementary', { name: 'Navegación principal' })
    expect(await within(nueva).findByText('Valeria Mendoza Cruz')).toBeInTheDocument()
    expect(within(nueva).queryByText('Rocío Hernández Aguilar')).not.toBeInTheDocument()
  })
})
