import { render, screen, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { guardarSesion } from '../features/auth/storage'
import { respuestaOk, servidor, usarServidorMock } from '../test/servidor'
import { crearToken } from '../test/tokens'
import PaginaError from '../pages/Sistema/PaginaError'
import { rutas } from './router'

usarServidorMock()

// Las paginas reales piden datos al montar: se responde vacio a cualquier GET.
beforeEach(() => {
  servidor.use(http.get('*', () => HttpResponse.json(respuestaOk([]))))
})

const iniciarSesionComo = (rol, matricula = '1001') =>
  guardarSesion({ token: crearToken({ rol: rol.toUpperCase() }), rol, matricula })

const renderRuta = (ruta) => {
  const router = createMemoryRouter(rutas, { initialEntries: [ruta] })
  render(<RouterProvider router={router} />)
  return router
}

const esperarRuta = (router, pathname) =>
  waitFor(() => expect(router.state.location.pathname).toBe(pathname))

describe('router', () => {
  it('"/" lleva al login sin sesion y al inicio del rol con sesion', async () => {
    const sinSesion = renderRuta('/')
    await esperarRuta(sinSesion, '/login')
    expect(await screen.findByRole('heading', { name: 'Iniciar sesión' })).toBeInTheDocument()
  })

  it('carga la pagina de la ruta y actualiza el titulo del documento', async () => {
    iniciarSesionComo('tutor')
    const router = renderRuta('/')

    await esperarRuta(router, '/tutor/home')
    expect(
      await screen.findByRole('heading', { name: 'Mis tutorías', level: 1 }),
    ).toBeInTheDocument()
    await waitFor(() => expect(document.title).toBe('Mis tutorías · Sistema de Tutorías'))
  })

  it.each([
    ['/tutor/crear', '/tutor/tutorias/nueva'],
    ['/tutor/agregar-horario', '/tutor/horarios'],
    ['/tutor/tutoria/7', '/tutor/tutorias/7'],
  ])('redirige la URL antigua %s a %s', async (antigua, nueva) => {
    iniciarSesionComo('tutor')
    const router = renderRuta(antigua)
    await esperarRuta(router, nueva)
  })

  it.each([
    ['/tutorado/infoTutoria/3', '/tutorado/tutorias/3'],
    ['/tutorado/tutorias', '/tutorado/inscripciones'],
  ])('redirige la URL antigua %s a %s', async (antigua, nueva) => {
    iniciarSesionComo('tutorado', '2001')
    const router = renderRuta(antigua)
    await esperarRuta(router, nueva)
  })

  it('permite al admin entrar a las pantallas del tutor', async () => {
    iniciarSesionComo('admin', '3001')
    const router = renderRuta('/tutor/horarios')

    await esperarRuta(router, '/tutor/horarios')
    expect(await screen.findByRole('heading', { name: /Crear horario/ })).toBeInTheDocument()
  })

  it('muestra la pagina 404 en rutas desconocidas', async () => {
    renderRuta('/no-existe')
    expect(
      await screen.findByRole('heading', { name: 'No encontramos esta página' }),
    ).toBeInTheDocument()
  })
})

describe('PaginaError', () => {
  it('se muestra si una pagina falla al renderizar', async () => {
    const PaginaRota = () => {
      throw new Error('fallo de prueba')
    }
    const router = createMemoryRouter(
      [{ path: '/', element: <PaginaRota />, errorElement: <PaginaError /> }],
      { initialEntries: ['/'] },
    )
    // React registra el error en consola; se silencia para no ensuciar la salida.
    const consola = vi.spyOn(console, 'error').mockImplementation(() => {})
    render(<RouterProvider router={router} />)

    expect(await screen.findByRole('heading', { name: 'Algo salió mal' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Reintentar' })).toBeInTheDocument()
    consola.mockRestore()
  })
})
