// Rutas de la aplicacion. Usar siempre estas constantes en lugar de escribir las URLs.
export const ROUTES = {
  inicio: '/',
  login: '/login',
  registro: '/registro',
  tutor: {
    inicio: '/tutor/home',
    nuevaTutoria: '/tutor/tutorias/nueva',
    horarios: '/tutor/horarios',
    detalle: (id) => `/tutor/tutorias/${id}`,
    editar: (id) => `/tutor/tutorias/${id}/editar`,
    paseDeLista: (idSesion) => `/tutor/sesiones/${idSesion}/lista`,
    historial: (idTutoria) =>
      idTutoria ? `/tutor/historial?tutoria=${idTutoria}` : '/tutor/historial',
  },
  tutorado: {
    inicio: '/tutorado/home',
    inscripciones: '/tutorado/inscripciones',
    detalle: (id) => `/tutorado/tutorias/${id}`,
    asistencia: (idTutoria) => `/tutorado/inscripciones/${idTutoria}`,
  },
  admin: {
    inicio: '/administracion/tutorias',
    experiencias: '/administracion/experiencias',
  },
}
