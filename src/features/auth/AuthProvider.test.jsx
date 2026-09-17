import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { useState } from 'react'
import { MemoryRouter, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { api } from '../../api/client'
import PrivateRoute from '../../Routes/PrivateRoute'
import { respuestaError, respuestaOk, servidor, usarServidorMock } from '../../test/servidor'
import { crearToken } from '../../test/tokens'
import { useAuth } from './AuthContext'
import { AuthProvider } from './AuthProvider'
import { guardarSesion, leerSesion } from './storage'

usarServidorMock()

// Pantallas minimas para probar el flujo sin depender del diseno real.
const LoginDePrueba = () => {
  const { login, sesionExpirada } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [error, setError] = useState('')

  const entrar = async () => {
    const res = await login('1001', 'secreta')
    if (!res.ok) return setError(res.message)
    navigate(location.state?.from?.pathname ?? res.destino, { replace: true })
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

const PantallaPrivada = ({ titulo }) => {
  const { matricula, rol, logout } = useAuth()
  const [error, setError] = useState('')
  const pedir = () => api.get('/tutoria/mis-tutorias').catch((err) => setError(err.message))

  return (
    <div>
      <h1>{titulo}</h1>
      <p>
        {matricula} - {rol}
      </p>
      {error ? <p role="alert">{error}</p> : null}
      <button onClick={pedir}>Pedir datos</button>
      <button onClick={logout}>Salir</button>
    </div>
  )
}

const renderApp = (ruta) =>
  render(
    <MemoryRouter initialEntries={[ruta]}>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginDePrueba />} />
          <Route
            path="/tutor/home"
            element={
              <PrivateRoute allowedRoles={['tutor', 'admin']}>
                <PantallaPrivada titulo="Inicio tutor" />
              </PrivateRoute>
            }
          />
          <Route
            path="/tutor/tutoria/:id"
            element={
              <PrivateRoute allowedRoles={['tutor', 'admin']}>
                <PantallaPrivada titulo="Detalle tutor" />
              </PrivateRoute>
            }
          />
          <Route
            path="/tutorado/home"
            element={
              <PrivateRoute allowedRoles={['tutorado']}>
                <PantallaPrivada titulo="Inicio tutorado" />
              </PrivateRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </MemoryRouter>,
  )

describe('AuthProvider', () => {
  it('inicia sesion, guarda la sesion y vuelve a la ruta pedida', async () => {
    const token = crearToken()
    servidor.use(
      http.post('*/auth/signin', () => HttpResponse.json(respuestaOk({ token, rol: 'TUTOR' }))),
    )
    renderApp('/tutor/tutoria/5')

    expect(await screen.findByText('Pantalla de login')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Entrar' }))

    expect(await screen.findByText('Detalle tutor')).toBeInTheDocument()
    expect(screen.getByText('1001 - tutor')).toBeInTheDocument()
    expect(leerSesion()).toMatchObject({ token, rol: 'tutor', matricula: '1001' })
  })

  it('muestra el error del backend si las credenciales son incorrectas', async () => {
    servidor.use(
      http.post('*/auth/signin', () =>
        HttpResponse.json(respuestaError('Contraseña incorrecta'), { status: 400 }),
      ),
    )
    renderApp('/login')

    await userEvent.click(screen.getByRole('button', { name: 'Entrar' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('Contraseña incorrecta')
    expect(leerSesion().token).toBe('')
  })

  it('descarta un token vencido al cargar y avisa que la sesion expiro', async () => {
    guardarSesion({ token: crearToken({ expiraEnSeg: -60 }), rol: 'tutor', matricula: '1001' })
    renderApp('/tutor/home')

    expect(await screen.findByText('Pantalla de login')).toBeInTheDocument()
    expect(screen.getByText('Sesion expirada')).toBeInTheDocument()
    expect(leerSesion().token).toBe('')
  })

  it('envia el token y cierra la sesion ante un 401', async () => {
    const token = crearToken()
    let autorizacion
    guardarSesion({ token, rol: 'tutor', matricula: '1001' })
    servidor.use(
      http.get('*/tutoria/mis-tutorias', ({ request }) => {
        autorizacion = request.headers.get('Authorization')
        return HttpResponse.text('Token inválido o expirado', { status: 401 })
      }),
    )
    renderApp('/tutor/home')

    await userEvent.click(await screen.findByRole('button', { name: 'Pedir datos' }))

    expect(await screen.findByText('Pantalla de login')).toBeInTheDocument()
    expect(screen.getByText('Sesion expirada')).toBeInTheDocument()
    expect(autorizacion).toBe(`Bearer ${token}`)
    expect(leerSesion().token).toBe('')
  })

  it('manda a su propio inicio a un usuario con otro rol', async () => {
    guardarSesion({ token: crearToken({ rol: 'TUTORADO' }), rol: 'tutorado', matricula: '2001' })
    renderApp('/tutor/home')

    expect(await screen.findByText('Inicio tutorado')).toBeInTheDocument()
  })

  it('cierra la sesion con logout sin marcarla como expirada', async () => {
    guardarSesion({ token: crearToken(), rol: 'admin', matricula: '3001' })
    renderApp('/tutor/home')

    await userEvent.click(await screen.findByRole('button', { name: 'Salir' }))

    await waitFor(() => expect(screen.getByText('Pantalla de login')).toBeInTheDocument())
    expect(screen.queryByText('Sesion expirada')).not.toBeInTheDocument()
    expect(leerSesion().token).toBe('')
  })
})
