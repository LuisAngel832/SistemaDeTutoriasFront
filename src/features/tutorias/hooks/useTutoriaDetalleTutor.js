import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { asistenciaApi } from '@/api/asistencia'
import { clavesAsistencia, clavesTutorias } from '@/api/queryKeys'
import { temasApi } from '@/api/temas'
import { tutoriasApi } from '@/api/tutorias'
import { ejecutarMutacion } from '@/utils/ejecutarMutacion'

export const useTutoriaDetalleTutor = (id) => {
  const queryClient = useQueryClient()

  const tutoriaQuery = useQuery({
    queryKey: clavesTutorias.detalle(id),
    queryFn: ({ signal }) => tutoriasApi.detalle(id, { signal }),
    enabled: Boolean(id),
  })

  // La lista de inscritos es secundaria: si falla, el detalle se sigue mostrando.
  const inscritosQuery = useQuery({
    queryKey: clavesAsistencia.inscritos(id),
    queryFn: ({ signal }) => asistenciaApi.inscritosDeTutoria(id, { signal }),
    enabled: Boolean(id),
    retry: false,
  })

  const invalidar = () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: clavesTutorias.todas }),
      queryClient.invalidateQueries({ queryKey: clavesAsistencia.inscritos(id) }),
    ])

  const actualizarTutoria = useMutation({
    mutationFn: (payload) => tutoriasApi.actualizar(id, payload),
    onSuccess: invalidar,
  })
  const cancelarTutoria = useMutation({
    mutationFn: () => tutoriasApi.cancelar(id),
    onSuccess: invalidar,
  })
  const completarTutoria = useMutation({
    mutationFn: () => tutoriasApi.completar(id),
    onSuccess: invalidar,
  })
  const crearTema = useMutation({
    mutationFn: (tema) => temasApi.crear({ idTutoria: id, tema }),
    onSuccess: invalidar,
  })
  const eliminarTema = useMutation({ mutationFn: temasApi.eliminar, onSuccess: invalidar })

  const agregarTema = async (tema) => {
    const limpio = (tema || '').trim()
    if (!limpio) return { ok: false, message: 'El tema no puede estar vacío' }
    return ejecutarMutacion(crearTema, limpio, 'Tema agregado')
  }

  const quitarTema = async (idTema) => {
    if (!idTema) return { ok: false, message: 'Tema inválido' }
    return ejecutarMutacion(eliminarTema, idTema, 'Tema eliminado')
  }

  return {
    tutoria: tutoriaQuery.data ?? null,
    inscritos: inscritosQuery.data ?? [],
    isLoading: tutoriaQuery.isPending,
    error: tutoriaQuery.error?.message ?? '',
    // Las acciones sobre la tutoria bloquean la pantalla; los temas no.
    isSubmitting:
      actualizarTutoria.isPending || cancelarTutoria.isPending || completarTutoria.isPending,
    actualizar: (payload) => ejecutarMutacion(actualizarTutoria, payload, 'Tutoría actualizada'),
    cancelar: () => ejecutarMutacion(cancelarTutoria, undefined, 'Tutoría cancelada'),
    completar: () =>
      ejecutarMutacion(completarTutoria, undefined, 'Tutoría marcada como completada'),
    agregarTema,
    quitarTema,
    recargar: tutoriaQuery.refetch,
  }
}
