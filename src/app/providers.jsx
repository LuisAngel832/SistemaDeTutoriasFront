import { lazy, Suspense, useState } from 'react'
import { QueryClientProvider } from '@tanstack/react-query'
import { crearQueryClient } from './queryClient'

// Las herramientas de desarrollo no se incluyen en el bundle de produccion.
const Devtools = import.meta.env.DEV
  ? lazy(() =>
      import('@tanstack/react-query-devtools').then((modulo) => ({
        default: modulo.ReactQueryDevtools,
      })),
    )
  : null

// Proveedores globales de la aplicacion (cache de datos del servidor).
export const Providers = ({ client, children }) => {
  const [queryClient] = useState(() => client ?? crearQueryClient())

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {Devtools ? (
        <Suspense fallback={null}>
          <Devtools initialIsOpen={false} buttonPosition="bottom-left" />
        </Suspense>
      ) : null}
    </QueryClientProvider>
  )
}
