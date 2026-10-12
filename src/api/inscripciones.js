import { api } from './client'

// Inscripciones del tutorado autenticado. La inscripcion es a la tutoria completa.
export const inscripcionesApi = {
  inscribirse: (idTutoria) => api.post('/inscripciones', { idTutoria: Number(idTutoria) }),

  // { proximaSesion, activas, anteriores }
  mias: (opciones) => api.get('/inscripciones', opciones),

  // Mi asistencia en una tutoria: { tutoria, inscripcion, resumen, proximaSesion, historial }
  deTutoria: (idTutoria, opciones) => api.get(`/inscripciones/tutorias/${idTutoria}`, opciones),

  darseDeBaja: (idTutoria) => api.delete(`/inscripciones/tutorias/${idTutoria}`),

  // Horarios semanales de las inscripciones activas: [{ dia, horaInicio, horaFin, idTutoria, materia }]
  semana: (opciones) => api.get('/inscripciones/semana', opciones),
}
