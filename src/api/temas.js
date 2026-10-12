import { api } from './client'

// Los temas pertenecen a un horario y se pueden editar aunque haya inscritos.
export const temasApi = {
  // Devuelve { idTema, tema }.
  agregar: (idHorario, tema) => api.post(`/horarios/${idHorario}/temas`, { tema }),

  eliminar: (idTema) => api.delete(`/temas/${idTema}`),
}
