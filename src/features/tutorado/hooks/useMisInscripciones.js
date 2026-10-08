import { useQuery } from '@tanstack/react-query'
import { inscripcionesApi } from '@/api/inscripciones'
import { clavesInscripciones } from '@/api/queryKeys'

// Mis tutorias (pantalla 07): { proximaSesion, activas, anteriores }.
export const useMisInscripciones = () => {
  const { data, isPending, error } = useQuery({
    queryKey: clavesInscripciones.mias(),
    queryFn: ({ signal }) => inscripcionesApi.mias({ signal }),
  })

  return {
    proximaSesion: data?.proximaSesion ?? null,
    activas: data?.activas ?? [],
    anteriores: data?.anteriores ?? [],
    isLoading: isPending,
    error: error?.message ?? '',
  }
}
