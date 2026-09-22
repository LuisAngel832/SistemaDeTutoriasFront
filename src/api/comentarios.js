import { api } from './client'
import { mapComentario, mapLista } from './mappers'

export const comentariosApi = {
  deTutoria: async (idTutoria, opciones) =>
    mapLista(await api.get(`/comentarios/tutoria/${idTutoria}`, opciones), mapComentario),

  crear: ({ idTutoria, comentario }) =>
    api.post('/comentarios', { idTutoria: Number(idTutoria), comentario }),

  eliminar: (idComentario) => api.delete(`/comentarios/${idComentario}`),
}
