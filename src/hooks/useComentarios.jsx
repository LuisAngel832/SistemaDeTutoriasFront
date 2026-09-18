import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { comentariosApi } from '../api/comentarios'
import { clavesComentarios } from '../api/queryKeys'
import { ejecutarMutacion } from './ejecutarMutacion'

const useComentarios = (idTutoria) => {
  const queryClient = useQueryClient()
  const invalidar = () =>
    queryClient.invalidateQueries({ queryKey: clavesComentarios.deTutoria(idTutoria) })

  const { data, isPending, error, refetch } = useQuery({
    queryKey: clavesComentarios.deTutoria(idTutoria),
    queryFn: ({ signal }) => comentariosApi.deTutoria(idTutoria, { signal }),
    enabled: Boolean(idTutoria),
  })

  const crearComentario = useMutation({
    mutationFn: (comentario) => comentariosApi.crear({ idTutoria, comentario }),
    onSuccess: invalidar,
  })
  const eliminarComentario = useMutation({
    mutationFn: comentariosApi.eliminar,
    onSuccess: invalidar,
  })

  const crear = async (comentario) => {
    const texto = (comentario || '').trim()
    if (!texto) return { ok: false, message: 'El comentario no puede estar vacío' }
    return ejecutarMutacion(crearComentario, texto, 'Comentario publicado')
  }

  const eliminar = async (idComentario) => {
    if (!idComentario) return { ok: false, message: 'Comentario inválido' }
    return ejecutarMutacion(eliminarComentario, idComentario, 'Comentario eliminado')
  }

  return {
    comentarios: data ?? [],
    isLoading: isPending,
    error: error?.message ?? '',
    crear,
    eliminar,
    recargar: refetch,
  }
}

export default useComentarios
