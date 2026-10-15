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

  // Usuarios con rol TUTOR, incluidos los pre-registrados que aun no crean su cuenta:
  // [{ matricula, nombre, apellidos, nombreCompleto }]
  tutores: (opciones) => api.get('/admin/tutores', opciones),

  // Lista de tutores autorizados: { nombre, apellidos, matricula, correo }. Solo asi alguien
  // puede crear su cuenta como TUTOR (POST /auth/signup con esta matricula y este correo).
  autorizarTutor: ({ nombre, apellidos, matricula, correo }) =>
    api.post('/admin/tutores', { nombre, apellidos, matricula, correo }),

  // Quita un pre-registro; el backend lo rechaza si la persona ya creo su cuenta.
  quitarTutor: (matricula) => api.delete(`/admin/tutores/${encodeURIComponent(matricula)}`),

  // Desactiva todas las tutorias activas. Devuelve { tutoriasDesactivadas }.
  cerrarPeriodo: () => api.post('/admin/tutorias/cierre-periodo', { confirmar: true }),
}
