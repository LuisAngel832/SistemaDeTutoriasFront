import { z } from 'zod'
import { MAX_CARACTERES_EE } from '@/constants/tutoria'

// Alta y edicion de una Experiencia Educativa (pantalla 16). El NRC llega como texto del input.
export const materiaSchema = z.object({
  nombre: z
    .string()
    .trim()
    .min(1, 'Escribe el nombre de la Experiencia Educativa')
    .max(MAX_CARACTERES_EE, `El nombre puede tener hasta ${MAX_CARACTERES_EE} caracteres`),
  nrc: z
    .string()
    .trim()
    .min(1, 'Escribe el NRC')
    .regex(/^\d+$/, 'El NRC solo lleva números')
    .transform(Number)
    .refine((nrc) => nrc > 0, 'El NRC debe ser mayor que cero'),
})
