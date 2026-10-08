import { useQuery } from '@tanstack/react-query'
import { clavesTutorias } from '@/api/legacy/queryKeys'
import { tutoriasApi } from '@/api/legacy/tutorias'

export const useTutoriasExplorar = () => {
  const { data, isPending, error, refetch } = useQuery({
    queryKey: clavesTutorias.disponibles(),
    queryFn: ({ signal }) => tutoriasApi.disponibles({ signal }),
  })

  return {
    tutorias: data ?? [],
    isLoading: isPending,
    error: error?.message ?? '',
    refetch,
  }
}
