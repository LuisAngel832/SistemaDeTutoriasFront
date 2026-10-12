import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { beforeEach, describe, expect, it } from 'vitest'
import { rutas } from '@/app/router'
import { USUARIOS } from '@/test/fixtures'
import { respuestaError, respuestaOk, servidor, usarServidorMock } from '@/test/servidor'
import { crearToken } from '@/test/tokens'

usarServidorMock()

beforeEach(() => {
  // Las pantallas de inicio piden datos al montar: se responde vacio a cualquier GET.
  servidor.use(http.get('*', () => HttpResponse.json(respuestaOk([]))))
})

const renderRuta = (ruta) => {
  const router = createMemoryRouter(rutas, { initialEntries: [ruta] })
  render(<RouterProvider router={router} />)
  return router
}

const capturarLogin = (respuesta) => {
  const recibido = {}
  servidor.use(
    http.post('*/auth/signin', async ({ request }) => {
      recibido.cuerpo = await request.json()
      return respuesta()
    }),
  )
  return recibido
}

describe('Iniciar sesion (01)', () => {
  it('entra con matricula y contrasena y lleva al inicio del rol', async () => {
    const recibido = capturarLogin(() =>
      HttpResponse.json(
        respuestaOk({ token: crearToken({ rol: 'TUTORADO' }), usuario: USUARIOS.tutorado }),
      ),
    )
    const router = renderRuta('/login')

    // La primera prueba tambien paga la descarga de la pagina (lazy).
    const usuario = await screen.findByLabelText('Correo o matrícula', {}, { timeout: 5000 })
    await userEvent.type(usuario, 'zs23014587')
    await userEvent.type(screen.getByLabelText('Contraseña'), 'secreta1')
    await userEvent.click(screen.getByRole('button', { name: 'Iniciar sesión' }))

    await waitFor(() => expect(router.state.location.pathname).toBe('/tutorado/home'))
    expect(recibido.cuerpo).toEqual({ matricula: 'S23014587', pwd: 'secreta1' })
  })

  it('tambien entra con el correo', async () => {
    const recibido = capturarLogin(() =>
      HttpResponse.json(
        respuestaOk({ token: crearToken({ rol: 'TUTOR' }), usuario: USUARIOS.tutor }),
      ),
    )
    const router = renderRuta('/login')

    await userEvent.type(
      await screen.findByLabelText('Correo o matrícula'),
      'zS21009342@estudiantes.uv.mx',
    )
    await userEvent.type(screen.getByLabelText('Contraseña'), 'secreta1')
    await userEvent.click(screen.getByRole('button', { name: 'Iniciar sesión' }))

    await waitFor(() => expect(router.state.location.pathname).toBe('/tutor/home'))
    expect(recibido.cuerpo).toEqual({ correo: 'zs21009342@estudiantes.uv.mx', pwd: 'secreta1' })
  })

  it('valida los campos y muestra el error del backend', async () => {
    capturarLogin(() =>
      HttpResponse.json(respuestaError('Usuario o contraseña incorrectos.'), { status: 400 }),
    )
    renderRuta('/login')

    await userEvent.click(await screen.findByRole('button', { name: 'Iniciar sesión' }))
    expect(await screen.findByText('Ingresa tu correo o tu matrícula')).toBeInTheDocument()
    expect(screen.getByText('Ingresa tu contraseña')).toBeInTheDocument()

    await userEvent.type(screen.getByLabelText('Correo o matrícula'), 'S23014587')
    await userEvent.type(screen.getByLabelText('Contraseña'), 'mala')
    await userEvent.click(screen.getByRole('button', { name: 'Iniciar sesión' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('Usuario o contraseña incorrectos.')
  })
})

describe('Crear cuenta (02)', () => {
  const llenar = async () => {
    await userEvent.click(await screen.findByRole('radio', { name: 'Tutor' }))
    await userEvent.type(screen.getByLabelText('Nombre(s)'), 'Sofía')
    await userEvent.type(screen.getByLabelText('Apellidos'), 'Ramos Gutiérrez')
    await userEvent.type(screen.getByLabelText('Matrícula institucional'), 'zs24011236')
    await userEvent.type(
      screen.getByLabelText('Correo electrónico'),
      'zS24011236@estudiantes.uv.mx',
    )
    await userEvent.type(screen.getByLabelText('Contraseña'), 'secreta12')
    await userEvent.click(screen.getByRole('button', { name: 'Crear cuenta' }))
  }

  it('envia los datos normalizados y, sin token, manda al login con aviso', async () => {
    let cuerpo
    servidor.use(
      http.post('*/auth/signup', async ({ request }) => {
        cuerpo = await request.json()
        return HttpResponse.json(respuestaOk(null, 'Registro exitoso.'))
      }),
    )
    const router = renderRuta('/registro')

    await llenar()

    await waitFor(() => expect(router.state.location.pathname).toBe('/login'))
    expect(cuerpo).toEqual({
      rol: 'TUTOR',
      nombre: 'Sofía',
      apellidos: 'Ramos Gutiérrez',
      matricula: 'S24011236',
      correo: 'zs24011236@estudiantes.uv.mx',
      pwd: 'secreta12',
    })
    expect(await screen.findByText('Cuenta creada. Ya puedes iniciar sesión.')).toBeInTheDocument()
  })

  it('entra directo al panel si el backend devuelve el token', async () => {
    servidor.use(
      http.post('*/auth/signup', () =>
        HttpResponse.json(
          respuestaOk({
            token: crearToken({ rol: 'TUTOR' }),
            usuario: { ...USUARIOS.tutor, matricula: 'S24011236' },
          }),
        ),
      ),
    )
    const router = renderRuta('/registro')

    await llenar()

    await waitFor(() => expect(router.state.location.pathname).toBe('/tutor/home'))
  })

  it('muestra la matricula duplicada debajo del campo', async () => {
    servidor.use(
      http.post('*/auth/signup', () =>
        HttpResponse.json(
          respuestaError('Error de validación', {
            matricula: 'La matrícula ya está registrada.',
          }),
          { status: 400 },
        ),
      ),
    )
    renderRuta('/registro')

    await llenar()

    expect(await screen.findByText('La matrícula ya está registrada.')).toBeInTheDocument()
    expect(screen.getByLabelText('Matrícula institucional')).toHaveAttribute('aria-invalid', 'true')
  })
})
