import { render } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { rutas } from '@/app/router'
import { guardarSesion } from '@/features/auth/storage'
import { USUARIOS } from './fixtures'
import { respuestaOk } from './servidor'
import { crearToken } from './tokens'

// Inicia sesion como un usuario de los fixtures: rol 'tutorado' | 'tutor' | 'admin'.
export const iniciarSesionComo = (rol) => {
  const usuario = USUARIOS[rol]
  guardarSesion({
    token: crearToken({ rol: usuario.rol, matricula: usuario.matricula }),
    rol,
    matricula: usuario.matricula,
    nombre: `${usuario.nombre} ${usuario.apellidos}`,
    correo: usuario.correo,
  })
}

// Renderiza la app completa (router real) en una ruta.
export const renderApp = (ruta) => {
  const router = createMemoryRouter(rutas, { initialEntries: [ruta] })
  render(<RouterProvider router={router} />)
  return router
}

// Respuesta ok con los datos dados para un GET/POST/... de MSW.
export const ok =
  (data, message = 'OK') =>
  () =>
    HttpResponse.json(respuestaOk(data, message))

// GET /usuarios/me, que pide la barra lateral en todas las pantallas privadas.
export const usuarioActual = (rol) => http.get('*/usuarios/me', ok(USUARIOS[rol]))
