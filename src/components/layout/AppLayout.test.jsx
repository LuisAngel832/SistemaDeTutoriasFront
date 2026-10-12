import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { beforeEach, describe, expect, it } from 'vitest'
import { iniciarSesionComo, renderApp, usuarioActual } from '@/test/app'
import { respuestaOk, servidor, usarServidorMock } from '@/test/servidor'

usarServidorMock()

beforeEach(() => {
  servidor.use(
    usuarioActual('tutor'),
    http.get('*', () => HttpResponse.json(respuestaOk([]))),
  )
  iniciarSesionComo('tutor')
})

describe('AppLayout', () => {
  it('"Saltar al contenido" lleva el foco al contenido principal', async () => {
    renderApp('/tutor/home')
    const contenido = await screen.findByRole('main')

    await userEvent.tab()
    const enlace = screen.getByRole('link', { name: 'Saltar al contenido' })
    expect(enlace).toHaveFocus()

    await userEvent.click(enlace)
    expect(contenido).toHaveFocus()
  })

  it('el menu movil recibe el foco, deja inerte el contenido y lo devuelve al cerrarse', async () => {
    renderApp('/tutor/home')
    const abrir = await screen.findByRole('button', { name: 'Abrir menú' })
    const contenido = document.querySelector('.app-content')
    expect(contenido).not.toHaveAttribute('inert')

    await userEvent.click(abrir)

    expect(abrir).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByRole('link', { name: 'Mis tutorías' })).toHaveFocus()
    expect(contenido).toHaveAttribute('inert')

    await userEvent.keyboard('{Escape}')

    await waitFor(() => expect(abrir).toHaveAttribute('aria-expanded', 'false'))
    expect(contenido).not.toHaveAttribute('inert')
    expect(abrir).toHaveFocus()
  })
})
