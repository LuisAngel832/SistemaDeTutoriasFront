// Datos de prueba con la forma de las respuestas de la API (ejemplos de API.md y de los
// mockups). Las fabricas aceptan cambios para cada caso: tutoria({ estado: 'INACTIVA' }).

export const USUARIOS = {
  tutorado: {
    matricula: 'S23014587',
    nombre: 'Valeria',
    apellidos: 'Mendoza Cruz',
    correo: 'zS23014587@estudiantes.uv.mx',
    rol: 'TUTORADO',
    proveedor: 'MICROSOFT',
  },
  tutor: {
    matricula: 'S21009342',
    nombre: 'Rocío',
    apellidos: 'Hernández Aguilar',
    correo: 'zS21009342@estudiantes.uv.mx',
    rol: 'TUTOR',
    proveedor: 'MICROSOFT',
  },
  admin: {
    matricula: '25480',
    nombre: 'Adriana',
    apellidos: 'Salas Ortega',
    correo: 'asalas@uv.mx',
    rol: 'ADMIN',
    proveedor: 'MICROSOFT',
  },
}

export const tutor = {
  matricula: 'S21009342',
  nombre: 'Rocío',
  apellidos: 'Hernández Aguilar',
  nombreCompleto: 'Rocío Hernández Aguilar',
}

export const cupo = (ocupados, maximo = 7) => ({ ocupados, maximo, disponibles: maximo - ocupados })

export const horario = (idHorario, dia, horaInicio, horaFin, temas) => ({
  idHorario,
  dia,
  horaInicio,
  horaFin,
  estado: 'ACTIVO',
  ...(temas ? { temas } : {}),
})

export const tutoriaResumen = (cambios = {}) => ({
  idTutoria: 12,
  materia: { idMateria: 5, nombre: 'Estructuras de Datos', nrc: 48215 },
  tutor,
  edificio: 2,
  aula: 7,
  estado: 'ACTIVA',
  horarios: [horario(31, 'LUNES', '10:00', '12:00'), horario(32, 'MIERCOLES', '10:00', '12:00')],
  cupo: cupo(4),
  ...cambios,
})

export const tutoriaExplorar = (cambios = {}) => ({ ...tutoriaResumen(), choques: [], ...cambios })

export const choqueBasesDeDatos = {
  dia: 'JUEVES',
  horaInicio: '17:00',
  horaFin: '19:00',
  conTutoria: { idTutoria: 7, materia: 'Bases de Datos', horaInicio: '16:00', horaFin: '18:00' },
}

export const proximaSesion = {
  idHorario: 32,
  fecha: '2026-10-07',
  dia: 'MIERCOLES',
  horaInicio: '10:00',
  horaFin: '12:00',
  recordatorioA: '08:00',
}

export const panelTutorado = (cambios = {}) => ({
  estado: 'CON_LUGAR',
  puedeInscribirse: true,
  choques: [],
  inscripcion: null,
  ...cambios,
})

export const detalleTutoria = (cambios = {}) => ({
  ...tutoriaResumen(),
  horarios: [
    horario(31, 'LUNES', '10:00', '12:00', [
      { idTema: 101, tema: 'Listas enlazadas' },
      { idTema: 102, tema: 'Pilas y colas' },
      { idTema: 103, tema: 'Recursividad' },
    ]),
    horario(32, 'MIERCOLES', '10:00', '12:00', [
      { idTema: 104, tema: 'Árboles binarios de búsqueda' },
      { idTema: 105, tema: 'Recorridos de árboles' },
      { idTema: 106, tema: 'Montículos' },
    ]),
  ],
  proximaSesion,
  esDueno: false,
  panelTutorado: panelTutorado(),
  ...cambios,
})

export const comentarios = [
  {
    idComentario: 15,
    matricula: 'S23011873',
    nombreCompleto: 'Diego Ramírez Soto',
    comentario: '¿Podríamos repasar la notación Big-O antes del primer parcial?',
    fechaComentario: '2026-10-04T19:22:00-06:00',
    esMio: false,
  },
  {
    idComentario: 14,
    matricula: 'S23016620',
    nombreCompleto: 'Andrea Morales Pineda',
    comentario: 'Me ayudaría ver un ejemplo de árbol AVL implementado en Java.',
    fechaComentario: '2026-10-03T10:00:00-06:00',
    esMio: false,
  },
]

export const semana = [
  { dia: 'MARTES', horaInicio: '16:00', horaFin: '18:00', idTutoria: 7, materia: 'Bases de Datos' },
  { dia: 'JUEVES', horaInicio: '16:00', horaFin: '18:00', idTutoria: 7, materia: 'Bases de Datos' },
  {
    dia: 'VIERNES',
    horaInicio: '08:00',
    horaFin: '10:00',
    idTutoria: 3,
    materia: 'Álgebra Lineal',
  },
]

export const basesDeDatos = (cambios = {}) =>
  tutoriaResumen({
    idTutoria: 7,
    materia: { idMateria: 2, nombre: 'Bases de Datos', nrc: 48241 },
    tutor: {
      matricula: 'S21004455',
      nombre: 'Jorge',
      apellidos: 'Castillo Rivera',
      nombreCompleto: 'Jorge Castillo Rivera',
    },
    edificio: 1,
    aula: 9,
    horarios: [horario(21, 'MARTES', '16:00', '18:00'), horario(22, 'JUEVES', '16:00', '18:00')],
    cupo: cupo(6),
    ...cambios,
  })

export const misInscripciones = () => ({
  proximaSesion: {
    idTutoria: 7,
    materia: 'Bases de Datos',
    fecha: '2026-10-06',
    dia: 'MARTES',
    horaInicio: '16:00',
    horaFin: '18:00',
    edificio: 1,
    aula: 9,
    temas: ['Normalización', 'Consultas con JOIN', 'Índices'],
    recordatorioA: '14:00',
  },
  activas: [
    {
      tutoria: tutoriaResumen(),
      inscripcion: { estado: 'ACTIVA', fechaInscripcion: '2026-10-05T09:14:00-06:00', nueva: true },
      inasistencias: 0,
      inasistenciasPermitidas: 2,
      proximaSesion: {
        fecha: '2026-10-07',
        dia: 'MIERCOLES',
        horaInicio: '10:00',
        horaFin: '12:00',
        primera: true,
      },
    },
    {
      tutoria: basesDeDatos(),
      inscripcion: {
        estado: 'ACTIVA',
        fechaInscripcion: '2026-08-26T08:30:00-06:00',
        nueva: false,
      },
      inasistencias: 1,
      inasistenciasPermitidas: 2,
      proximaSesion: {
        fecha: '2026-10-06',
        dia: 'MARTES',
        horaInicio: '16:00',
        horaFin: '18:00',
        primera: false,
      },
    },
  ],
  anteriores: [
    {
      tutoria: tutoriaResumen({
        idTutoria: 9,
        materia: { idMateria: 8, nombre: 'Matemáticas Discretas', nrc: 47731 },
        horarios: [
          horario(41, 'LUNES', '12:00', '14:00'),
          horario(42, 'MIERCOLES', '12:00', '14:00'),
        ],
      }),
      inscripcion: {
        estado: 'BAJA_AUTOMATICA',
        fechaInscripcion: '2026-08-24T10:00:00-06:00',
        fechaBaja: '2026-09-28T14:05:00-06:00',
      },
      inasistencias: 3,
    },
    {
      tutoria: tutoriaResumen({
        idTutoria: 13,
        materia: { idMateria: 6, nombre: 'Fundamentos de Programación', nrc: 48230 },
        horarios: [
          horario(51, 'MARTES', '12:00', '14:00'),
          horario(52, 'JUEVES', '12:00', '14:00'),
        ],
      }),
      inscripcion: {
        estado: 'BAJA',
        fechaInscripcion: '2026-08-20T10:00:00-06:00',
        fechaBaja: '2026-09-02T09:00:00-06:00',
      },
      inasistencias: 0,
    },
  ],
})

export const miAsistencia = (cambios = {}) => ({
  tutoria: {
    ...basesDeDatos(),
    horarios: [
      horario(21, 'MARTES', '16:00', '18:00', [
        { idTema: 201, tema: 'Normalización' },
        { idTema: 202, tema: 'Consultas con JOIN' },
      ]),
      horario(22, 'JUEVES', '16:00', '18:00', [{ idTema: 203, tema: 'Subconsultas' }]),
    ],
  },
  inscripcion: { estado: 'ACTIVA', fechaInscripcion: '2026-08-26T08:30:00-06:00', fechaBaja: null },
  resumen: {
    inasistencias: 1,
    inasistenciasPermitidas: 2,
    sesionesConAsistencia: 9,
    sesionesCanceladas: 1,
  },
  proximaSesion: {
    fecha: '2026-10-06',
    dia: 'MARTES',
    horaInicio: '16:00',
    horaFin: '18:00',
    edificio: 1,
    aula: 9,
    recordatorioA: '14:00',
  },
  historial: [
    {
      idSesion: null,
      fecha: '2026-10-06',
      dia: 'MARTES',
      horaInicio: '16:00',
      horaFin: '18:00',
      estadoSesion: 'PROGRAMADA',
      miAsistencia: 'PENDIENTE',
    },
    {
      idSesion: 61,
      fecha: '2026-10-01',
      dia: 'JUEVES',
      horaInicio: '16:00',
      horaFin: '18:00',
      estadoSesion: 'COMPLETADA',
      miAsistencia: 'ASISTIO',
    },
    {
      idSesion: 60,
      fecha: '2026-09-29',
      dia: 'MARTES',
      horaInicio: '16:00',
      horaFin: '18:00',
      estadoSesion: 'COMPLETADA',
      miAsistencia: 'NO_ASISTIO',
    },
    {
      idSesion: 59,
      fecha: '2026-09-24',
      dia: 'JUEVES',
      horaInicio: '16:00',
      horaFin: '18:00',
      estadoSesion: 'CANCELADA',
      miAsistencia: 'NO_CUENTA',
    },
  ],
  ...cambios,
})

export const sesion = (cambios = {}) => ({
  idSesion: 88,
  idHorario: 31,
  idTutoria: 12,
  materia: 'Estructuras de Datos',
  fecha: '2026-10-05',
  dia: 'LUNES',
  horaInicio: '10:00',
  horaFin: '12:00',
  edificio: 2,
  aula: 7,
  estado: 'LISTA_ABIERTA',
  inscritos: 5,
  marcados: 5,
  asistieron: 4,
  recordatorioA: '08:00',
  terminada: true,
  acciones: { abrirLista: false, cerrarLista: true, cancelar: false },
  ...cambios,
})

export const sesionProgramada = (cambios = {}) =>
  sesion({
    idSesion: null,
    idHorario: 61,
    idTutoria: 15,
    materia: 'Programación Web',
    horaInicio: '16:00',
    horaFin: '18:00',
    aula: 11,
    estado: 'PROGRAMADA',
    inscritos: 3,
    marcados: 0,
    asistieron: 0,
    recordatorioA: '14:00',
    terminada: false,
    acciones: { abrirLista: false, cerrarLista: false, cancelar: true },
    ...cambios,
  })

export const sesionesHoy = (cambios = {}) => ({
  fecha: '2026-10-05',
  sesiones: [sesion(), sesionProgramada()],
  listasSinCerrar: [],
  ...cambios,
})

export const tutoriaDelTutor = (cambios = {}) => ({
  ...tutoriaResumen({ cupo: cupo(5) }),
  proximaSesion: { fecha: '2026-10-07', dia: 'MIERCOLES', horaInicio: '10:00', horaFin: '12:00' },
  tutoradosEnRiesgo: 1,
  ...cambios,
})

export const inscritos = () => ({
  cupo: cupo(5),
  inscritos: [
    inscrito('S23016620', 'Andrea Morales Pineda', 0),
    inscrito('S23011873', 'Diego Ramírez Soto', 1),
    inscrito('S23017731', 'Mariana López Herrera', 2),
  ],
})

function inscrito(matricula, nombreCompleto, inasistencias) {
  return {
    matricula,
    nombreCompleto,
    correo: `z${matricula}@estudiantes.uv.mx`,
    fechaInscripcion: '2026-08-25T11:00:00-06:00',
    inasistencias,
    enRiesgo: inasistencias === 2,
  }
}

export const sesionesDeTutoria = () => [
  sesion({
    idSesion: null,
    fecha: '2026-10-07',
    dia: 'MIERCOLES',
    idHorario: 32,
    estado: 'PROGRAMADA',
    marcados: 0,
    asistieron: 0,
    terminada: false,
    acciones: { abrirLista: false, cerrarLista: false, cancelar: true },
  }),
  sesion(),
  sesion({
    idSesion: 80,
    fecha: '2026-09-30',
    dia: 'MIERCOLES',
    idHorario: 32,
    estado: 'COMPLETADA',
    acciones: { abrirLista: false, cerrarLista: false, cancelar: false },
  }),
  sesion({
    idSesion: 74,
    fecha: '2026-09-23',
    dia: 'MIERCOLES',
    idHorario: 32,
    estado: 'CANCELADA',
    marcados: 0,
    asistieron: 0,
    acciones: { abrirLista: false, cerrarLista: false, cancelar: false },
  }),
]

export const listaDeSesion = (cambios = {}) => ({
  sesion: sesion(),
  tutorados: [
    {
      matricula: 'S23016620',
      nombreCompleto: 'Andrea Morales Pineda',
      inasistenciasPrevias: 0,
      asistio: true,
      causaraBaja: false,
    },
    {
      matricula: 'S23017731',
      nombreCompleto: 'Mariana López Herrera',
      inasistenciasPrevias: 2,
      asistio: false,
      causaraBaja: true,
    },
  ],
  resumen: { inscritos: 2, marcados: 2, asistieron: 1, noAsistieron: 1, sinMarca: 0 },
  cierre: {
    todosMarcados: true,
    sesionIniciada: true,
    noCancelada: true,
    puedeCerrar: true,
    bajasPrevistas: [
      { matricula: 'S23017731', nombreCompleto: 'Mariana López Herrera', inasistencias: 3 },
    ],
  },
  ...cambios,
})

export const historialAsistencia = () => ({
  tutoria: {
    idTutoria: 12,
    materia: 'Estructuras de Datos',
    edificio: 2,
    aula: 7,
    horarios: [
      { dia: 'LUNES', horaInicio: '10:00', horaFin: '12:00' },
      { dia: 'MIERCOLES', horaInicio: '10:00', horaFin: '12:00' },
    ],
    cupo: cupo(4),
  },
  resumen: {
    sesionesCompletadas: 2,
    sesionesCanceladas: 1,
    marcasAsistio: 3,
    marcasTotales: 4,
    asistenciaPct: 75,
    bajasAutomaticas: 1,
  },
  sesiones: [
    { idSesion: 70, fecha: '2026-09-07', dia: 'LUNES', estado: 'COMPLETADA' },
    { idSesion: 74, fecha: '2026-09-23', dia: 'MIERCOLES', estado: 'CANCELADA' },
    { idSesion: 88, fecha: '2026-10-05', dia: 'LUNES', estado: 'COMPLETADA' },
  ],
  tutorados: [
    {
      matricula: 'S23016620',
      nombreCompleto: 'Andrea Morales Pineda',
      estadoInscripcion: 'ACTIVA',
      fechaInscripcion: '2026-09-10T10:00:00-06:00',
      fechaBaja: null,
      marcas: { 70: null, 74: null, 88: true },
      idSesionBaja: null,
      asistio: 1,
      falto: 0,
    },
    {
      matricula: 'S23017731',
      nombreCompleto: 'Mariana López Herrera',
      estadoInscripcion: 'BAJA_AUTOMATICA',
      fechaInscripcion: '2026-08-26T08:30:00-06:00',
      fechaBaja: '2026-10-05T12:10:00-06:00',
      marcas: { 70: true, 74: null, 88: false },
      idSesionBaja: 88,
      asistio: 1,
      falto: 1,
    },
  ],
})

export const materias = [
  { idMateria: 1, nombre: 'Álgebra Lineal', nrc: 47702, tutoriasActivas: 1 },
  { idMateria: 13, nombre: 'Redes de Computadoras', nrc: 52310, tutoriasActivas: 0 },
]

export const edificios = [
  { edificio: 1, aulas: [1, 2, 3, 10] },
  { edificio: 2, aulas: [2, 4, 7] },
]

export const resumenAdmin = {
  tutoriasActivas: 11,
  inscripcionesActivas: 46,
  lugaresDisponibles: 31,
  lugaresTotales: 77,
  bajasAutomaticas: 2,
}

export const tutoriaAdmin = (cambios = {}) => ({
  ...tutoriaResumen(),
  asistenciaPct: 86,
  ...cambios,
})

export const tutores = [
  tutor,
  {
    matricula: 'S21004455',
    nombre: 'Jorge',
    apellidos: 'Castillo Rivera',
    nombreCompleto: 'Jorge Castillo Rivera',
  },
]
