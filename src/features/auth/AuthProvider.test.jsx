import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { useState } from 'react'
import { createMemoryRouter, Outlet, RouterProvider, useNavigate } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { api } from '@/api/client'
import { USUARIOS } from '@/test/fixtures'
import { respuestaError, respuestaOk, servidor, usarServidorMock } from '@/test/servidor'
import { crearToken } from '@/test/tokens'
import { useAuth } from './AuthContext'
import { AuthProvider } from './AuthProvider'
import { RequiereRegistroPendiente, RequireRole, SoloInvitados } from './guards'
import {
  guardarRegistroPendiente,
  guardarSesion,
  leerRegistroPendiente,
  leerSesion,
} from './storage'

usarServidorMock()

// Pantallas minimas para probar el flujo sin depender del diseno real.
const LoginDePrueba = () => {
  const { entrarConProveedor, sesionExpirada } = useAuth()
  const navigate = useNavigate()
  const [error, setError] = useState('')

  const entrar = async () => {
    const res = await entrarConProveedor('microsoft', 'id-token-ms')
    if (!res.ok) setError(res.message)
    else if (res.registroPendiente) navigate('/registro')
  }

  return (
    <div>
      <h1>Pantalla de login</h1>
      {sesionExpirada ? <p>Sesion expirada</p> : null}
      {error ? <p role="alert">{error}</p> : null}
      <button onClick={entrar}>Entrar</button>
    </div>
  )
}

const RegistroDePrueba = () => {
  const { registroPendiente, completarRegistro } = useAuth()
  const [resultado, setResultado] = useState(null)

  const registrar = async () =>
    setResultado(await completarRegistro({ matricula: 'S24011236', rol: 'TUTORADO' }))

  return (
    <div>
      <h1>Completar registro</h1>
      <p>{registroPendiente?.perfil?.correo}</p>
      {resultado?.errores?.matricula ? <p role="alert">{resultado.errores.matricula}</p> : null}
      {resultado?.vencido ? <p role="alert">Registro vencido</p> : null}
      <button onClick={registrar}>Registrar</button>
    </div>
  )
}

const PantallaPrivada = ({ titulo }) => {
  const { matricula, rol, nombre, logout } = useAuth()
  const [error, setError] = useState('')
  const pedir = () => api.get('/tutorias/mis-tutorias').catch((err) => setError(err.message))

  return (
    <div>
      <h1>{titulo}</h1>
      <p>
        {matricula} - {rol} - {nombre}
      </p>
      {error ? <p role="alert">{error}</p> : null}
      <button onClick={pedir}>Pedir datos</button>
      <button onClick={logout}>Salir</button>
    </div>
  )
}

const renderApp = (ruta) => {
  const router = createMemoryRouter(
    [
      {
        element: (
          <AuthProvider>
            <Outlet />
          </AuthProvider>
        ),
        children: [
          {
            element: <SoloInvitados />,
            children: [
              { path: '/login', element: <LoginDePrueba /> },
              {
                element: <RequiereRegistroPendiente />,
                children: [{ path: '/registro', element: <RegistroDePrueba /> }],
              },
            ],
          },
          {
            element: <RequireRole roles={['tutor']} />,
            children: [
              { path: '/tutor/home', element: <PantallaPrivada titulo="Inicio tutor" /> },
              { path: '/tutor/tutorias/:id', element: <PantallaPrivada titulo="Detalle tutor" /> },
            ],
          },
          {
            element: <RequireRole roles={['tutorado']} />,
            children: [
              { path: '/tutorado/home', element: <PantallaPrivada titulo="Inicio tutorado" /> },
            ],
          },
        ],
      },
    ],
    { initialEntries: [ruta] },
  )
  render(<RouterProvider router={router} />)
  return router
}

const loginRegistrado = (usuario = USUARIOS.tutor, token = crearToken()) =>
  http.post('*/auth/microsoft', () =>
    HttpResponse.json(respuestaOk({ registroPendiente: false, token, usuario }, 'Login')),
  )

const loginPrimerAcceso = http.post('*/auth/microsoft', () =>
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

describe('inicio de sesion con proveedor', () => {
  it('con un usuario registrado guarda la sesion y vuelve a la ruta pedida', async () => {
    const token = crearToken()
    let cuerpo
    servidor.use(
      http.post('*/auth/microsoft', async ({ request }) => {
        cuerpo = await request.json()
        return HttpResponse.json(
          respuestaOk({ registroPendiente: false, token, usuario: USUARIOS.tutor }),
        )
      }),
    )
    const router = renderApp('/tutor/tutorias/5')

    await userEvent.click(await screen.findByRole('button', { name: 'Entrar' }))

    expect(await screen.findByText('Detalle tutor')).toBeInTheDocument()
    expect(router.state.location.pathname).toBe('/tutor/tutorias/5')
    expect(cuerpo).toEqual({ idToken: 'id-token-ms' })
    expect(screen.getByText('S21009342 - tutor - Rocío Hernández Aguilar')).toBeInTheDocument()
    expect(leerSesion()).toMatchObject({
      token,
      rol: 'tutor',
      matricula: 'S21009342',
      correo: 'zS21009342@estudiantes.uv.mx',
    })
  })

  it('sin ruta pedida lleva al inicio del rol', async () => {
    servidor.use(loginRegistrado(USUARIOS.tutorado, crearToken({ rol: 'TUTORADO' })))
    const router = renderApp('/login')

    await userEvent.click(await screen.findByRole('button', { name: 'Entrar' }))
    expect(await screen.findByText('Inicio tutorado')).toBeInTheDocument()
    expect(router.state.location.pathname).toBe('/tutorado/home')
  })

  it('muestra el error del backend si la cuenta no es de un dominio permitido', async () => {
    servidor.use(
      http.post('*/auth/microsoft', () =>
        HttpResponse.json(respuestaError('Solo se permiten cuentas @estudiantes.uv.mx.'), {
          status: 400,
        }),
      ),
    )
    renderApp('/login')

    await userEvent.click(await screen.findByRole('button', { name: 'Entrar' }))
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Solo se permiten cuentas @estudiantes.uv.mx.',
    )
    expect(leerSesion().token).toBe('')
  })
})

describe('primer acceso', () => {
  it('guarda el registro pendiente y al completarlo entra al inicio del rol', async () => {
    let cuerpoRegistro
    servidor.use(
      loginPrimerAcceso,
      http.post('*/auth/registro', async ({ request }) => {
        cuerpoRegistro = await request.json()
        return HttpResponse.json(
          respuestaOk({
            registroPendiente: false,
            token: crearToken({ rol: 'TUTORADO' }),
            usuario: { ...USUARIOS.tutorado, matricula: 'S24011236' },
          }),
        )
      }),
    )
    const router = renderApp('/login')

    await userEvent.click(await screen.findByRole('button', { name: 'Entrar' }))
    expect(await screen.findByText('zS24011236@estudiantes.uv.mx')).toBeInTheDocument()
    expect(leerRegistroPendiente()).toMatchObject({ tokenRegistro: 'token-registro' })

    await userEvent.click(screen.getByRole('button', { name: 'Registrar' }))

    expect(await screen.findByText('Inicio tutorado')).toBeInTheDocument()
    expect(router.state.location.pathname).toBe('/tutorado/home')
    expect(cuerpoRegistro).toEqual({
      tokenRegistro: 'token-registro',
      matricula: 'S24011236',
      rol: 'TUTORADO',
    })
    expect(leerRegistroPendiente()).toBeNull()
  })

  it('expone el error de matricula duplicada por campo', async () => {
    guardarRegistroPendiente({ tokenRegistro: 't', perfil: {}, expira: Date.now() + 60_000 })
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
    renderApp('/registro')

    await userEvent.click(await screen.findByRole('button', { name: 'Registrar' }))
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'La matrícula ya está registrada con otra cuenta.',
    )
  })

  it('avisa cuando el registro pendiente vence antes de enviarlo', async () => {
    guardarRegistroPendiente({ tokenRegistro: 't', perfil: {}, expira: Date.now() + 60_000 })
    renderApp('/registro')
    await screen.findByRole('button', { name: 'Registrar' })

    guardarRegistroPendiente({ tokenRegistro: 't', perfil: {}, expira: Date.now() - 1 })
    await userEvent.click(screen.getByRole('button', { name: 'Registrar' }))

    expect(await screen.findByText('Pantalla de login')).toBeInTheDocument()
  })

  it('no deja abrir completar registro sin haber entrado con un proveedor', async () => {
    const router = renderApp('/registro')
    await waitFor(() => expect(router.state.location.pathname).toBe('/login'))
  })
})

describe('sesion activa', () => {
  it('descarta un token vencido al cargar y avisa que la sesion expiro', async () => {
    guardarSesion({ token: crearToken({ expiraEnSeg: -60 }), rol: 'tutor', matricula: 'S1' })
    renderApp('/tutor/home')

    expect(await screen.findByText('Pantalla de login')).toBeInTheDocument()
    expect(screen.getByText('Sesion expirada')).toBeInTheDocument()
    expect(leerSesion().token).toBe('')
  })

  it('envia el token y ante un 401 cierra la sesion recordando la pagina', async () => {
    const token = crearToken()
    let autorizacion
    guardarSesion({ token, rol: 'tutor', matricula: 'S21009342' })
    servidor.use(
      http.get('*/tutorias/mis-tutorias', ({ request }) => {
        autorizacion = request.headers.get('Authorization')
        return HttpResponse.text('Token inválido o expirado', { status: 401 })
      }),
    )
    const router = renderApp('/tutor/tutorias/8')

    await userEvent.click(await screen.findByRole('button', { name: 'Pedir datos' }))

    expect(await screen.findByText('Pantalla de login')).toBeInTheDocument()
    expect(screen.getByText('Sesion expirada')).toBeInTheDocument()
    expect(autorizacion).toBe(`Bearer ${token}`)
    expect(router.state.location.state?.from?.pathname).toBe('/tutor/tutorias/8')
    expect(leerSesion().token).toBe('')
  })

  it('manda a su propio inicio a un usuario con otro rol', async () => {
    guardarSesion({ token: crearToken({ rol: 'TUTORADO' }), rol: 'tutorado', matricula: 'S2' })
    renderApp('/tutor/home')

    expect(await screen.findByText('Inicio tutorado')).toBeInTheDocument()
  })

  it('con sesion activa no deja ver el login', async () => {
    guardarSesion({ token: crearToken(), rol: 'tutor', matricula: 'S1' })
    renderApp('/login')

    expect(await screen.findByText('Inicio tutor')).toBeInTheDocument()
  })

  it('cierra la sesion con logout sin marcarla como expirada', async () => {
    guardarSesion({ token: crearToken(), rol: 'tutor', matricula: 'S1' })
    const router = renderApp('/tutor/home')

    await userEvent.click(await screen.findByRole('button', { name: 'Salir' }))

    await waitFor(() => expect(screen.getByText('Pantalla de login')).toBeInTheDocument())
    expect(screen.queryByText('Sesion expirada')).not.toBeInTheDocument()
    expect(router.state.location.state?.from).toBeUndefined()
    expect(leerSesion().token).toBe('')
  })
})
