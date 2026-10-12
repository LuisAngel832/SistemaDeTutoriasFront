import { act, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { iniciarSesionComo, ok, renderApp, usuarioActual } from '@/test/app'
import {
  choqueBasesDeDatos,
  comentarios,
  cupo,
  detalleTutoria,
  miAsistencia,
  misInscripciones,
  panelTutorado,
  semana,
  tutoriaExplorar,
} from '@/test/fixtures'
import { renderConProveedores } from '@/test/render'
import { respuestaOk, servidor, usarServidorMock } from '@/test/servidor'
import { PanelInscripcion } from './components/PanelInscripcion'

usarServidorMock()

beforeEach(() => {
  iniciarSesionComo('tutorado')
  servidor.use(usuarioActual('tutorado'), http.get('*/tutorias/:id/comentarios', ok(comentarios)))
})

afterEach(() => {
  vi.useRealTimers()
})

// Las fechas relativas ("mañana") dependen del dia: se fija el de los mockups.
const fijarHoy = () => {
  vi.useFakeTimers({ toFake: ['Date'] })
  vi.setSystemTime(new Date('2026-10-05T09:00:00-06:00'))
}

describe('Explorar tutorías (03)', () => {
  const tutorias = [
    tutoriaExplorar(),
    tutoriaExplorar({
      idTutoria: 20,
      materia: { idMateria: 9, nombre: 'Probabilidad y Estadística', nrc: 47790 },
      cupo: cupo(2),
      choques: [choqueBasesDeDatos],
    }),
    tutoriaExplorar({
      idTutoria: 21,
      materia: { idMateria: 10, nombre: 'Cálculo Integral', nrc: 47718 },
      cupo: cupo(7),
    }),
    tutoriaExplorar({
      idTutoria: 22,
      materia: { idMateria: 11, nombre: 'Ingeniería de Requisitos', nrc: 49105 },
      cupo: cupo(6),
    }),
  ]

  it('muestra cupo, insignias, choques y la accion de cada tarjeta', async () => {
    servidor.use(http.get('*/tutorias', ok(tutorias)))
    renderApp('/tutorado/home')

    expect(await screen.findByText('4 tutorías disponibles')).toBeInTheDocument()
    const tarjeta = (nombre) => screen.getByRole('article', { name: nombre })

    expect(within(tarjeta('Estructuras de Datos')).getByText('3 lugares')).toBeInTheDocument()
    expect(
      within(tarjeta('Estructuras de Datos')).getByRole('link', {
        name: /Ver detalle e inscribirme/,
      }),
    ).toHaveAttribute('href', '/tutorado/tutorias/12')
    expect(within(tarjeta('Cálculo Integral')).getByText('Llena')).toBeInTheDocument()
    expect(
      within(tarjeta('Cálculo Integral')).getByRole('link', { name: 'Ver detalle' }),
    ).toBeInTheDocument()
    expect(
      within(tarjeta('Ingeniería de Requisitos')).getByText('Último lugar'),
    ).toBeInTheDocument()
    expect(
      within(tarjeta('Probabilidad y Estadística')).getByText(
        'El jueves choca con Bases de Datos (16:00 – 18:00).',
      ),
    ).toBeInTheDocument()
  })

  it('envia los filtros al backend y los conserva en la URL', async () => {
    const pedidas = []
    servidor.use(
      http.get('*/tutorias', ({ request }) => {
        pedidas.push(new URL(request.url).search)
        return HttpResponse.json(respuestaOk(tutorias))
      }),
    )
    const router = renderApp('/tutorado/home')
    await screen.findByText('4 tutorías disponibles')

    await userEvent.click(screen.getByRole('button', { name: 'Lunes' }))
    await userEvent.click(screen.getByLabelText('Solo con lugares disponibles'))
    await userEvent.click(screen.getByLabelText('Ocultar las que se cruzan con mis horarios'))
    await userEvent.type(screen.getByRole('searchbox'), 'datos')

    await waitFor(() =>
      expect(pedidas.at(-1)).toBe('?q=datos&dia=LUNES&soloConLugar=true&ocultarChoques=true'),
    )
    expect(router.state.location.search).toBe('?dia=LUNES&lugar=1&choques=1&q=datos')
    expect(screen.getByRole('button', { name: 'Lunes' })).toHaveAttribute('aria-pressed', 'true')
  })

  it('el buscador sigue a la URL si cambia sin escribir (menu o historial)', async () => {
    servidor.use(http.get('*/tutorias', ok(tutorias)))
    const router = renderApp('/tutorado/home?q=datos')
    expect(await screen.findByRole('searchbox')).toHaveValue('datos')

    // "Explorar tutorías" del menu lleva a la misma pagina sin filtros.
    await act(() => router.navigate('/tutorado/home'))

    expect(screen.getByRole('searchbox')).toHaveValue('')
    // Pasado el tiempo de espera de la busqueda, la URL no recupera el texto anterior.
    await new Promise((resolver) => setTimeout(resolver, 500))
    expect(router.state.location.search).toBe('')
  })
})

describe('Detalle e inscripción (04 y 05)', () => {
  it('muestra la tutoria, "Tu semana" y se inscribe tras confirmar', async () => {
    let cuerpo
    servidor.use(
      http.get('*/tutorias/12', ok(detalleTutoria())),
      http.get('*/inscripciones/semana', ok(semana)),
      http.post('*/inscripciones', async ({ request }) => {
        cuerpo = await request.json()
        return HttpResponse.json(respuestaOk({ idTutoria: 12, estado: 'ACTIVA' }))
      }),
      http.get('*/inscripciones', ok(misInscripciones())),
    )
    const router = renderApp('/tutorado/tutorias/12')

    expect(await screen.findByRole('heading', { name: 'Estructuras de Datos' })).toBeInTheDocument()
    expect(screen.getByText('NRC 48215')).toBeInTheDocument()
    expect(screen.getByText('2 sesiones de 2 horas')).toBeInTheDocument()
    expect(screen.getByText('Miércoles 7 de octubre')).toBeInTheDocument()
    expect(screen.getByText('Montículos')).toBeInTheDocument()
    expect(screen.getByText('Quedan 3 lugares')).toBeInTheDocument()
    expect(
      screen.getByText('Inscríbete para sugerir temas u observaciones al tutor.'),
    ).toBeInTheDocument()
    expect(await screen.findByText('✓ Sin choques')).toBeInTheDocument()
    expect(screen.getAllByText('10:00 – 12:00 · Esta tutoría')).toHaveLength(2)
    expect(screen.getByText('08:00 – 10:00 · Álgebra Lineal')).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Inscribirme' }))
    const modal = screen.getByRole('dialog', { name: 'Confirmar inscripción' })
    expect(within(modal).getByText(/zS23014587@estudiantes\.uv\.mx/)).toBeInTheDocument()
    await userEvent.click(within(modal).getByRole('button', { name: 'Sí, inscribirme' }))

    await waitFor(() => expect(router.state.location.pathname).toBe('/tutorado/inscripciones'))
    expect(cuerpo).toEqual({ idTutoria: 12 })
    expect(await screen.findByText('Inscripción confirmada')).toBeInTheDocument()
  })

  it('vuelve a explorar con los filtros con los que llego', async () => {
    servidor.use(
      http.get('*/tutorias', ok([tutoriaExplorar()])),
      http.get('*/tutorias/12', ok(detalleTutoria())),
      http.get('*/inscripciones/semana', ok(semana)),
    )
    const router = renderApp('/tutorado/home?dia=LUNES')

    await userEvent.click(await screen.findByRole('link', { name: /Ver detalle e inscribirme/ }))
    // El enlace tambien existe mientras carga: se espera al detalle para no pulsar uno viejo.
    await screen.findByRole('heading', { name: 'Estructuras de Datos', level: 1 })
    await userEvent.click(screen.getByRole('link', { name: '← Volver a explorar' }))

    await waitFor(() => expect(router.state.location.search).toBe('?dia=LUNES'))
  })
})

describe('Panel de inscripción (06)', () => {
  const renderPanel = (cambios, props = {}) =>
    renderConProveedores(
      <PanelInscripcion
        tutoria={detalleTutoria(cambios)}
        isSubmitting={false}
        onInscribirse={vi.fn()}
        onDarseDeBaja={vi.fn().mockResolvedValue()}
        {...props}
      />,
    )

  it('con lugar permite inscribirse', async () => {
    const onInscribirse = vi.fn()
    renderPanel({}, { onInscribirse })
    expect(screen.getByText('4 de 7 lugares ocupados')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Inscribirme' }))
    expect(onInscribirse).toHaveBeenCalled()
  })

  it('con inscripcion activa muestra la proxima sesion y permite darse de baja', async () => {
    const onDarseDeBaja = vi.fn().mockResolvedValue()
    renderPanel(
      {
        panelTutorado: panelTutorado({
          estado: 'INSCRIPCION_ACTIVA',
          puedeInscribirse: false,
          inscripcion: { estado: 'ACTIVA', inasistencias: 0, inasistenciasPermitidas: 2 },
        }),
      },
      { onDarseDeBaja },
    )

    expect(screen.getByText('Inscripción activa')).toBeInTheDocument()
    expect(screen.getByText('Próxima sesión: miércoles 7 de octubre, 10:00')).toBeInTheDocument()
    expect(
      screen.getByText(/Te enviaremos el recordatorio por correo el miércoles a las 08:00/),
    ).toBeInTheDocument()
    expect(screen.getByText('0 de 2 permitidas')).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Darme de baja' }))
    await userEvent.click(screen.getByRole('button', { name: 'Sí, darme de baja' }))
    expect(onDarseDeBaja).toHaveBeenCalled()
  })

  it('con choque de horario explica el cruce y bloquea la inscripcion', () => {
    renderPanel({
      cupo: cupo(2),
      panelTutorado: panelTutorado({
        estado: 'CHOQUE_HORARIO',
        puedeInscribirse: false,
        choques: [choqueBasesDeDatos],
      }),
    })

    expect(screen.getByText('Se cruza con tu horario')).toBeInTheDocument()
    expect(
      screen.getByText(
        'El jueves de 17:00 a 19:00 choca con tu inscripción en Bases de Datos (jueves 16:00 – 18:00).',
      ),
    ).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Revisar mis tutorías' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Inscribirme' })).toBeDisabled()
  })

  it('llena y no activa', () => {
    const { unmount } = renderPanel({
      cupo: cupo(7),
      panelTutorado: panelTutorado({ estado: 'LLENA', puedeInscribirse: false }),
    })
    expect(screen.getByText('Tutoría llena')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Inscribirme' })).toBeDisabled()
    unmount()

    renderPanel({ panelTutorado: panelTutorado({ estado: 'NO_ACTIVA', puedeInscribirse: false }) })
    expect(screen.getByText('Esta tutoría ya no está disponible')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Explorar otras tutorías' })).toBeInTheDocument()
  })

  it('con baja automatica muestra la fecha y las inasistencias', () => {
    renderPanel({
      panelTutorado: panelTutorado({
        estado: 'BAJA_AUTOMATICA',
        puedeInscribirse: false,
        inscripcion: {
          estado: 'BAJA_AUTOMATICA',
          fechaBaja: '2026-09-28T14:05:00-06:00',
          inasistencias: 3,
          inasistenciasPermitidas: 2,
        },
      }),
    })

    expect(screen.getByRole('heading', { name: 'Tu inscripción' })).toBeInTheDocument()
    expect(
      screen.getByText(
        'El lunes 28 de septiembre acumulaste 3 inasistencias y se te dio de baja. Te avisamos por correo.',
      ),
    ).toBeInTheDocument()
    expect(screen.getByText('3 inasistencias')).toBeInTheDocument()
  })
})

describe('Mis tutorías (07)', () => {
  it('muestra la proxima sesion, las activas y las anteriores', async () => {
    fijarHoy()
    servidor.use(http.get('*/inscripciones', ok(misInscripciones())))
    renderApp('/tutorado/inscripciones')

    expect(await screen.findByText('Próxima sesión · mañana')).toBeInTheDocument()
    expect(screen.getByText('Recordatorio por correo a las 14:00')).toBeInTheDocument()
    expect(screen.getByText('Consultas con JOIN')).toBeInTheDocument()

    const nueva = screen.getByRole('article', { name: 'Estructuras de Datos' })
    expect(within(nueva).getByText('Nueva')).toBeInTheDocument()
    expect(within(nueva).getByText(/Primera sesión: miércoles 7 oct, 10:00/)).toBeInTheDocument()
    expect(within(nueva).getByRole('link', { name: /Ver detalle y asistencia/ })).toHaveAttribute(
      'href',
      '/tutorado/inscripciones/12',
    )
    const activa = screen.getByRole('article', { name: 'Bases de Datos' })
    expect(within(activa).getByText('1 de 2 permitidas')).toBeInTheDocument()
    expect(within(activa).getByText(/Próxima: mañana, 16:00/)).toBeInTheDocument()

    expect(screen.getByText('El 28 sep 2026 acumulaste 3 inasistencias')).toBeInTheDocument()
    expect(screen.getByText('Te diste de baja el 2 sep 2026')).toBeInTheDocument()
  })

  it('invita a explorar cuando no hay inscripciones', async () => {
    servidor.use(
      http.get('*/inscripciones', ok({ proximaSesion: null, activas: [], anteriores: [] })),
    )
    renderApp('/tutorado/inscripciones')

    expect(await screen.findByText('Aún no tienes inscripciones')).toBeInTheDocument()
  })
})

describe('Mi asistencia (08)', () => {
  it('muestra el historial, los conteos y permite darse de baja', async () => {
    let baja = false
    servidor.use(
      http.get('*/inscripciones/tutorias/7', ok(miAsistencia())),
      http.delete('*/inscripciones/tutorias/7', () => {
        baja = true
        return HttpResponse.json(respuestaOk(null, 'Te diste de baja de la tutoría.'))
      }),
      http.get('*/inscripciones', ok(misInscripciones())),
    )
    const router = renderApp('/tutorado/inscripciones/7')

    expect(await screen.findByRole('heading', { name: 'Bases de Datos' })).toBeInTheDocument()
    expect(screen.getByText('Martes y jueves · 16:00 – 18:00')).toBeInTheDocument()
    expect(screen.getByText('Inscripción desde el 26 de agosto de 2026')).toBeInTheDocument()

    const filas = within(screen.getByRole('table')).getAllByRole('row')
    expect(filas).toHaveLength(5)
    expect(within(filas[1]).getByText('Pendiente')).toBeInTheDocument()
    expect(within(filas[2]).getByText('Asistió')).toBeInTheDocument()
    expect(within(filas[3]).getByText('No asistió')).toBeInTheDocument()
    expect(within(filas[4]).getByText('No cuenta')).toBeInTheDocument()

    expect(screen.getByText('Sesiones con asistencia').nextSibling).toHaveTextContent('9')
    expect(screen.getByText('Martes 6 de octubre')).toBeInTheDocument()
    expect(screen.getByLabelText('Tema u observación para el tutor')).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Darme de baja' }))
    await userEvent.click(screen.getByRole('button', { name: 'Sí, darme de baja' }))

    await waitFor(() => expect(router.state.location.pathname).toBe('/tutorado/inscripciones'))
    expect(baja).toBe(true)
  })

  it('despliega todas las sesiones cuando hay mas de seis', async () => {
    const historial = Array.from({ length: 8 }, (_, indice) => ({
      idSesion: indice + 1,
      fecha: `2026-09-${String(indice + 1).padStart(2, '0')}`,
      dia: 'MARTES',
      horaInicio: '16:00',
      horaFin: '18:00',
      estadoSesion: 'COMPLETADA',
      miAsistencia: 'ASISTIO',
    }))
    servidor.use(http.get('*/inscripciones/tutorias/7', ok(miAsistencia({ historial }))))
    renderApp('/tutorado/inscripciones/7')

    await userEvent.click(await screen.findByRole('button', { name: 'Ver las 8 sesiones →' }))
    expect(within(screen.getByRole('table')).getAllByRole('row')).toHaveLength(9)
  })
})
