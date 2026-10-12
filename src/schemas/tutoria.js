import { z } from 'zod'
import { DIAS_HABILES } from '@/constants/horarios'
import { MAX_CARACTERES_TEMA, MAX_TEMAS } from '@/constants/tutoria'

// Los selects entregan strings; el esquema los convierte a los numeros que espera el backend.
const seleccionNumerica = (mensaje) => z.string().min(1, mensaje).transform(Number)

const DIAS_VALIDOS = DIAS_HABILES.map((dia) => dia.key)

const horarioDeTutoria = z
  .object({
    idHorario: z.number().nullable().optional(),
    dia: z.enum(DIAS_VALIDOS, { error: 'Elige el día' }),
    horaInicio: z.string().min(1, 'Indica la hora de inicio'),
    horaFin: z.string().min(1, 'Indica la hora de fin'),
    temas: z
      .array(
        z
          .string()
          .trim()
          .min(1)
          .max(
            MAX_CARACTERES_TEMA,
            `Cada tema puede tener hasta ${MAX_CARACTERES_TEMA} caracteres`,
          ),
      )
      .max(MAX_TEMAS, `Puedes agregar hasta ${MAX_TEMAS} temas por horario`)
      .default([]),
  })
  .refine((horario) => horario.horaInicio < horario.horaFin, {
    path: ['horaFin'],
    message: 'La hora de fin debe ser posterior a la de inicio',
  })
  .refine(
    (horario) =>
      new Set(horario.temas.map((tema) => tema.toLowerCase())).size === horario.temas.length,
    { path: ['temas'], message: 'Hay temas repetidos en este horario' },
  )

// Dos horarios del mismo dia se traslapan si uno empieza antes de que termine el otro; los
// contiguos (10:00-12:00 y 12:00-14:00) no chocan (RN-1).
const seTraslapan = (a, b) =>
  a.dia === b.dia && a.horaInicio < b.horaFin && b.horaInicio < a.horaFin

export const formularioTutoriaSchema = z
  .object({
    idMateria: seleccionNumerica('Elige la Experiencia Educativa'),
    edificio: seleccionNumerica('Elige el edificio'),
    aula: seleccionNumerica('Elige el aula'),
    horarios: z.array(horarioDeTutoria).min(1, 'Agrega al menos un horario'),
  })
  .superRefine((datos, ctx) => {
    datos.horarios.forEach((horario, indice) => {
      const anterior = datos.horarios.findIndex(
        (otro, otroIndice) => otroIndice < indice && seTraslapan(otro, horario),
      )
      if (anterior >= 0) {
        ctx.addIssue({
          code: 'custom',
          path: ['horarios', indice, 'horaInicio'],
          message: `Se traslapa con el horario ${anterior + 1}`,
        })
      }
    })
  })

// Body de POST /tutorias (crear) o PUT /tutorias/{id} (editar, sin la EE).
export const aPayloadTutoria = (datos, { editar = false } = {}) => ({
  ...(editar ? {} : { idMateria: datos.idMateria }),
  edificio: datos.edificio,
  aula: datos.aula,
  horarios: datos.horarios.map(({ idHorario, dia, horaInicio, horaFin, temas }) => ({
    ...(editar && idHorario != null ? { idHorario } : {}),
    dia,
    horaInicio,
    horaFin,
    temas,
  })),
})
