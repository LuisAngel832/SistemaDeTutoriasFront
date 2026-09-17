import { tutoriasApi } from '../api/tutorias'
import { useRecurso } from './useRecurso'

export const useTutoriasExplorar = () => {
  const { datos: tutorias, isLoading, error, recargar } = useRecurso(tutoriasApi.disponibles, [])

  return { tutorias, isLoading, error, refetch: recargar }
}
