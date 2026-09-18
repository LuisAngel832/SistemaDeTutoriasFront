import { z } from 'zod'
import { MAX_CARACTERES_TEMA, MAX_TEMAS } from '../constants/tutoria'
import { hoyLocalISO } from '../utils/fechas'

// Los selects entregan strings; el esquema los convierte a los numeros que espera el backend.
const seleccionNumerica = (mensaje) => z.string().min(1, mensaje).transform(Number)

const fecha = z
  .string()
  .min(1, 'Elige la fecha de la tutoría')
  .refine((valor) => valor >= hoyLocalISO(), 'La fecha no puede ser anterior a hoy')

const lugar = {
  fecha,
  edificio: seleccionNumerica('Elige el edificio'),
  aula: seleccionNumerica('Elige el aula'),
}

export const crearTutoriaSchema = z.object({
  nrc: seleccionNumerica('Elige la Experiencia Educativa'),
  idHorario: seleccionNumerica('Elige el horario'),
  ...lugar,
  temas: z
    .array(z.string().trim().min(1).max(MAX_CARACTERES_TEMA))
    .max(MAX_TEMAS, `Puedes agregar hasta ${MAX_TEMAS} temas`)
    .default([]),
})

export const editarTutoriaSchema = z.object({
  idHorario: seleccionNumerica('Elige el horario'),
  ...lugar,
})
