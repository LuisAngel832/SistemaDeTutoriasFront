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
  },
  tutorado: {
    inicio: '/tutorado/home',
    inscripciones: '/tutorado/inscripciones',
    detalle: (id) => `/tutorado/tutorias/${id}`,
  },
}
