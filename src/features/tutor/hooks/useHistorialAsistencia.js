import { useQuery } from '@tanstack/react-query'
import { clavesTutorias } from '@/api/queryKeys'
import { tutoriasApi } from '@/api/tutorias'

// Historial de asistencia (pantalla 14): todas las tutorias del tutor (tambien las inactivas)
// para el selector y la matriz de la tutoria elegida.
export const useHistorialAsistencia = (idTutoria) => {
  const tutoriasQuery = useQuery({
    queryKey: clavesTutorias.mias('TODAS'),
    queryFn: ({ signal }) => tutoriasApi.mias({ estado: 'TODAS' }, { signal }),
  })
  const historialQuery = useQuery({
    queryKey: clavesTutorias.historial(idTutoria),
    queryFn: ({ signal }) => tutoriasApi.historialAsistencia(idTutoria, { signal }),
    enabled: Boolean(idTutoria),
  })

  return {
    tutorias: Array.isArray(tutoriasQuery.data) ? tutoriasQuery.data : [],
    historial: historialQuery.data ?? null,
    cargandoTutorias: tutoriasQuery.isPending,
    cargandoHistorial: Boolean(idTutoria) && historialQuery.isPending,
    error: tutoriasQuery.error?.message || historialQuery.error?.message || '',
  }
}
