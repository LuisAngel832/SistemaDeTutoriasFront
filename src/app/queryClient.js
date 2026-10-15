import { MutationCache, QueryCache, QueryClient } from '@tanstack/react-query'
import { RespuestaInvalidaError } from '@/api/client'
import { reportarError } from './monitoreo'

// Un 4xx no se reintenta: el backend ya dio su respuesta definitiva. Tampoco una respuesta con
// otra forma: volveria igual.
const reintentar = (intentos, error) => {
  if (error instanceof RespuestaInvalidaError) return false
  const status = error?.status ?? 0
  if (status >= 400 && status < 500) return false
  return intentos < 1
}

export const crearQueryClient = () =>
  new QueryClient({
    // Reporta los errores inesperados de cualquier consulta o mutacion. No se envian las
    // variables de las mutaciones: pueden traer datos personales.
    queryCache: new QueryCache({
      onError: (error, query) =>
        reportarError(error, { origen: 'query', extra: { clave: query.queryKey } }),
    }),
    mutationCache: new MutationCache({
      onError: (error, _variables, _contexto, mutation) =>
        reportarError(error, {
          origen: 'mutation',
          extra: { clave: mutation.options.mutationKey },
        }),
    }),
    defaultOptions: {
      queries: {
        // Volver a una pantalla no vuelve a pedir datos recientes.
        staleTime: 30_000,
        retry: reintentar,
      },
      mutations: { retry: 0 },
    },
  })
