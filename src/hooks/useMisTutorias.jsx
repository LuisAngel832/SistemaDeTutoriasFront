import { useQuery } from '@tanstack/react-query'
import { clavesTutorias } from '../api/queryKeys'
import { tutoriasApi } from '../api/tutorias'

const useMisTutorias = () => {
  const { data, isPending, error, refetch } = useQuery({
    queryKey: clavesTutorias.mias(),
    queryFn: ({ signal }) => tutoriasApi.misTutorias({ signal }),
  })

  return {
    tutorias: data ?? [],
    isLoading: isPending,
    error: error?.message ?? '',
    refetch,
  }
}

export default useMisTutorias
