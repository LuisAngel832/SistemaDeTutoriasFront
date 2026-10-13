import { api } from './client'
import { esquemas } from './esquemas'

// Una sesion virtual (sin fila en BD) se identifica por idHorario + fecha; al abrir el pase de
// lista o cancelarla el backend crea la sesion y devuelve su idSesion.
export const sesionesApi = {
  // { fecha, sesiones, listasSinCerrar }
  hoy: (opciones) => api.get('/sesiones/hoy', { ...opciones, esquema: esquemas.sesionesHoy }),

  // Devuelve la lista (igual que `lista`).
  abrirLista: ({ idHorario, fecha }) =>
    api.post('/sesiones/abrir-lista', { idHorario, fecha }, { esquema: esquemas.listaDeSesion }),

  cancelar: ({ idHorario, fecha }) => api.post('/sesiones/cancelar', { idHorario, fecha }),

  // { sesion, tutorados, resumen, cierre }
  lista: (idSesion, opciones) =>
    api.get(`/sesiones/${idSesion}/lista`, { ...opciones, esquema: esquemas.listaDeSesion }),

  // Actualizacion parcial: marcas = [{ matricula, asistio }]. Devuelve la lista actualizada.
  guardarMarcas: (idSesion, marcas) =>
    api.put(`/sesiones/${idSesion}/lista`, { marcas }, { esquema: esquemas.listaDeSesion }),

  // { idSesion, estado, asistieron, noAsistieron, bajasAplicadas }
  cerrarLista: (idSesion) =>
    api.post(`/sesiones/${idSesion}/cerrar-lista`, undefined, { esquema: esquemas.cierreDeLista }),
}
