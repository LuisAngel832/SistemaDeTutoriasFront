import { api } from './client'
import { esquemas } from './esquemas'

// Inscripciones del tutorado autenticado. La inscripcion es a la tutoria completa.
export const inscripcionesApi = {
  inscribirse: (idTutoria) => api.post('/inscripciones', { idTutoria: Number(idTutoria) }),

  // { proximaSesion, activas, anteriores }
  mias: (opciones) =>
    api.get('/inscripciones', { ...opciones, esquema: esquemas.misInscripciones }),

  // Mi asistencia en una tutoria: { tutoria, inscripcion, resumen, proximaSesion, historial }
  deTutoria: (idTutoria, opciones) =>
    api.get(`/inscripciones/tutorias/${idTutoria}`, {
      ...opciones,
      esquema: esquemas.miAsistencia,
    }),

  darseDeBaja: (idTutoria) => api.delete(`/inscripciones/tutorias/${idTutoria}`),

  // Horarios semanales de las inscripciones activas: [{ dia, horaInicio, horaFin, idTutoria, materia }]
  semana: (opciones) => api.get('/inscripciones/semana', { ...opciones, esquema: esquemas.semana }),
}
