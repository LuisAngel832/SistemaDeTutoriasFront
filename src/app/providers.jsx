import { lazy, Suspense, useState } from 'react'
import { QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'
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
      {/* Avisos de las acciones; sonner los anuncia a los lectores de pantalla. */}
      <Toaster position="top-right" richColors closeButton toastOptions={{ duration: 5000 }} />
      {Devtools ? (
        <Suspense fallback={null}>
          <Devtools initialIsOpen={false} buttonPosition="bottom-left" />
        </Suspense>
      ) : null}
    </QueryClientProvider>
  )
}
