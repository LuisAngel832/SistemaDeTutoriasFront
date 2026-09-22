import { api } from './client'
import { mapLista, mapTutoria } from './mappers'

export const tutoriasApi = {
  misTutorias: async (opciones) =>
    mapLista(await api.get('/tutoria/mis-tutorias', opciones), mapTutoria),

  disponibles: async (opciones) =>
    mapLista(await api.get('/tutoria/disponibles', opciones), mapTutoria),

  detalle: async (id, opciones) => {
    const tutoria = await api.get(`/tutoria/${id}`, opciones)
    return tutoria ? mapTutoria(tutoria) : null
  },

  // payload: { idHorario, fecha, edificio, aula, nrc, temas: string[] }
  crear: (payload) => api.post('/tutoria', payload),

  // payload: { idHorario, fecha, edificio, aula }
  actualizar: (id, payload) => api.put(`/tutoria/${id}`, payload),

  cancelar: (id) => api.delete(`/tutoria/${id}`),

  completar: (id) => api.put(`/tutoria/completar/${id}`),
}
