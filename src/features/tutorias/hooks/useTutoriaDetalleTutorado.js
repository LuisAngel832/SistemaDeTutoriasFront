import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { asistenciaApi } from '@/api/asistencia'
import { clavesAsistencia, clavesTutorias } from '@/api/queryKeys'
import { tutoriasApi } from '@/api/tutorias'
import { ejecutarMutacion } from '@/utils/ejecutarMutacion'

export const useTutoriaDetalleTutorado = (id) => {
  const queryClient = useQueryClient()

  const tutoriaQuery = useQuery({
    queryKey: clavesTutorias.detalle(id),
    queryFn: ({ signal }) => tutoriasApi.detalle(id, { signal }),
    enabled: Boolean(id),
  })

  // El backend no indica si el tutorado ya esta inscrito: se busca en sus inscripciones.
  const inscripcionesQuery = useQuery({
    queryKey: clavesAsistencia.misInscripciones(),
    queryFn: ({ signal }) => asistenciaApi.misInscripciones({ signal }),
    retry: false,
  })
  const inscripcion =
    inscripcionesQuery.data?.find((item) => String(item.idTutoria) === String(id)) ?? null

  const invalidar = () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: clavesTutorias.todas }),
      queryClient.invalidateQueries({ queryKey: clavesAsistencia.todas }),
    ])

  const inscribirseM = useMutation({
    mutationFn: () => asistenciaApi.inscribirse(id),
    onSuccess: invalidar,
  })
  const cancelarM = useMutation({
    mutationFn: (idAsistencia) => asistenciaApi.cancelarInscripcion(idAsistencia),
    onSuccess: invalidar,
  })

  const cancelarInscripcion = async () => {
    const idAsistencia = inscripcion?.idAsistencia
    if (!idAsistencia) {
      return { ok: false, message: 'No tienes una inscripción para cancelar' }
    }
    return ejecutarMutacion(cancelarM, idAsistencia, 'Cancelaste tu inscripción.')
  }

  return {
    tutoria: tutoriaQuery.data ?? null,
    inscripcion,
    isLoading: tutoriaQuery.isPending,
    error: tutoriaQuery.error?.message ?? '',
    isSubmitting: inscribirseM.isPending || cancelarM.isPending,
    // El backend responde "Asistencia marcada.", que confunde al tutorado: se usa un texto propio.
    inscribirse: () => ejecutarMutacion(inscribirseM, undefined, 'Te inscribiste a la tutoría.'),
    cancelarInscripcion,
    recargar: tutoriaQuery.refetch,
  }
}
