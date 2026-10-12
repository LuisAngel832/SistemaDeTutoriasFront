import { api, conParametros } from './client'

export const tutoriasApi = {
  // Explorar (tutorado). filtros: { q, dia, soloConLugar, ocultarChoques }.
  explorar: ({ q, dia, soloConLugar, ocultarChoques } = {}, opciones) =>
    api.get(conParametros('/tutorias', { q, dia, soloConLugar, ocultarChoques }), opciones),

  // Detalle con horarios y temas, proximaSesion, esDueno y panelTutorado.
  detalle: (idTutoria, opciones) => api.get(`/tutorias/${idTutoria}`, opciones),

  // Tutorias del tutor autenticado. estado: ACTIVA (default) | INACTIVA | TODAS.
  mias: ({ estado } = {}, opciones) =>
    api.get(conParametros('/tutorias/mis-tutorias', { estado }), opciones),

  // payload: { idMateria, edificio, aula, horarios: [{ dia, horaInicio, horaFin, temas }] }
  crear: (payload) => api.post('/tutorias', payload),

  // payload: { edificio, aula, horarios: [{ idHorario?, dia, horaInicio, horaFin, temas }] }
  actualizar: (idTutoria, payload) => api.put(`/tutorias/${idTutoria}`, payload),

  desactivar: (idTutoria) => api.patch(`/tutorias/${idTutoria}/estado`, { estado: 'INACTIVA' }),

  // { cupo, inscritos: [{ matricula, nombreCompleto, correo, inasistencias, enRiesgo, ... }] }
  inscritos: (idTutoria, opciones) => api.get(`/tutorias/${idTutoria}/inscritos`, opciones),

  // Sesiones registradas mas las virtuales de los proximos `dias` (0-28).
  sesiones: (idTutoria, { dias } = {}, opciones) =>
    api.get(conParametros(`/tutorias/${idTutoria}/sesiones`, { dias }), opciones),

  historialAsistencia: (idTutoria, opciones) =>
    api.get(`/tutorias/${idTutoria}/historial-asistencia`, opciones),
}
