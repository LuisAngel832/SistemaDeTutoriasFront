// Adaptan las respuestas del backend a la forma que usa el frontend.
// Toda variacion de los DTOs (nombres de ids, campos anidados) se resuelve aqui, para que
// las pantallas reciban siempre la misma estructura.

const aTexto = (valor) => (valor == null ? null : String(valor))

export const mapTema = (tema) => {
  if (tema == null || typeof tema !== 'object') {
    return { idTema: null, tema: String(tema ?? '') }
  }
  return {
    idTema: tema.idTema ?? tema.id ?? null,
    tema: tema.tema ?? tema.nombre ?? '',
  }
}

export const mapHorario = (horario) => ({
  idHorario: horario.idHorario ?? horario.id ?? horario.idHorarios ?? horario.horarioId ?? null,
  dia: horario.dia ?? '',
  horaInicio: horario.horaInicio ?? null,
  horaFin: horario.horaFin ?? null,
})

// TutoriaResponsive: { id, fecha, nombreTutor, horaInicio, horaFin, materia, edificio, aula,
// estado, temas }. No incluye idHorario.
export const mapTutoria = (tutoria) => ({
  id: tutoria.id ?? tutoria.idTutoria ?? null,
  materia: tutoria.materia ?? null,
  nombreTutor: tutoria.nombreTutor ?? tutoria.tutor ?? null,
  fecha: tutoria.fecha ?? null,
  horaInicio: tutoria.horaInicio ?? tutoria.horario?.horaInicio ?? null,
  horaFin: tutoria.horaFin ?? tutoria.horario?.horaFin ?? null,
  idHorario: tutoria.idHorario ?? tutoria.horario?.id ?? null,
  edificio: tutoria.edificio ?? null,
  aula: tutoria.aula ?? null,
  estado: tutoria.estado ?? null,
  temas: (tutoria.temas ?? []).map(mapTema),
})

// MisInscripcionResponsive: { idAsistencia, idTutoria, fecha, materia, dia, horaInicio,
// horaFin, edificio, aula, tutor, estado, asistio, calificacion }.
// Se aceptan tambien inscripciones con la tutoria anidada ({ idAsistencia, tutoria: {...} }).
export const mapInscripcion = (inscripcion) => {
  const tutoria = inscripcion.tutoria ?? inscripcion
  return {
    idAsistencia: inscripcion.idAsistencia ?? null,
    idTutoria: inscripcion.idTutoria ?? tutoria.idTutoria ?? tutoria.id ?? null,
    materia: tutoria.materia ?? null,
    nombreTutor: tutoria.nombreTutor ?? tutoria.tutor ?? tutoria.horario?.tutor?.nombre ?? null,
    fecha: tutoria.fecha ?? null,
    dia: tutoria.dia ?? null,
    horaInicio: tutoria.horaInicio ?? tutoria.horario?.horaInicio ?? null,
    horaFin: tutoria.horaFin ?? tutoria.horario?.horaFin ?? null,
    edificio: tutoria.edificio ?? null,
    aula: tutoria.aula ?? null,
    estado: tutoria.estado ?? null,
    asistio: inscripcion.asistio ?? null,
    calificacion: inscripcion.calificacion ?? null,
  }
}

// AsistenciaResponsive (inscritos de una tutoria): { idAsistencia, matricula, nombre, asistio }.
// La matricula llega como numero; se usa string para compararla con la sesion.
export const mapInscrito = (inscrito) => ({
  idAsistencia: inscrito.idAsistencia ?? null,
  matricula: aTexto(inscrito.matricula),
  nombre: inscrito.nombre ?? null,
  asistio: inscrito.asistio ?? null,
  calificacion: inscrito.calificacion ?? null,
})

export const mapComentario = (comentario) => ({
  idComentario: comentario.idComentario ?? comentario.id ?? null,
  idTutoria: comentario.idTutoria ?? null,
  matricula: aTexto(comentario.matricula),
  nombre: comentario.nombre ?? null,
  comentario: comentario.comentario ?? '',
})

export const mapMateria = (materia) => ({
  nrc: materia.nrc ?? null,
  materia: materia.materia ?? '',
})

export const mapLista = (lista, mapper) => (Array.isArray(lista) ? lista.map(mapper) : [])
