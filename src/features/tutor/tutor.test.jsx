import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { beforeEach, describe, expect, it } from 'vitest'
import { iniciarSesionComo, ok, renderApp, usuarioActual } from '@/test/app'
import {
  comentarios,
  cupo,
  detalleTutoria,
  edificios,
  historialAsistencia,
  inscritos,
  listaDeSesion,
  materias,
  sesion,
  sesionesDeTutoria,
  sesionesHoy,
  sesionProgramada,
  tutoriaDelTutor,
} from '@/test/fixtures'
import { respuestaError, respuestaOk, servidor, usarServidorMock } from '@/test/servidor'

usarServidorMock()

beforeEach(() => {
  iniciarSesionComo('tutor')
  servidor.use(usuarioActual('tutor'), http.get('*/tutorias/:id/comentarios', ok(comentarios)))
})

// Responde con lo que reciba y guarda el cuerpo de la peticion.
const capturar = (respuesta = null) => {
  const recibido = { cuerpo: undefined, llamadas: 0 }
  const handler = async ({ request }) => {
    recibido.llamadas += 1
    const texto = await request.text()
    recibido.cuerpo = texto ? JSON.parse(texto) : undefined
    return HttpResponse.json(respuestaOk(respuesta))
  }
  return [recibido, handler]
}

describe('Mis tutorías y sesiones de hoy (09)', () => {
  it('muestra las sesiones de hoy con sus acciones y las tutorias activas', async () => {
    const [cancelacion, cancelar] = capturar(sesionProgramada({ estado: 'CANCELADA' }))
    servidor.use(
      http.get('*/sesiones/hoy', ok(sesionesHoy())),
      http.get('*/tutorias/mis-tutorias', ok([tutoriaDelTutor()])),
      http.post('*/sesiones/cancelar', cancelar),
    )
    renderApp('/tutor/home')

    const hoy = await screen.findByRole('region', { name: /Sesiones de hoy/ })
    const abierta = await within(hoy).findByRole('article', { name: 'Estructuras de Datos' })
    expect(within(abierta).getByText('Lista abierta')).toBeInTheDocument()
    expect(
      within(abierta).getByText(
        'La sesión terminó. Cierra la lista para que cuente como completada.',
      ),
    ).toBeInTheDocument()
    expect(within(abierta).getByRole('link', { name: 'Revisar y cerrar lista' })).toHaveAttribute(
      'href',
      '/tutor/sesiones/88/lista',
    )

    const programada = within(hoy).getByRole('article', { name: 'Programación Web' })
    expect(
      within(programada).getByText('Los tutorados recibirán el recordatorio a las 14:00.'),
    ).toBeInTheDocument()
    expect(within(programada).getByRole('button', { name: 'Abrir pase de lista' })).toBeDisabled()

    const tutoria = await screen.findByText('1 tutorado ya tiene 2 inasistencias')
    expect(tutoria).toBeInTheDocument()

    await userEvent.click(within(programada).getByRole('button', { name: 'Cancelar sesión' }))
    await userEvent.click(screen.getByRole('button', { name: 'Sí, cancelar sesión' }))

    await waitFor(() => expect(cancelacion.cuerpo).toEqual({ idHorario: 61, fecha: '2026-10-05' }))
  })

  it('abre el pase de lista y lleva a la lista de la sesion', async () => {
    const [apertura, abrir] = capturar(
      listaDeSesion({
        sesion: sesion({ idSesion: 95, idHorario: 61, materia: 'Programación Web' }),
      }),
    )
    servidor.use(
      http.get(
        '*/sesiones/hoy',
        ok(
          sesionesHoy({
            sesiones: [
              sesionProgramada({
                acciones: { abrirLista: true, cerrarLista: false, cancelar: false },
              }),
            ],
          }),
        ),
      ),
      http.get('*/tutorias/mis-tutorias', ok([])),
      http.post('*/sesiones/abrir-lista', abrir),
      http.get('*/sesiones/95/lista', ok(listaDeSesion())),
    )
    const router = renderApp('/tutor/home')

    await userEvent.click(await screen.findByRole('button', { name: 'Abrir pase de lista' }))

    await waitFor(() => expect(router.state.location.pathname).toBe('/tutor/sesiones/95/lista'))
    expect(apertura.cuerpo).toEqual({ idHorario: 61, fecha: '2026-10-05' })
  })

  it('avisa de las listas de dias anteriores sin cerrar', async () => {
    servidor.use(
      http.get(
        '*/sesiones/hoy',
        ok(
          sesionesHoy({
            sesiones: [],
            listasSinCerrar: [sesion({ idSesion: 70, fecha: '2026-09-28' })],
          }),
        ),
      ),
      http.get('*/tutorias/mis-tutorias', ok([])),
    )
    renderApp('/tutor/home')

    expect(await screen.findByText('Tienes 1 pase de lista sin cerrar')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Ir al pase de lista' })).toHaveAttribute(
      'href',
      '/tutor/sesiones/70/lista',
    )
    expect(screen.getByText('No tienes sesiones hoy.')).toBeInTheDocument()
  })
})

describe('Crear tutoría (10)', () => {
  beforeEach(() => {
    servidor.use(
      http.get('*/materias', ok(materias)),
      http.get('*/catalogos/edificios', ok(edificios)),
    )
  })

  const llenarHorario = async (indice, dia, inicio, fin) => {
    const horario = screen.getByRole('group', { name: `Horario ${indice}` })
    await userEvent.click(within(horario).getByRole('radio', { name: dia }))
    const [campoInicio, campoFin] = [
      within(horario).getByLabelText('Hora de inicio'),
      within(horario).getByLabelText('Hora de fin'),
    ]
    await userEvent.clear(campoInicio)
    await userEvent.type(campoInicio, inicio)
    await userEvent.clear(campoFin)
    await userEvent.type(campoFin, fin)
    return horario
  }

  it('crea una tutoria con dos horarios y sus temas', async () => {
    const [creacion, crear] = capturar({ ...detalleTutoria(), idTutoria: 30 })
    servidor.use(
      http.post('*/tutorias', crear),
      http.get('*/tutorias/30', ok(detalleTutoria({ idTutoria: 30 }))),
      http.get('*/tutorias/30/sesiones', ok([])),
      http.get('*/tutorias/30/inscritos', ok({ cupo: cupo(0), inscritos: [] })),
    )
    const router = renderApp('/tutor/tutorias/nueva')

    await screen.findByRole('option', { name: 'Redes de Computadoras (NRC 52310)' })
    await userEvent.selectOptions(
      screen.getByLabelText('Experiencia Educativa que impartirás'),
      'Redes de Computadoras (NRC 52310)',
    )
    expect(screen.queryByRole('radio', { name: 'Sábado' })).not.toBeInTheDocument()
    await userEvent.selectOptions(screen.getByLabelText('Edificio'), 'Edificio 1')
    await userEvent.selectOptions(screen.getByLabelText('Aula'), 'Aula 10')

    const primero = await llenarHorario(1, 'Martes', '08:00', '10:00')
    await userEvent.type(
      within(primero).getByRole('textbox', { name: 'Tema nuevo para el horario 1' }),
      'Modelo OSI{Enter}',
    )
    expect(
      within(primero).getByText('Los tutorados verán estos temas en las sesiones del martes.'),
    ).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: '+ Agregar otro horario' }))
    await llenarHorario(2, 'Viernes', '12:00', '14:00')

    await userEvent.click(screen.getByRole('button', { name: 'Crear tutoría' }))

    await waitFor(() => expect(router.state.location.pathname).toBe('/tutor/tutorias/30'))
    expect(creacion.cuerpo).toEqual({
      idMateria: 13,
      edificio: 1,
      aula: 10,
      horarios: [
        { dia: 'MARTES', horaInicio: '08:00', horaFin: '10:00', temas: ['Modelo OSI'] },
        { dia: 'VIERNES', horaInicio: '12:00', horaFin: '14:00', temas: [] },
      ],
    })
  })

  it('valida horas y traslapes antes de enviar y muestra los errores del backend', async () => {
    servidor.use(
      http.post('*/tutorias', () =>
        HttpResponse.json(
          respuestaError(
            'El horario del martes 08:00–10:00 choca con tu tutoría de Bases de Datos.',
          ),
          { status: 400 },
        ),
      ),
    )
    renderApp('/tutor/tutorias/nueva')

    await screen.findByRole('option', { name: 'Álgebra Lineal (NRC 47702)' })
    await userEvent.selectOptions(
      screen.getByLabelText('Experiencia Educativa que impartirás'),
      'Álgebra Lineal (NRC 47702)',
    )
    await userEvent.selectOptions(screen.getByLabelText('Edificio'), 'Edificio 2')
    await userEvent.selectOptions(screen.getByLabelText('Aula'), 'Aula 7')
    await llenarHorario(1, 'Martes', '10:00', '08:00')
    await userEvent.click(screen.getByRole('button', { name: 'Crear tutoría' }))
    expect(
      await screen.findByText('La hora de fin debe ser posterior a la de inicio'),
    ).toBeInTheDocument()

    await llenarHorario(1, 'Martes', '08:00', '10:00')
    await userEvent.click(screen.getByRole('button', { name: '+ Agregar otro horario' }))
    await llenarHorario(2, 'Martes', '09:00', '11:00')
    await userEvent.click(screen.getByRole('button', { name: 'Crear tutoría' }))
    expect(await screen.findByText('Se traslapa con el horario 1')).toBeInTheDocument()

    await llenarHorario(2, 'Martes', '10:00', '12:00')
    await userEvent.click(screen.getByRole('button', { name: 'Crear tutoría' }))
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'El horario del martes 08:00–10:00 choca con tu tutoría de Bases de Datos.',
    )
  })
})

describe('Editar tutoría', () => {
  beforeEach(() => {
    servidor.use(
      http.get('*/materias', ok(materias)),
      http.get('*/catalogos/edificios', ok(edificios)),
    )
  })

  it('precarga la tutoria sin inscritos y envia los horarios con su id', async () => {
    const [edicion, editar] = capturar(detalleTutoria())
    servidor.use(
      http.get('*/tutorias/12', ok(detalleTutoria({ cupo: cupo(0) }))),
      http.put('*/tutorias/12', editar),
      http.get('*/tutorias/12/sesiones', ok([])),
      http.get('*/tutorias/12/inscritos', ok({ cupo: cupo(0), inscritos: [] })),
    )
    const router = renderApp('/tutor/tutorias/12/editar')

    const ee = await screen.findByLabelText('Experiencia Educativa que impartirás')
    expect(ee).toBeDisabled()
    expect(screen.getAllByText('Listas enlazadas')).toHaveLength(1)

    await userEvent.click(screen.getByRole('button', { name: 'Guardar cambios' }))

    await waitFor(() => expect(router.state.location.pathname).toBe('/tutor/tutorias/12'))
    expect(edicion.cuerpo).toEqual({
      edificio: 2,
      aula: 7,
      horarios: [
        {
          idHorario: 31,
          dia: 'LUNES',
          horaInicio: '10:00',
          horaFin: '12:00',
          temas: ['Listas enlazadas', 'Pilas y colas', 'Recursividad'],
        },
        {
          idHorario: 32,
          dia: 'MIERCOLES',
          horaInicio: '10:00',
          horaFin: '12:00',
          temas: ['Árboles binarios de búsqueda', 'Recorridos de árboles', 'Montículos'],
        },
      ],
    })
  })

  it('no permite editar con tutorados inscritos', async () => {
    servidor.use(http.get('*/tutorias/12', ok(detalleTutoria())))
    renderApp('/tutor/tutorias/12/editar')

    expect(await screen.findByText('Tiene tutorados inscritos')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Guardar cambios' })).not.toBeInTheDocument()
  })
})

describe('Detalle de tutoría (11)', () => {
  const usarDetalle = () => {
    const [nuevoTema, agregar] = capturar({ idTema: 130, tema: 'Grafos' })
    const [desactivacion, desactivar] = capturar(null)
    const borrados = []
    servidor.use(
      http.get('*/tutorias/12', ok(detalleTutoria({ esDueno: true, panelTutorado: null }))),
      http.get('*/tutorias/12/sesiones', ok(sesionesDeTutoria())),
      http.get('*/tutorias/12/inscritos', ok(inscritos())),
      http.post('*/horarios/31/temas', agregar),
      http.delete('*/temas/:id', ({ params }) => {
        borrados.push(params.id)
        return HttpResponse.json(respuestaOk(null))
      }),
      http.patch('*/tutorias/12/estado', desactivar),
    )
    return { nuevoTema, borrados, desactivacion }
  }

  it('muestra sesiones, inscritos y comentarios', async () => {
    usarDetalle()
    renderApp('/tutor/tutorias/12')

    expect(await screen.findByText('NRC 48215')).toBeInTheDocument()
    expect(await screen.findByText('Recordatorio a los tutorados a las 08:00')).toBeInTheDocument()
    expect(screen.getByText('5 de 5 marcados · falta cerrar la lista')).toBeInTheDocument()
    expect(screen.getByText('4 de 5 asistieron')).toBeInTheDocument()
    expect(
      screen.getByText('Se avisó por correo a los 5 tutorados · no cuenta para inasistencias'),
    ).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Ver lista' })).toHaveAttribute(
      'href',
      '/tutor/sesiones/80/lista',
    )
    expect(screen.getByRole('link', { name: 'Historial de asistencia →' })).toHaveAttribute(
      'href',
      '/tutor/historial?tutoria=12',
    )
    expect(await screen.findByText('En riesgo de baja')).toBeInTheDocument()
    // Aparece entre los inscritos y en los comentarios.
    expect(await screen.findAllByText('Diego Ramírez Soto')).toHaveLength(2)
  })

  it('edita los temas en linea', async () => {
    const { nuevoTema, borrados } = usarDetalle()
    renderApp('/tutor/tutorias/12')

    await userEvent.type(
      await screen.findByRole('textbox', { name: 'Tema nuevo para el lunes' }),
      'Grafos',
    )
    await userEvent.click(screen.getByRole('button', { name: 'Agregar tema al lunes' }))
    await waitFor(() => expect(nuevoTema.cuerpo).toEqual({ tema: 'Grafos' }))

    await userEvent.click(screen.getByRole('button', { name: 'Quitar el tema Pilas y colas' }))
    await waitFor(() => expect(borrados).toEqual(['102']))
  })

  it('bloquea la edicion con inscritos o lista abierta y desactiva tras confirmar', async () => {
    const { desactivacion } = usarDetalle()
    renderApp('/tutor/tutorias/12')

    expect(
      await screen.findByText('Cierra el pase de lista abierto antes de editar.'),
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Editar tutoría' })).toBeDisabled()
    // Con la lista abierta tampoco se puede desactivar.
    expect(screen.getByRole('button', { name: 'Desactivar tutoría' })).toBeDisabled()
    expect(desactivacion.llamadas).toBe(0)
  })

  it('desactiva la tutoria cuando no hay lista abierta', async () => {
    const { desactivacion } = usarDetalle()
    servidor.use(http.get('*/tutorias/12/sesiones', ok([sesionesDeTutoria()[0]])))
    renderApp('/tutor/tutorias/12')

    await userEvent.click(await screen.findByRole('button', { name: 'Desactivar tutoría' }))
    const dialogo = screen.getByRole('dialog', { name: '¿Desactivar la tutoría?' })
    expect(within(dialogo).getByText(/Avisaremos por correo a los 4 inscritos/)).toBeInTheDocument()
    await userEvent.click(within(dialogo).getByRole('button', { name: 'Sí, desactivar' }))

    await waitFor(() => expect(desactivacion.cuerpo).toEqual({ estado: 'INACTIVA' }))
  })
})

describe('Pase de lista (12 y 13)', () => {
  it('marca, avisa de la baja y cierra la lista', async () => {
    let marcas
    const [cierre, cerrar] = capturar({
      idSesion: 88,
      estado: 'COMPLETADA',
      asistieron: 1,
      noAsistieron: 1,
      bajasAplicadas: listaDeSesion().cierre.bajasPrevistas,
    })
    servidor.use(
      http.get('*/sesiones/88/lista', ok(listaDeSesion())),
      http.put('*/sesiones/88/lista', async ({ request }) => {
        marcas = (await request.json()).marcas
        return HttpResponse.json(respuestaOk(listaDeSesion()))
      }),
      http.post('*/sesiones/88/cerrar-lista', cerrar),
      http.get('*/tutorias/mis-tutorias', ok([tutoriaDelTutor()])),
      http.get('*/tutorias/12/historial-asistencia', ok(historialAsistencia())),
    )
    const router = renderApp('/tutor/sesiones/88/lista')

    expect(await screen.findByRole('heading', { name: 'Pase de lista' })).toBeInTheDocument()
    expect(
      screen.getByText(
        'Estructuras de Datos · lunes 5 de octubre de 2026 · 10:00 – 12:00 · Edificio 2 · Aula 7',
      ),
    ).toBeInTheDocument()
    expect(screen.getByText(/Con esta inasistencia suma/)).toHaveTextContent(
      'Con esta inasistencia suma 3. Al cerrar la lista se le dará de baja automáticamente',
    )

    const andrea = screen.getByRole('group', { name: 'Asistencia de Andrea Morales Pineda' })
    await userEvent.click(within(andrea).getByRole('radio', { name: 'No asistió' }))
    await waitFor(() => expect(marcas).toEqual([{ matricula: 'S23016620', asistio: false }]))

    await userEvent.click(screen.getByRole('button', { name: 'Marcar a todos: asistió' }))
    await waitFor(() =>
      expect(marcas).toEqual([
        { matricula: 'S23016620', asistio: true },
        { matricula: 'S23017731', asistio: true },
      ]),
    )

    await userEvent.click(screen.getByRole('button', { name: 'Cerrar pase de lista' }))
    const modal = screen.getByRole('dialog', { name: '¿Cerrar el pase de lista?' })
    expect(within(modal).getByText('Se aplicará 1 baja automática')).toBeInTheDocument()
    expect(within(modal).getByText('Mariana López Herrera')).toBeInTheDocument()
    await userEvent.click(within(modal).getByRole('button', { name: 'Sí, cerrar lista' }))

    await waitFor(() => expect(router.state.location.pathname).toBe('/tutor/historial'))
    expect(cierre.llamadas).toBe(1)
    expect(await screen.findByText('Lista del lunes 5 de octubre cerrada.')).toBeInTheDocument()
    expect(
      screen.getByText(/Se aplicó la baja automática a Mariana López Herrera/),
    ).toBeInTheDocument()

    // El aviso sale del historial del navegador (no reaparece al recargar ni con atras y
    // adelante), pero sigue visible y la URL conserva la tutoria elegida.
    await waitFor(() => expect(router.state.location.state).toBeNull())
    expect(router.state.location.search).toBe('?tutoria=12')
    expect(screen.getByText('Lista del lunes 5 de octubre cerrada.')).toBeInTheDocument()
  })

  it('no deja cerrar si faltan marcas', async () => {
    servidor.use(
      http.get(
        '*/sesiones/88/lista',
        ok(
          listaDeSesion({
            cierre: {
              todosMarcados: false,
              sesionIniciada: true,
              noCancelada: true,
              puedeCerrar: false,
              bajasPrevistas: [],
            },
          }),
        ),
      ),
    )
    renderApp('/tutor/sesiones/88/lista')

    expect(await screen.findByText('Todos los tutorados tienen marca')).toHaveTextContent(
      'pendiente',
    )
    expect(screen.getByRole('button', { name: 'Cerrar pase de lista' })).toBeDisabled()
  })

  it('muestra una lista cerrada en solo lectura', async () => {
    servidor.use(
      http.get(
        '*/sesiones/80/lista',
        ok(listaDeSesion({ sesion: sesion({ idSesion: 80, estado: 'COMPLETADA' }) })),
      ),
    )
    renderApp('/tutor/sesiones/80/lista')

    expect(await screen.findByText('Lista cerrada')).toBeInTheDocument()
    expect(screen.queryByRole('radio')).not.toBeInTheDocument()
    expect(screen.getByText('Asistió')).toBeInTheDocument()
    expect(screen.getByText('No asistió')).toBeInTheDocument()
  })
})

describe('Historial de asistencia (14)', () => {
  it('elige la primera tutoria y muestra indicadores y la matriz', async () => {
    servidor.use(
      http.get(
        '*/tutorias/mis-tutorias',
        ok([tutoriaDelTutor({ idTutoria: 5, estado: 'INACTIVA' }), tutoriaDelTutor()]),
      ),
      http.get('*/tutorias/12/historial-asistencia', ok(historialAsistencia())),
    )
    const router = renderApp('/tutor/historial')

    await waitFor(() => expect(router.state.location.search).toBe('?tutoria=12'))
    expect(await screen.findByText('75 %')).toBeInTheDocument()
    expect(screen.getByText('3 de 4 marcas')).toBeInTheDocument()

    const filas = within(screen.getByRole('table')).getAllByRole('row')
    const andrea = within(filas[1])
    expect(andrea.getByText('Aún no estaba inscrito')).toBeInTheDocument()
    expect(andrea.getByText('Asistió')).toBeInTheDocument()
    const mariana = within(filas[2])
    expect(mariana.getByText('Baja automática · 5 oct')).toBeInTheDocument()
    expect(mariana.getByText('Inasistencia que causó la baja')).toBeInTheDocument()
    expect(mariana.getByText('Sesión cancelada: no cuenta')).toBeInTheDocument()
  })
})
