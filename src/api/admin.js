import { api, conParametros } from './client'
import { esquemas } from './esquemas'

export const adminApi = {
  // { tutoriasActivas, inscripcionesActivas, lugaresDisponibles, lugaresTotales, bajasAutomaticas }
  resumen: ({ desde } = {}, opciones) =>
    api.get(conParametros('/admin/resumen', { desde }), opciones),

  // filtros: { q, matriculaTutor, estado: ACTIVA | INACTIVA | TODAS }
  tutorias: ({ q, matriculaTutor, estado } = {}, opciones) =>
    api.get(conParametros('/admin/tutorias', { q, matriculaTutor, estado }), {
      ...opciones,
      esquema: esquemas.tutoriasAdmin,
    }),

  tutores: (opciones) => api.get('/admin/tutores', opciones),

  // Desactiva todas las tutorias activas. Devuelve { tutoriasDesactivadas }.
  cerrarPeriodo: () => api.post('/admin/tutorias/cierre-periodo', { confirmar: true }),
}
