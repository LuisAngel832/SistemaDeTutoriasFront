export const ESTADOS = ['PROGRAMADA', 'EN_CURSO', 'COMPLETADA', 'CANCELADA']

export const filterTutorias = (tutorias, { search, estado }) => {
  const normalizedSearch = search.trim().toLowerCase()

  return tutorias.filter((tutoria) => {
    if (estado && tutoria.estado !== estado) return false

    if (normalizedSearch) {
      const materia = tutoria.materia?.nombreMateria?.toLowerCase() || ''
      if (!materia.includes(normalizedSearch)) return false
    }

    return true
  })
}
