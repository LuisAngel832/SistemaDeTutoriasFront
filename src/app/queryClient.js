import { QueryClient } from '@tanstack/react-query'

// Un 4xx no se reintenta: el backend ya dio su respuesta definitiva.
const reintentar = (intentos, error) => {
  const status = error?.status ?? 0
  if (status >= 400 && status < 500) return false
  return intentos < 1
}

export const crearQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        // Volver a una pantalla no vuelve a pedir datos recientes.
        staleTime: 30_000,
        retry: reintentar,
      },
      mutations: { retry: 0 },
    },
  })
