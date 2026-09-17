import { asistenciaApi } from '../api/asistencia'
import { useRecurso } from './useRecurso'

// Inscripciones del tutorado, ya normalizadas por mapInscripcion.
export const useTutoriasTutorado = () => {
  const {
    datos: tutorias,
    isLoading,
    error,
    recargar,
  } = useRecurso(asistenciaApi.misInscripciones, [])

  return { tutorias, isLoading, error, refetch: recargar }
}
