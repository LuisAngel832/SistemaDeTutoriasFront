// true si la tutoria es de otro tutor. Basta con una de las dos senales: `esDueno: false` del
// detalle o una matricula de tutor distinta a la de la sesion. Es solo para no ofrecer acciones
// que no le tocan: quien protege los datos es el backend (informe de pruebas, B.2.1).
export const esTutoriaAjena = (tutoria, matricula) => {
  if (!tutoria) return false
  if (tutoria.esDueno === false) return true
  const delTutor = tutoria.tutor?.matricula
  return Boolean(delTutor && matricula) && delTutor.toUpperCase() !== matricula.toUpperCase()
}

export const MENSAJE_TUTORIA_AJENA =
  'Esta tutoría la imparte otro tutor: no puedes verla ni editarla.'
