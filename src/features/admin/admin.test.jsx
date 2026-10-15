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

describe('Tutores autorizados', () => {
  const preRegistrado = {
    matricula: 'S21008800',
    nombre: 'Luis',
    apellidos: 'Pérez Montiel',
    nombreCompleto: 'Luis Pérez Montiel',
  }

  const usarTutores = () => {
    const lista = [...tutores, preRegistrado]
    const peticiones = []
    servidor.use(
      http.get('*/admin/tutores', () => HttpResponse.json(respuestaOk(lista))),
      http.post('*/admin/tutores', async ({ request }) => {
        const cuerpo = await request.json()
        peticiones.push({ metodo: 'POST', cuerpo })
        if (lista.some((tutor) => tutor.matricula === cuerpo.matricula)) {
          return HttpResponse.json(
            respuestaError('Error de validación', {
              matricula: 'La matrícula ya está registrada.',
            }),
            { status: 400 },
          )
        }
        const nuevo = { ...cuerpo, nombreCompleto: `${cuerpo.nombre} ${cuerpo.apellidos}` }
        lista.push(nuevo)
        return HttpResponse.json(
          respuestaOk({ ...cuerpo, rol: 'TUTOR', proveedor: null }, 'Tutor autorizado.'),
        )
      }),
      http.delete('*/admin/tutores/:matricula', ({ params }) => {
        peticiones.push({ metodo: 'DELETE', matricula: params.matricula })
        if (params.matricula !== preRegistrado.matricula) {
          return HttpResponse.json(
            respuestaError(
              'Solo se puede quitar un tutor pre-registrado que aún no crea su cuenta.',
            ),
            { status: 400 },
          )
        }
        lista.splice(lista.indexOf(preRegistrado), 1)
        return HttpResponse.json(respuestaOk(null, 'Pre-registro eliminado.'))
      }),
    )
    return peticiones
  }

  const llenar = async ({ matricula }) => {
    await userEvent.type(screen.getByLabelText('Nombre(s)'), 'Ana')
    await userEvent.type(screen.getByLabelText('Apellidos'), 'Ruiz Soto')
    await userEvent.clear(screen.getByLabelText('Matrícula'))
    await userEvent.type(screen.getByLabelText('Matrícula'), matricula)
    await userEvent.type(
      screen.getByLabelText('Correo electrónico'),
      'ZS21007700@estudiantes.uv.mx',
    )
    await userEvent.click(screen.getByRole('button', { name: 'Autorizar' }))
  }

  it('autoriza un tutor y muestra la matricula duplicada debajo del campo', async () => {
    const peticiones = usarTutores()
    renderApp('/administracion/tutores')

    expect(await screen.findByText('Luis Pérez Montiel')).toBeInTheDocument()

    await llenar({ matricula: 'S21009342' })
    expect(await screen.findByText('La matrícula ya está registrada.')).toBeInTheDocument()
    expect(screen.getByLabelText('Matrícula')).toHaveAttribute('aria-invalid', 'true')

    await userEvent.clear(screen.getByLabelText('Nombre(s)'))
    await userEvent.clear(screen.getByLabelText('Apellidos'))
    await userEvent.clear(screen.getByLabelText('Correo electrónico'))
    await llenar({ matricula: 'zs21007700' })

    await waitFor(() =>
      expect(peticiones.at(-1)).toEqual({
        metodo: 'POST',
        cuerpo: {
          nombre: 'Ana',
          apellidos: 'Ruiz Soto',
          matricula: 'S21007700',
          correo: 'zs21007700@estudiantes.uv.mx',
        },
      }),
    )
    expect(await screen.findByText('Tutor autorizado.')).toBeInTheDocument()
    expect(await screen.findByText('Ana Ruiz Soto')).toBeInTheDocument()
    expect(screen.getByLabelText('Nombre(s)')).toHaveValue('')
  })

  it('quita un pre-registro tras confirmar y muestra el rechazo si ya creo su cuenta', async () => {
    const peticiones = usarTutores()
    renderApp('/administracion/tutores')

    await userEvent.click(
      await screen.findByRole('button', {
        name: 'Quitar la autorización de Rocío Hernández Aguilar',
      }),
    )
    await userEvent.click(screen.getByRole('button', { name: 'Sí, quitar' }))
    expect(
      await screen.findByText(
        'Solo se puede quitar un tutor pre-registrado que aún no crea su cuenta.',
      ),
    ).toBeInTheDocument()

    await userEvent.click(
      screen.getByRole('button', { name: 'Quitar la autorización de Luis Pérez Montiel' }),
    )
    await userEvent.click(screen.getByRole('button', { name: 'Sí, quitar' }))
    await waitFor(() =>
      expect(peticiones.at(-1)).toEqual({ metodo: 'DELETE', matricula: 'S21008800' }),
    )
    expect(await screen.findByText('Pre-registro eliminado.')).toBeInTheDocument()
    await waitFor(() => expect(screen.queryByText('Luis Pérez Montiel')).not.toBeInTheDocument())
  })
})

describe('acceso del admin', () => {
  it('entra a su propio panel y no a las pantallas del tutor', async () => {
    servidor.use(http.get('*', ok([])))
    const router = renderApp('/tutor/home')

    await waitFor(() => expect(router.state.location.pathname).toBe('/administracion/tutorias'))
    expect(await screen.findByRole('link', { name: 'Experiencias Educativas' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Tutores' })).toBeInTheDocument()
  })
})
