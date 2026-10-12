import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { iniciarSesionComo, ok, renderApp, usuarioActual } from '@/test/app'
import { cupo, materias, resumenAdmin, tutoriaAdmin, tutores } from '@/test/fixtures'
import { respuestaError, respuestaOk, servidor, usarServidorMock } from '@/test/servidor'

usarServidorMock()

beforeEach(() => {
  iniciarSesionComo('admin')
  servidor.use(usuarioActual('admin'))
})

afterEach(() => {
  vi.useRealTimers()
})

describe('Tutorías de la facultad (15)', () => {
  const tutorias = [
    tutoriaAdmin(),
    tutoriaAdmin({
      idTutoria: 9,
      materia: { idMateria: 8, nombre: 'Matemáticas Discretas', nrc: 47731 },
      asistenciaPct: 76,
      cupo: cupo(7),
    }),
  ]

  const usarTutorias = () => {
    const consultas = []
    const peticiones = { desactivar: null, cierre: null, resumen: null }
    servidor.use(
      http.get('*/admin/resumen', ({ request }) => {
        peticiones.resumen = new URL(request.url).search
        return HttpResponse.json(respuestaOk(resumenAdmin))
      }),
      http.get('*/admin/tutorias', ({ request }) => {
        consultas.push(new URL(request.url).search)
        return HttpResponse.json(respuestaOk(tutorias))
      }),
      http.get('*/admin/tutores', ok(tutores)),
      http.patch('*/tutorias/:id/estado', async ({ params, request }) => {
        peticiones.desactivar = { id: params.id, cuerpo: await request.json() }
        return HttpResponse.json(respuestaOk(null))
      }),
    )
    return { consultas, peticiones }
  }

  it('muestra indicadores, la tabla y filtra en el backend', async () => {
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date('2026-10-05T09:00:00-06:00'))
    const { consultas, peticiones } = usarTutorias()
    renderApp('/administracion/tutorias')

    expect(await screen.findByText('Matemáticas Discretas')).toBeInTheDocument()
    expect(screen.getByText('de 77')).toBeInTheDocument()
    expect(screen.getByText('desde agosto')).toBeInTheDocument()
    expect(peticiones.resumen).toBe('?desde=2026-08-01')
    expect(screen.getByText('(asistencia baja)', { exact: false })).toBeInTheDocument()
    expect(
      screen.getByText('11 tutorías activas · cupo fijo de 7 tutorados por tutoría'),
    ).toBeInTheDocument()

    await userEvent.selectOptions(
      screen.getByLabelText('Filtrar por tutor'),
      'Jorge Castillo Rivera',
    )
    await userEvent.selectOptions(screen.getByLabelText('Filtrar por estado'), 'Todas')
    await userEvent.type(
      screen.getByLabelText('Buscar por Experiencia Educativa, NRC o tutor'),
      'web',
    )

    await waitFor(() =>
      expect(consultas.at(-1)).toBe('?q=web&matriculaTutor=S21004455&estado=TODAS'),
    )
  })

  it('desactiva una tutoria tras confirmar', async () => {
    const { peticiones } = usarTutorias()
    renderApp('/administracion/tutorias')

    await userEvent.click(
      await screen.findByRole('button', { name: 'Desactivar Estructuras de Datos' }),
    )
    const dialogo = screen.getByRole('dialog', { name: '¿Desactivar la tutoría?' })
    await userEvent.click(within(dialogo).getByRole('button', { name: 'Sí, desactivar' }))

    await waitFor(() =>
      expect(peticiones.desactivar).toEqual({ id: '12', cuerpo: { estado: 'INACTIVA' } }),
    )
  })

  it('cierra el periodo solo despues de marcar la casilla y muestra el error del backend', async () => {
    usarTutorias()
    let cuerpo
    servidor.use(
      http.post('*/admin/tutorias/cierre-periodo', async ({ request }) => {
        cuerpo = await request.json()
        return HttpResponse.json(
          respuestaError('No se puede cerrar: Bases de Datos tiene un pase de lista abierto.'),
          { status: 400 },
        )
      }),
    )
    renderApp('/administracion/tutorias')

    await userEvent.click(await screen.findByRole('button', { name: 'Cerrar periodo' }))
    const dialogo = screen.getByRole('dialog', { name: '¿Cerrar el periodo?' })
    expect(within(dialogo).getByText(/Se desactivarán las 11 tutorías activas/)).toBeInTheDocument()
    const confirmar = within(dialogo).getByRole('button', { name: 'Cerrar periodo' })
    expect(confirmar).toBeDisabled()

    await userEvent.click(
      within(dialogo).getByLabelText('Entiendo que esta acción no se puede deshacer'),
    )
    await userEvent.click(confirmar)

    expect(
      await within(dialogo).findByText(
        'No se puede cerrar: Bases de Datos tiene un pase de lista abierto.',
      ),
    ).toBeInTheDocument()
    expect(cuerpo).toEqual({ confirmar: true })
  })
})

describe('Experiencias Educativas (16)', () => {
  const usarCatalogo = () => {
    const peticiones = []
    servidor.use(
      http.get('*/materias', ok(materias)),
      http.post('*/materias', async ({ request }) => {
        const cuerpo = await request.json()
        peticiones.push({ metodo: 'POST', cuerpo })
        if (cuerpo.nrc === 52310) {
          return HttpResponse.json(
            respuestaError('Error de validación', {
              nrc: 'Este NRC ya está registrado para Redes de Computadoras.',
            }),
            { status: 400 },
          )
        }
        return HttpResponse.json(respuestaOk({ idMateria: 20, ...cuerpo, tutoriasActivas: 0 }))
      }),
      http.put('*/materias/:id', async ({ params, request }) => {
        peticiones.push({ metodo: 'PUT', id: params.id, cuerpo: await request.json() })
        return HttpResponse.json(respuestaOk(null))
      }),
      http.delete('*/materias/:id', ({ params }) => {
        peticiones.push({ metodo: 'DELETE', id: params.id })
        return HttpResponse.json(respuestaOk(null))
      }),
    )
    return peticiones
  }

  it('agrega una EE y muestra el NRC duplicado debajo del campo', async () => {
    const peticiones = usarCatalogo()
    renderApp('/administracion/experiencias')

    expect(await screen.findByText('Redes de Computadoras')).toBeInTheDocument()

    await userEvent.type(screen.getByLabelText('Nombre'), 'Arquitectura de Computadoras')
    await userEvent.type(screen.getByLabelText('NRC'), '52310')
    await userEvent.click(screen.getByRole('button', { name: 'Agregar' }))

    expect(
      await screen.findByText('Este NRC ya está registrado para Redes de Computadoras.'),
    ).toBeInTheDocument()
    expect(screen.getByLabelText('NRC')).toHaveAttribute('aria-invalid', 'true')

    await userEvent.clear(screen.getByLabelText('NRC'))
    await userEvent.type(screen.getByLabelText('NRC'), '52325')
    await userEvent.click(screen.getByRole('button', { name: 'Agregar' }))

    await waitFor(() =>
      expect(peticiones.at(-1)).toEqual({
        metodo: 'POST',
        cuerpo: { nombre: 'Arquitectura de Computadoras', nrc: 52325 },
      }),
    )
    expect(await screen.findByText('Experiencia educativa creada.')).toBeInTheDocument()
  })

  it('edita una EE y solo deja eliminar las que no tienen tutorias', async () => {
    const peticiones = usarCatalogo()
    renderApp('/administracion/experiencias')

    await userEvent.click(await screen.findByRole('button', { name: 'Editar Álgebra Lineal' }))
    expect(
      screen.getByRole('heading', { name: 'Editar Experiencia Educativa' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Eliminar' })).toBeDisabled()

    const nombre = screen.getByLabelText('Nombre')
    await userEvent.clear(nombre)
    await userEvent.type(nombre, 'Álgebra Lineal I')
    await userEvent.click(screen.getByRole('button', { name: 'Guardar cambios' }))
    await waitFor(() =>
      expect(peticiones.at(-1)).toEqual({
        metodo: 'PUT',
        id: '1',
        cuerpo: { nombre: 'Álgebra Lineal I', nrc: 47702 },
      }),
    )

    await userEvent.click(screen.getByRole('button', { name: 'Editar Redes de Computadoras' }))
    await userEvent.click(screen.getByRole('button', { name: 'Eliminar' }))
    await userEvent.click(screen.getByRole('button', { name: 'Sí, eliminar' }))
    await waitFor(() => expect(peticiones.at(-1)).toEqual({ metodo: 'DELETE', id: '13' }))
  })
})

describe('acceso del admin', () => {
  it('entra a su propio panel y no a las pantallas del tutor', async () => {
    servidor.use(http.get('*', ok([])))
    const router = renderApp('/tutor/home')

    await waitFor(() => expect(router.state.location.pathname).toBe('/administracion/tutorias'))
    expect(await screen.findByRole('link', { name: 'Experiencias Educativas' })).toBeInTheDocument()
  })
})
