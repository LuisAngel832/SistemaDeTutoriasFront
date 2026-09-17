import { useCallback, useState } from 'react'
import { asistenciaApi } from '../api/asistencia'
import { esCancelacion } from '../api/client'
import { temasApi } from '../api/temas'
import { tutoriasApi } from '../api/tutorias'
import { useRecurso } from './useRecurso'

const DETALLE_INICIAL = { tutoria: null, inscritos: [] }

const useTutoriaDetalleTutor = (id) => {
  const [isSubmitting, setIsSubmitting] = useState(false)

  // La lista de inscritos es secundaria: si falla se muestra vacia y el detalle sigue visible.
  const cargarDetalle = useCallback(
    async ({ signal }) => {
      const [tutoria, inscritos] = await Promise.all([
        tutoriasApi.detalle(id, { signal }),
        asistenciaApi.inscritosDeTutoria(id, { signal }).catch((error) => {
          if (esCancelacion(error)) throw error
          return []
        }),
      ])
      return { tutoria, inscritos }
    },
    [id],
  )

  const { datos, isLoading, error, recargar, refrescar } = useRecurso(
    cargarDetalle,
    DETALLE_INICIAL,
  )

  // Ejecuta una mutacion, refresca el detalle y devuelve { ok, message } para la pantalla.
  const ejecutar = async (accion, mensajeExito, { bloquear = true } = {}) => {
    if (bloquear) setIsSubmitting(true)
    try {
      await accion()
      await refrescar()
      return { ok: true, message: mensajeExito }
    } catch (err) {
      return { ok: false, message: err.message }
    } finally {
      if (bloquear) setIsSubmitting(false)
    }
  }

  const actualizar = (payload) =>
    ejecutar(() => tutoriasApi.actualizar(id, payload), 'Tutoria actualizada')

  const cancelar = () => ejecutar(() => tutoriasApi.cancelar(id), 'Tutoria cancelada')

  const completar = () =>
    ejecutar(() => tutoriasApi.completar(id), 'Tutoria marcada como completada')

  const agregarTema = async (tema) => {
    const limpio = (tema || '').trim()
    if (!limpio) return { ok: false, message: 'El tema no puede estar vacio' }
    return ejecutar(() => temasApi.crear({ idTutoria: id, tema: limpio }), 'Tema agregado', {
      bloquear: false,
    })
  }

  const quitarTema = async (idTema) => {
    if (!idTema) return { ok: false, message: 'Tema invalido' }
    return ejecutar(() => temasApi.eliminar(idTema), 'Tema eliminado', { bloquear: false })
  }

  return {
    tutoria: datos.tutoria,
    inscritos: datos.inscritos,
    isLoading,
    error,
    isSubmitting,
    actualizar,
    cancelar,
    completar,
    agregarTema,
    quitarTema,
    recargar,
  }
}

export default useTutoriaDetalleTutor
