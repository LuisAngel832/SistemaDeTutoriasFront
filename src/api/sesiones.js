import { api } from './client'

// Una sesion virtual (sin fila en BD) se identifica por idHorario + fecha; al abrir el pase de
// lista o cancelarla el backend crea la sesion y devuelve su idSesion.
export const sesionesApi = {
  // { fecha, sesiones, listasSinCerrar }
  hoy: (opciones) => api.get('/sesiones/hoy', opciones),

  // Devuelve la lista (igual que `lista`).
  abrirLista: ({ idHorario, fecha }) => api.post('/sesiones/abrir-lista', { idHorario, fecha }),

  cancelar: ({ idHorario, fecha }) => api.post('/sesiones/cancelar', { idHorario, fecha }),

  // { sesion, tutorados, resumen, cierre }
  lista: (idSesion, opciones) => api.get(`/sesiones/${idSesion}/lista`, opciones),

  // Actualizacion parcial: marcas = [{ matricula, asistio }]. Devuelve la lista actualizada.
  guardarMarcas: (idSesion, marcas) => api.put(`/sesiones/${idSesion}/lista`, { marcas }),

  // { idSesion, estado, asistieron, noAsistieron, bajasAplicadas }
  cerrarLista: (idSesion) => api.post(`/sesiones/${idSesion}/cerrar-lista`),
}
