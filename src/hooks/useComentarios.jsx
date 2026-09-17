import { useCallback } from 'react'
import { comentariosApi } from '../api/comentarios'
import { useRecurso } from './useRecurso'

const useComentarios = (idTutoria) => {
  const cargarComentarios = useCallback(
    async ({ signal }) => (idTutoria ? comentariosApi.deTutoria(idTutoria, { signal }) : []),
    [idTutoria],
  )

  const {
    datos: comentarios,
    isLoading,
    error,
    recargar,
    refrescar,
  } = useRecurso(cargarComentarios, [])

  const ejecutar = async (accion, mensajeExito) => {
    try {
      await accion()
      await refrescar()
      return { ok: true, message: mensajeExito }
    } catch (err) {
      return { ok: false, message: err.message }
    }
  }

  const crear = async (comentario) => {
    const texto = (comentario || '').trim()
    if (!texto) return { ok: false, message: 'El comentario no puede estar vacio' }
    return ejecutar(
      () => comentariosApi.crear({ idTutoria, comentario: texto }),
      'Comentario publicado',
    )
  }

  const eliminar = async (idComentario) => {
    if (!idComentario) return { ok: false, message: 'Comentario invalido' }
    return ejecutar(() => comentariosApi.eliminar(idComentario), 'Comentario eliminado')
  }

  return {
    comentarios,
    isLoading,
    error,
    crear,
    eliminar,
    recargar,
  }
}

export default useComentarios
