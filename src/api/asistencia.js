import { api } from './client'
import { mapInscripcion, mapInscrito, mapLista } from './mappers'

// El backend llama "asistencia" a la inscripcion de un tutorado en una tutoria.
export const asistenciaApi = {
  inscribirse: (idTutoria) => api.post('/asistencia', { idTutoria: Number(idTutoria) }),

  cancelarInscripcion: (idAsistencia) => api.delete(`/asistencia/${idAsistencia}`),

  misInscripciones: async (opciones) =>
    mapLista(await api.get('/asistencia/mis-inscripciones', opciones), mapInscripcion),

  inscritosDeTutoria: async (idTutoria, opciones) =>
    mapLista(await api.get(`/asistencia/tutoria/${idTutoria}`, opciones), mapInscrito),

  marcarAsistencia: (idAsistencia, asistio) =>
    api.patch(`/asistencia/${idAsistencia}?asistio=${Boolean(asistio)}`),
}
