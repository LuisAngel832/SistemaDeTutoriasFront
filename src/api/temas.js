import { api } from './client'

export const temasApi = {
  crear: ({ idTutoria, tema }) => api.post('/temas', { idTutoria: Number(idTutoria), tema }),

  eliminar: (idTema) => api.delete(`/temas/${idTema}`),
}
