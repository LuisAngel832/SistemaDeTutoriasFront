import { tutoriasApi } from '../api/tutorias'
import { useRecurso } from './useRecurso'

const useMisTutorias = () => {
  const { datos: tutorias, isLoading, error, recargar } = useRecurso(tutoriasApi.misTutorias, [])

  return {
    tutorias,
    isLoading,
    error,
    refetch: recargar,
  }
}

export default useMisTutorias
