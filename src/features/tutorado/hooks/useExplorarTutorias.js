import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { clavesTutorias } from '@/api/queryKeys'
import { tutoriasApi } from '@/api/tutorias'

// Tutorias activas para el tutorado (pantalla 03). Los filtros los aplica el backend; al
// cambiarlos se conserva la lista anterior mientras llega la nueva.
export const useExplorarTutorias = (filtros) => {
  const { data, isPending, isFetching, error } = useQuery({
    queryKey: clavesTutorias.explorar(filtros),
    queryFn: ({ signal }) => tutoriasApi.explorar(filtros, { signal }),
    placeholderData: keepPreviousData,
  })

  return {
    tutorias: Array.isArray(data) ? data : [],
    isLoading: isPending,
    actualizando: isFetching && !isPending,
    error: error?.message ?? '',
  }
}
