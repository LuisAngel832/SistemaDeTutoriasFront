// Claves de las consultas en cache. Cada dominio tiene una raiz (`todas`) para invalidar todo
// el grupo de una vez; usar estas funciones evita invalidar la clave equivocada.

export const clavesUsuario = {
  actual: () => ['usuario', 'actual'],
}

export const clavesMaterias = {
  todas: ['materias'],
  lista: (q = '') => ['materias', 'lista', q],
}

export const clavesCatalogos = {
  edificios: () => ['catalogos', 'edificios'],
}

export const clavesTutorias = {
  todas: ['tutorias'],
  explorar: (filtros = {}) => ['tutorias', 'explorar', filtros],
  detalle: (id) => ['tutorias', 'detalle', String(id)],
  mias: (estado = 'ACTIVA') => ['tutorias', 'mias', estado],
  inscritos: (id) => ['tutorias', 'inscritos', String(id)],
  sesiones: (id) => ['tutorias', 'sesiones', String(id)],
  historial: (id) => ['tutorias', 'historial', String(id)],
}

export const clavesInscripciones = {
  todas: ['inscripciones'],
  mias: () => ['inscripciones', 'mias'],
  deTutoria: (idTutoria) => ['inscripciones', 'tutoria', String(idTutoria)],
  semana: () => ['inscripciones', 'semana'],
}

export const clavesSesiones = {
  todas: ['sesiones'],
  hoy: () => ['sesiones', 'hoy'],
  lista: (idSesion) => ['sesiones', 'lista', String(idSesion)],
}

export const clavesComentarios = {
  todos: ['comentarios'],
  deTutoria: (idTutoria) => ['comentarios', String(idTutoria)],
}

export const clavesAdmin = {
  todas: ['admin'],
  resumen: (desde) => ['admin', 'resumen', desde ?? ''],
  tutorias: (filtros = {}) => ['admin', 'tutorias', filtros],
  tutores: () => ['admin', 'tutores'],
}
