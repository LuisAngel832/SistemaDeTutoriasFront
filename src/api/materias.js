import { api, conParametros } from './client'

// Experiencias Educativas: { idMateria, nombre, nrc, tutoriasActivas }.
export const materiasApi = {
  // `q` busca en el nombre o por NRC exacto.
  listar: ({ q } = {}, opciones) => api.get(conParametros('/materias', { q }), opciones),

  crear: ({ nombre, nrc }) => api.post('/materias', { nombre, nrc }),

  actualizar: (idMateria, { nombre, nrc }) => api.put(`/materias/${idMateria}`, { nombre, nrc }),

  eliminar: (idMateria) => api.delete(`/materias/${idMateria}`),
}
