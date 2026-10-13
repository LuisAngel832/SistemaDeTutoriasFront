import * as z from 'zod/mini'

// Esquemas de las respuestas de los endpoints criticos, segun los DTO del backend
// (Shtven/TutoriasBackend, DTO/Responsive). Validan lo que, si cambia, rompe la interfaz:
// identificadores, listas que se recorren, objetos que se desestructuran y `materia`.
// Son "loose": los campos que no se nombran pasan tal cual.

// Lista que el backend puede mandar como null (List de Java sin valor): se trata como vacia.
const lista = (esquema) =>
  z.pipe(
    z.nullish(z.array(esquema)),
    z.transform((valor) => valor ?? []),
  )

const objeto = (campos = {}) => z.looseObject(campos)

// El backend manda la materia como objeto { idMateria, nombre, nrc } en las tutorias y como
// texto (solo el nombre) en sesiones, historial, proxima sesion, choques y la semana. El front
// la usa siempre como objeto.
export const materia = z.pipe(
  z.union([
    z.string(),
    objeto({ idMateria: z.optional(z.number()), nombre: z.string(), nrc: z.optional(z.number()) }),
  ]),
  z.transform((valor) =>
    typeof valor === 'string'
      ? { idMateria: null, nombre: valor, nrc: null }
      : { ...valor, idMateria: valor.idMateria ?? null, nrc: valor.nrc ?? null },
  ),
)

const horario = objeto({
  idHorario: z.number(),
  dia: z.string(),
  horaInicio: z.string(),
  horaFin: z.string(),
  // Con @JsonInclude(NON_NULL): puede no venir.
  temas: z.optional(z.array(objeto({ idTema: z.number(), tema: z.string() }))),
})

const cupo = objeto({ ocupados: z.number(), maximo: z.number(), disponibles: z.number() })

const choque = objeto({
  dia: z.string(),
  horaInicio: z.string(),
  horaFin: z.string(),
  conTutoria: objeto({ idTutoria: z.number(), materia }),
})

// ProximaSesionResponsive: todos sus campos son opcionales (NON_NULL) y puede no haber.
const proximaSesion = z.nullish(objeto({ materia: z.optional(materia) }))

// TutoriaResumenResponsive (va "desenvuelto" en explorar, detalle, mis tutorias y admin).
const camposTutoria = {
  idTutoria: z.number(),
  materia,
  tutor: z.nullish(objeto()),
  horarios: lista(horario),
  cupo,
}
const tutoriaResumen = objeto(camposTutoria)

const tutoriaDetalle = objeto({
  ...camposTutoria,
  proximaSesion,
  panelTutorado: z.nullish(objeto({ choques: lista(choque), inscripcion: z.nullish(objeto()) })),
})

const sesion = objeto({
  // null en una sesion programada que aun no existe en la base de datos.
  idSesion: z.nullable(z.number()),
  idHorario: z.number(),
  idTutoria: z.number(),
  materia,
  fecha: z.string(),
  acciones: z.nullish(objeto()),
})

const baja = objeto({ matricula: z.string() })

const listaDeSesion = objeto({
  sesion,
  tutorados: lista(objeto({ matricula: z.string(), asistio: z.nullish(z.boolean()) })),
  resumen: z.nullish(objeto()),
  cierre: z.nullish(objeto({ bajasPrevistas: lista(baja) })),
})

export const esquemas = {
  // GET /usuarios/me
  usuario: objeto({ matricula: z.string(), rol: z.string() }),
  // GET /tutorias
  explorar: lista(objeto({ ...camposTutoria, choques: lista(choque) })),
  // GET /tutorias/{id}
  detalle: tutoriaDetalle,
  // GET /tutorias/mis-tutorias
  misTutorias: lista(objeto({ ...camposTutoria, proximaSesion })),
  // GET /tutorias/{id}/sesiones
  sesionesDeTutoria: lista(sesion),
  // GET /tutorias/{id}/historial-asistencia
  historial: objeto({
    tutoria: objeto({ idTutoria: z.number(), materia, horarios: lista(horario) }),
    resumen: z.nullish(objeto()),
    sesiones: lista(objeto({ idSesion: z.number(), fecha: z.string() })),
    tutorados: lista(
      objeto({
        matricula: z.string(),
        // Map<Integer, Boolean>: { "idSesion": true | false | null }
        marcas: z.nullish(z.record(z.string(), z.nullable(z.boolean()))),
      }),
    ),
  }),
  // GET /sesiones/hoy
  sesionesHoy: objeto({ sesiones: lista(sesion), listasSinCerrar: lista(sesion) }),
  // GET y PUT /sesiones/{id}/lista, POST /sesiones/abrir-lista
  listaDeSesion,
  // POST /sesiones/{id}/cerrar-lista
  cierreDeLista: objeto({ bajasAplicadas: lista(baja) }),
  // GET /inscripciones
  misInscripciones: objeto({
    proximaSesion,
    activas: lista(objeto({ tutoria: tutoriaResumen, inscripcion: objeto(), proximaSesion })),
    anteriores: lista(objeto({ tutoria: tutoriaResumen, inscripcion: objeto() })),
  }),
  // GET /inscripciones/tutorias/{id}
  miAsistencia: objeto({
    tutoria: tutoriaDetalle,
    inscripcion: z.nullish(objeto()),
    proximaSesion,
    historial: lista(objeto({ fecha: z.string() })),
  }),
  // GET /inscripciones/semana
  semana: lista(
    objeto({
      dia: z.string(),
      horaInicio: z.string(),
      horaFin: z.string(),
      idTutoria: z.number(),
      materia,
    }),
  ),
  // GET /admin/tutorias
  tutoriasAdmin: lista(tutoriaResumen),
}
