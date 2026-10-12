import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { http, HttpResponse } from 'msw'
import { useState } from 'react'
import { createMemoryRouter, Outlet, RouterProvider } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { api } from '@/api/client'
import { USUARIOS } from '@/test/fixtures'
import { respuestaError, respuestaOk, servidor, usarServidorMock } from '@/test/servidor'
import { crearToken } from '@/test/tokens'
import { useAuth } from './AuthContext'
import { AuthProvider } from './AuthProvider'
import { RequireRole, SoloInvitados } from './guards'
import { CLAVE_TOKEN, guardarToken, leerToken } from './storage'

usarServidorMock()

// Pantallas minimas para probar el flujo sin depender del diseno real.
const LoginDePrueba = () => {
  const { login, sesionExpirada } = useAuth()
  const [error, setError] = useState('')

  const entrar = async () => {
    const res = await login({ matricula: 'S21009342', pwd: 'secreta1' })
    if (!res.ok) setError(res.message)
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
  const { registro } = useAuth()
  const [resultado, setResultado] = useState(null)

  const registrar = async () =>
    setResultado(
      await registro({
        nombre: 'Sofía',
        apellidos: 'Ramos Gutiérrez',
        matricula: 'S24011236',
        correo: 'zs24011236@estudiantes.uv.mx',
        pwd: 'secreta12',
        rol: 'TUTORADO',
      }),
    )

  return (
    <div>
      <h1>Crear cuenta</h1>
      {resultado?.errores?.matricula ? <p role="alert">{resultado.errores.matricula}</p> : null}
      {resultado?.ok && !resultado.sesionIniciada ? <p>Cuenta creada</p> : null}
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
          <QueryClientProvider client={new QueryClient()}>
            <AuthProvider>
              <Outlet />
            </AuthProvider>
          </QueryClientProvider>
        ),
        children: [
          {
            element: <SoloInvitados />,
            children: [
              { path: '/login', element: <LoginDePrueba /> },
              { path: '/registro', element: <RegistroDePrueba /> },
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

describe('inicio de sesion', () => {
  it('guarda solo el token y vuelve a la ruta pedida', async () => {
    const token = crearToken({ rol: 'TUTOR', matricula: 'S21009342' })
    let cuerpo
    servidor.use(
      http.post('*/auth/signin', async ({ request }) => {
        cuerpo = await request.json()
        return HttpResponse.json(respuestaOk({ token, usuario: USUARIOS.tutor }))
      }),
    )
    const router = renderApp('/tutor/tutorias/5')

    await userEvent.click(await screen.findByRole('button', { name: 'Entrar' }))

    expect(await screen.findByText('Detalle tutor')).toBeInTheDocument()
    expect(router.state.location.pathname).toBe('/tutor/tutorias/5')
    expect(cuerpo).toEqual({ matricula: 'S21009342', pwd: 'secreta1' })
    expect(screen.getByText('S21009342 - tutor - Rocío Hernández Aguilar')).toBeInTheDocument()
    expect(leerToken()).toBe(token)
    expect(localStorage.length).toBe(1)
  })

  it('acepta la respuesta anterior { token, rol } y toma la matricula del token', async () => {
    const token = crearToken({ rol: 'TUTORADO', matricula: 'S23014587' })
    servidor.use(
      http.post('*/auth/signin', () => HttpResponse.json(respuestaOk({ token, rol: 'TUTORADO' }))),
    )
    const router = renderApp('/login')

    await userEvent.click(await screen.findByRole('button', { name: 'Entrar' }))
    expect(await screen.findByText('Inicio tutorado')).toBeInTheDocument()
    expect(router.state.location.pathname).toBe('/tutorado/home')
    expect(screen.getByText(/S23014587 - tutorado/)).toBeInTheDocument()
  })

  it('muestra el error del backend si las credenciales son incorrectas', async () => {
    servidor.use(
      http.post('*/auth/signin', () =>
        HttpResponse.json(respuestaError('Usuario o contraseña incorrectos.'), { status: 400 }),
      ),
    )
    renderApp('/login')

    await userEvent.click(await screen.findByRole('button', { name: 'Entrar' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('Usuario o contraseña incorrectos.')
    expect(leerToken()).toBe('')
  })
})

describe('registro', () => {
  it('entra directo si el backend devuelve el token', async () => {
    let cuerpo
    servidor.use(
      http.post('*/auth/signup', async ({ request }) => {
        cuerpo = await request.json()
        return HttpResponse.json(
          respuestaOk({
            token: crearToken({ rol: 'TUTORADO' }),
            usuario: { ...USUARIOS.tutorado, matricula: 'S24011236' },
          }),
        )
      }),
    )
    const router = renderApp('/registro')

    await userEvent.click(await screen.findByRole('button', { name: 'Registrar' }))

    expect(await screen.findByText('Inicio tutorado')).toBeInTheDocument()
    expect(router.state.location.pathname).toBe('/tutorado/home')
    expect(cuerpo).toMatchObject({ matricula: 'S24011236', rol: 'TUTORADO', pwd: 'secreta12' })
  })

  it('sin token deja la sesion cerrada para que la pantalla mande al login', async () => {
    servidor.use(http.post('*/auth/signup', () => HttpResponse.json(respuestaOk(null))))
    renderApp('/registro')

    await userEvent.click(await screen.findByRole('button', { name: 'Registrar' }))
    expect(await screen.findByText('Cuenta creada')).toBeInTheDocument()
    expect(leerToken()).toBe('')
  })

  it('expone los errores por campo del backend', async () => {
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
    renderApp('/registro')

    await userEvent.click(await screen.findByRole('button', { name: 'Registrar' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('La matrícula ya está registrada.')
  })
})

describe('sesion activa', () => {
  it('descarta un token vencido al cargar y avisa que la sesion expiro', async () => {
    guardarToken(crearToken({ expiraEnSeg: -60 }))
    renderApp('/tutor/home')

    expect(await screen.findByText('Pantalla de login')).toBeInTheDocument()
    expect(screen.getByText('Sesion expirada')).toBeInTheDocument()
    expect(leerToken()).toBe('')
  })

  it('envia el token y ante un 401 cierra la sesion recordando la pagina', async () => {
    const token = crearToken()
    let autorizacion
    guardarToken(token)
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
    expect(leerToken()).toBe('')
  })

  it('manda a su propio inicio a un usuario con otro rol', async () => {
    guardarToken(crearToken({ rol: 'TUTORADO' }))
    renderApp('/tutor/home')

    expect(await screen.findByText('Inicio tutorado')).toBeInTheDocument()
  })

  it('toma el rol y la matricula del token e ignora las claves sueltas anteriores', async () => {
    guardarToken(crearToken({ rol: 'TUTORADO', matricula: 'S23014587' }))
    localStorage.setItem('rol', 'tutor')
    localStorage.setItem('matricula', 'S99999999')
    renderApp('/tutor/home')

    expect(await screen.findByText('Inicio tutorado')).toBeInTheDocument()
    expect(screen.getByText(/S23014587 - tutorado/)).toBeInTheDocument()
    // Al cargar se borran las claves de la version anterior.
    expect(localStorage.getItem('rol')).toBeNull()
    expect(localStorage.getItem('matricula')).toBeNull()
  })

  it('sin token no usa el rol que quede en localStorage', async () => {
    localStorage.setItem('rol', 'tutor')
    renderApp('/tutor/home')

    expect(await screen.findByText('Pantalla de login')).toBeInTheDocument()
  })

  it('con sesion activa no deja ver el login', async () => {
    guardarToken(crearToken())
    renderApp('/login')

    expect(await screen.findByText('Inicio tutor')).toBeInTheDocument()
  })

  it('cierra la sesion con logout sin marcarla como expirada', async () => {
    guardarToken(crearToken())
    const router = renderApp('/tutor/home')

    await userEvent.click(await screen.findByRole('button', { name: 'Salir' }))

    await waitFor(() => expect(screen.getByText('Pantalla de login')).toBeInTheDocument())
    expect(screen.queryByText('Sesion expirada')).not.toBeInTheDocument()
    expect(router.state.location.state?.from).toBeUndefined()
    expect(leerToken()).toBe('')
  })
})

describe('sincronizacion entre pestanas', () => {
  // Otra pestana escribe el token: el navegador avisa con un evento `storage`.
  const otraPestanaGuarda = (token) =>
    act(() => {
      if (token) localStorage.setItem(CLAVE_TOKEN, token)
      else localStorage.removeItem(CLAVE_TOKEN)
      window.dispatchEvent(new StorageEvent('storage', { key: CLAVE_TOKEN, newValue: token }))
    })

  it('cierra la sesion si en otra pestana se cerro', async () => {
    guardarToken(crearToken())
    renderApp('/tutor/home')
    expect(await screen.findByText('Inicio tutor')).toBeInTheDocument()

    otraPestanaGuarda(null)

    expect(await screen.findByText('Pantalla de login')).toBeInTheDocument()
  })

  it('entra con el usuario que inicio sesion en otra pestana', async () => {
    renderApp('/login')
    expect(await screen.findByText('Pantalla de login')).toBeInTheDocument()

    otraPestanaGuarda(crearToken({ rol: 'TUTORADO', matricula: 'S23014587' }))

    expect(await screen.findByText('Inicio tutorado')).toBeInTheDocument()
    expect(screen.getByText(/S23014587 - tutorado/)).toBeInTheDocument()
  })

  it('trata como expirada una sesion con el token vencido', async () => {
    guardarToken(crearToken())
    renderApp('/tutor/home')
    expect(await screen.findByText('Inicio tutor')).toBeInTheDocument()

    otraPestanaGuarda(crearToken({ expiraEnSeg: -60 }))

    expect(await screen.findByText('Pantalla de login')).toBeInTheDocument()
    expect(screen.getByText('Sesion expirada')).toBeInTheDocument()
    expect(leerToken()).toBe('')
  })

  it('ignora los cambios de otras claves', async () => {
    guardarToken(crearToken())
    renderApp('/tutor/home')
    expect(await screen.findByText('Inicio tutor')).toBeInTheDocument()

    act(() => {
      localStorage.setItem('rol', 'tutorado')
      window.dispatchEvent(new StorageEvent('storage', { key: 'rol', newValue: 'tutorado' }))
    })

    expect(screen.getByText('Inicio tutor')).toBeInTheDocument()
  })
})
