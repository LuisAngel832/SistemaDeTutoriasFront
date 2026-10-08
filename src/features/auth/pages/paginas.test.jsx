import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { rutas } from '@/app/router'
import { USUARIOS } from '@/test/fixtures'
import { respuestaError, respuestaOk, servidor, usarServidorMock } from '@/test/servidor'
import { crearToken } from '@/test/tokens'

// El popup de Microsoft no existe en las pruebas: se simula el ID token que entrega.
vi.mock('@/features/auth/proveedores/microsoft', () => ({
  prepararMicrosoft: vi.fn(() => Promise.resolve(null)),
  obtenerIdTokenMicrosoft: vi.fn(() => Promise.resolve('id-token-ms')),
}))

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

const primerAcceso = http.post('*/auth/microsoft', () =>
  HttpResponse.json(
    respuestaOk({
      registroPendiente: true,
      tokenRegistro: 'token-registro',
      perfil: {
        nombre: 'Sofía',
        apellidos: 'Ramos Gutiérrez',
        correo: 'zS24011236@estudiantes.uv.mx',
        proveedor: 'MICROSOFT',
      },
    }),
  ),
)

const irARegistro = async () => {
  servidor.use(primerAcceso)
  const router = renderRuta('/login')
  await userEvent.click(await screen.findByRole('button', { name: 'Continuar con Microsoft' }))
  await screen.findByRole('heading', { name: 'Completar registro' })
  return router
}

describe('Iniciar sesion (01)', () => {
  it('entra con Microsoft y lleva al inicio del rol', async () => {
    servidor.use(
      http.post('*/auth/microsoft', () =>
        HttpResponse.json(
          respuestaOk({
            registroPendiente: false,
            token: crearToken({ rol: 'TUTORADO' }),
            usuario: USUARIOS.tutorado,
          }),
        ),
      ),
    )
    const router = renderRuta('/login')

    // La primera prueba tambien paga la descarga de la pagina (lazy).
    const boton = await screen.findByRole(
      'button',
      { name: 'Continuar con Microsoft' },
      { timeout: 5000 },
    )
    expect(screen.getByText('¿Es tu primera vez?')).toBeInTheDocument()
    await userEvent.click(boton)

    await waitFor(() => expect(router.state.location.pathname).toBe('/tutorado/home'))
  })

  it('muestra el error del backend', async () => {
    servidor.use(
      http.post('*/auth/microsoft', () =>
        HttpResponse.json(respuestaError('Solo se permiten cuentas @estudiantes.uv.mx.'), {
          status: 400,
        }),
      ),
    )
    renderRuta('/login')

    await userEvent.click(await screen.findByRole('button', { name: 'Continuar con Microsoft' }))
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Solo se permiten cuentas @estudiantes.uv.mx.',
    )
  })

  it('avisa si Google no esta configurado', async () => {
    renderRuta('/login')

    await userEvent.click(await screen.findByRole('button', { name: 'Continuar con Google' }))
    expect(await screen.findByRole('alert')).toHaveTextContent(/Google no está configurado/)
  })
})

describe('Completar registro (02)', () => {
  it('muestra el perfil, normaliza la matricula y entra al panel', async () => {
    let cuerpo
    servidor.use(
      http.post('*/auth/registro', async ({ request }) => {
        cuerpo = await request.json()
        return HttpResponse.json(
          respuestaOk({
            registroPendiente: false,
            token: crearToken({ rol: 'TUTOR' }),
            usuario: { ...USUARIOS.tutor, matricula: 'S24011236' },
          }),
        )
      }),
    )
    const router = await irARegistro()

    expect(screen.getByText('Sofía Ramos Gutiérrez')).toBeInTheDocument()
    expect(screen.getByText('zS24011236@estudiantes.uv.mx')).toBeInTheDocument()
    expect(screen.getByText('Cuenta de Microsoft verificada')).toBeInTheDocument()

    await userEvent.type(screen.getByLabelText('Matrícula institucional'), 'zs24011236')
    await userEvent.click(screen.getByRole('radio', { name: 'Tutor' }))
    await userEvent.click(screen.getByRole('button', { name: 'Crear cuenta y continuar' }))

    await waitFor(() => expect(router.state.location.pathname).toBe('/tutor/home'))
    expect(cuerpo).toEqual({
      tokenRegistro: 'token-registro',
      matricula: 'S24011236',
      rol: 'TUTOR',
    })
  })

  it('valida la matricula antes de enviar', async () => {
    await irARegistro()

    await userEvent.type(screen.getByLabelText('Matrícula institucional'), '123')
    await userEvent.click(screen.getByRole('button', { name: 'Crear cuenta y continuar' }))

    expect(
      await screen.findByText('Escribe la S seguida de 8 dígitos, por ejemplo S24011236'),
    ).toBeInTheDocument()
  })

  it('muestra la matricula duplicada debajo del campo', async () => {
    servidor.use(
      http.post('*/auth/registro', () =>
        HttpResponse.json(
          respuestaError('Error de validación', {
            matricula: 'La matrícula ya está registrada con otra cuenta.',
          }),
          { status: 400 },
        ),
      ),
    )
    await irARegistro()

    await userEvent.type(screen.getByLabelText('Matrícula institucional'), 'S24011236')
    await userEvent.click(screen.getByRole('button', { name: 'Crear cuenta y continuar' }))

    expect(
      await screen.findByText('La matrícula ya está registrada con otra cuenta.'),
    ).toBeInTheDocument()
    expect(screen.getByLabelText('Matrícula institucional')).toHaveAttribute('aria-invalid', 'true')
  })

  it('"Entrar con otra" descarta el registro y vuelve al login', async () => {
    const router = await irARegistro()

    await userEvent.click(screen.getByRole('button', { name: 'Entrar con otra' }))

    await waitFor(() => expect(router.state.location.pathname).toBe('/login'))
    expect(sessionStorage.getItem('registroPendiente')).toBeNull()
  })
})
