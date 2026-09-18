import { useQuery } from '@tanstack/react-query'
import { asistenciaApi } from '../api/asistencia'
import { clavesAsistencia } from '../api/queryKeys'

// Inscripciones del tutorado, ya normalizadas por mapInscripcion.
export const useTutoriasTutorado = () => {
  const { data, isPending, error, refetch } = useQuery({
    queryKey: clavesAsistencia.misInscripciones(),
    queryFn: ({ signal }) => asistenciaApi.misInscripciones({ signal }),
  })

  return {
    tutorias: data ?? [],
    isLoading: isPending,
    error: error?.message ?? '',
    refetch,
  }
}
