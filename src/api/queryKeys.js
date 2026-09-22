// Claves de las consultas en cache. Usar estas funciones evita invalidar la clave equivocada.
export const clavesTutorias = {
  todas: ['tutorias'],
  mias: () => ['tutorias', 'mias'],
  disponibles: () => ['tutorias', 'disponibles'],
  detalle: (id) => ['tutorias', 'detalle', String(id)],
}

export const clavesHorarios = {
  todos: ['horarios'],
  lista: () => ['horarios', 'lista'],
}

export const clavesMaterias = {
  lista: () => ['materias'],
}

export const clavesAsistencia = {
  todas: ['asistencia'],
  misInscripciones: () => ['asistencia', 'mis-inscripciones'],
  inscritos: (idTutoria) => ['asistencia', 'inscritos', String(idTutoria)],
}

export const clavesComentarios = {
  todos: ['comentarios'],
  deTutoria: (idTutoria) => ['comentarios', String(idTutoria)],
}
