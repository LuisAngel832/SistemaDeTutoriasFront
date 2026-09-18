import { render } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router-dom'

// Cliente aislado por prueba: sin reintentos ni cache entre casos.
export const crearClientePrueba = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
      mutations: { retry: false },
    },
  })

// Renderiza un componente con los proveedores de la app (datos del servidor y router).
export const renderConProveedores = (ui, { ruta = '/', client = crearClientePrueba() } = {}) =>
  render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={[ruta]}>{ui}</MemoryRouter>
    </QueryClientProvider>,
  )
