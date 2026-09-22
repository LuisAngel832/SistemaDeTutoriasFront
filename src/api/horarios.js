import { api } from './client'
import { mapHorario, mapLista } from './mappers'

export const horariosApi = {
  listar: async (opciones) => mapLista(await api.get('/horario', opciones), mapHorario),

  // payload: { dia: 'Lunes', horaInicio: 'HH:mm:ss', horaFin: 'HH:mm:ss' }
  crear: (payload) => api.post('/horario', payload),

  eliminar: (idHorario) => api.delete(`/horario/${idHorario}`),
}
