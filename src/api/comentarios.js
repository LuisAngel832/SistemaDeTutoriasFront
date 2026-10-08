import { api } from './client'

// Comentarios de los tutorados por tutoria:
// { idComentario, matricula, nombreCompleto, comentario, fechaComentario, esMio }.
export const comentariosApi = {
  deTutoria: (idTutoria, opciones) => api.get(`/tutorias/${idTutoria}/comentarios`, opciones),

  publicar: (idTutoria, comentario) =>
    api.post(`/tutorias/${idTutoria}/comentarios`, { comentario }),

  eliminar: (idComentario) => api.delete(`/comentarios/${idComentario}`),
}
