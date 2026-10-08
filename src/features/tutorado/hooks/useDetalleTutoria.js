import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { inscripcionesApi } from '@/api/inscripciones'
import { clavesInscripciones, clavesTutorias } from '@/api/queryKeys'
import { tutoriasApi } from '@/api/tutorias'
import { ejecutarMutacion } from '@/utils/ejecutarMutacion'

// Detalle de una tutoria para el tutorado (pantallas 04 a 06): la tutoria con su panel de
// inscripcion, su semana y las acciones de inscribirse y darse de baja.
export const useDetalleTutoria = (idTutoria) => {
  const queryClient = useQueryClient()

  const tutoriaQuery = useQuery({
    queryKey: clavesTutorias.detalle(idTutoria),
    queryFn: ({ signal }) => tutoriasApi.detalle(idTutoria, { signal }),
    enabled: Boolean(idTutoria),
  })

  // "Tu semana" es informativo: si falla, el panel se oculta sin bloquear la pantalla.
  const semanaQuery = useQuery({
    queryKey: clavesInscripciones.semana(),
    queryFn: ({ signal }) => inscripcionesApi.semana({ signal }),
  })

  const invalidar = () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: clavesTutorias.todas }),
      queryClient.invalidateQueries({ queryKey: clavesInscripciones.todas }),
    ])

  const inscribirseM = useMutation({
    mutationFn: () => inscripcionesApi.inscribirse(idTutoria),
    onSuccess: invalidar,
  })
  const bajaM = useMutation({
    mutationFn: () => inscripcionesApi.darseDeBaja(idTutoria),
    onSuccess: invalidar,
  })

  return {
    tutoria: tutoriaQuery.data ?? null,
    semana: Array.isArray(semanaQuery.data) ? semanaQuery.data : null,
    isLoading: tutoriaQuery.isPending,
    error: tutoriaQuery.error?.message ?? '',
    isSubmitting: inscribirseM.isPending || bajaM.isPending,
    inscribirse: () => ejecutarMutacion(inscribirseM, undefined, 'Inscripción confirmada.'),
    darseDeBaja: () => ejecutarMutacion(bajaM, undefined, 'Te diste de baja de la tutoría.'),
  }
}
