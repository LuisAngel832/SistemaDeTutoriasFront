import { api } from './client'
import { mapLista, mapMateria } from './mappers'

// En la interfaz las materias se muestran como "Experiencias Educativas".
export const materiasApi = {
  listar: async (opciones) => mapLista(await api.get('/materia', opciones), mapMateria),
}
