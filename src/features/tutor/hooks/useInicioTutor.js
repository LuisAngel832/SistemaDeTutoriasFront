import { useQuery } from '@tanstack/react-query'
import { clavesSesiones, clavesTutorias } from '@/api/queryKeys'
import { sesionesApi } from '@/api/sesiones'
import { tutoriasApi } from '@/api/tutorias'

// Las acciones de las sesiones de hoy dependen de la hora (ya inicio, ya termino): se
// refrescan cada minuto.
const REFRESCO_SESIONES_MS = 60_000

// Pantalla 09: sesiones de hoy y tutorias activas del tutor.
export const useInicioTutor = () => {
  const hoyQuery = useQuery({
    queryKey: clavesSesiones.hoy(),
    queryFn: ({ signal }) => sesionesApi.hoy({ signal }),
    refetchInterval: REFRESCO_SESIONES_MS,
  })
  const tutoriasQuery = useQuery({
    queryKey: clavesTutorias.mias('ACTIVA'),
    queryFn: ({ signal }) => tutoriasApi.mias({ estado: 'ACTIVA' }, { signal }),
  })

  return {
    fecha: hoyQuery.data?.fecha ?? null,
    sesiones: hoyQuery.data?.sesiones ?? [],
    listasSinCerrar: hoyQuery.data?.listasSinCerrar ?? [],
    tutorias: Array.isArray(tutoriasQuery.data) ? tutoriasQuery.data : [],
    cargandoSesiones: hoyQuery.isPending,
    cargandoTutorias: tutoriasQuery.isPending,
    error: hoyQuery.error?.message || tutoriasQuery.error?.message || '',
  }
}
