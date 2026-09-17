import { useCallback, useState } from 'react'
import { asistenciaApi } from '../api/asistencia'
import { esCancelacion } from '../api/client'
import { tutoriasApi } from '../api/tutorias'
import { useRecurso } from './useRecurso'

const DETALLE_INICIAL = { tutoria: null, inscripcion: null }

export const useTutoriaDetalleTutorado = (id) => {
  const [isSubmitting, setIsSubmitting] = useState(false)

  // El backend no indica si el tutorado ya esta inscrito: se busca en sus inscripciones.
  const cargarDetalle = useCallback(
    async ({ signal }) => {
      const [tutoria, inscripciones] = await Promise.all([
        tutoriasApi.detalle(id, { signal }),
        asistenciaApi.misInscripciones({ signal }).catch((error) => {
          if (esCancelacion(error)) throw error
          return []
        }),
      ])
      const inscripcion =
        inscripciones.find((item) => String(item.idTutoria) === String(id)) ?? null
      return { tutoria, inscripcion }
    },
    [id],
  )

  const { datos, isLoading, error, recargar, refrescar } = useRecurso(
    cargarDetalle,
    DETALLE_INICIAL,
  )

  const ejecutar = async (accion, mensajeExito) => {
    setIsSubmitting(true)
    try {
      await accion()
      await refrescar()
      return { ok: true, message: mensajeExito }
    } catch (err) {
      return { ok: false, message: err.message }
    } finally {
      setIsSubmitting(false)
    }
  }

  // El backend responde "Asistencia marcada.", que confunde al tutorado: se usa un texto propio.
  const inscribirse = () =>
    ejecutar(() => asistenciaApi.inscribirse(id), 'Te inscribiste a la tutoria.')

  const cancelarInscripcion = async () => {
    const idAsistencia = datos.inscripcion?.idAsistencia
    if (!idAsistencia) {
      return { ok: false, message: 'No tienes una inscripcion para cancelar' }
    }
    return ejecutar(
      () => asistenciaApi.cancelarInscripcion(idAsistencia),
      'Cancelaste tu inscripcion.',
    )
  }

  return {
    tutoria: datos.tutoria,
    inscripcion: datos.inscripcion,
    isLoading,
    error,
    isSubmitting,
    inscribirse,
    cancelarInscripcion,
    recargar,
  }
}
