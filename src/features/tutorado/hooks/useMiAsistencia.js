import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { inscripcionesApi } from '@/api/inscripciones'
import { clavesInscripciones, clavesTutorias } from '@/api/queryKeys'
import { ejecutarMutacion } from '@/utils/ejecutarMutacion'

// Mi asistencia en una tutoria (pantalla 08): inscripcion mas reciente, resumen e historial.
export const useMiAsistencia = (idTutoria) => {
  const queryClient = useQueryClient()

  const { data, isPending, error } = useQuery({
    queryKey: clavesInscripciones.deTutoria(idTutoria),
    queryFn: ({ signal }) => inscripcionesApi.deTutoria(idTutoria, { signal }),
    enabled: Boolean(idTutoria),
  })

  const bajaM = useMutation({
    mutationFn: () => inscripcionesApi.darseDeBaja(idTutoria),
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: clavesInscripciones.todas }),
        queryClient.invalidateQueries({ queryKey: clavesTutorias.todas }),
      ]),
  })

  return {
    datos: data ?? null,
    isLoading: isPending,
    error: error?.message ?? '',
    isSubmitting: bajaM.isPending,
    darseDeBaja: () => ejecutarMutacion(bajaM, undefined, 'Te diste de baja de la tutoría.'),
  }
}
