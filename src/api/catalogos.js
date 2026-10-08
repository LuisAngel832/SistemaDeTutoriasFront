import { api } from './client'

export const catalogosApi = {
  // [{ edificio, aulas: number[] }]
  edificios: (opciones) => api.get('/catalogos/edificios', opciones),
}
