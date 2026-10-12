import * as z from 'zod/mini'
import { MAX_CARACTERES_EE } from '@/constants/tutoria'

// Alta y edicion de una Experiencia Educativa (pantalla 16). El NRC llega como texto del input.
export const materiaSchema = z.object({
  nombre: z
    .string()
    .check(
      z.trim(),
      z.minLength(1, 'Escribe el nombre de la Experiencia Educativa'),
      z.maxLength(MAX_CARACTERES_EE, `El nombre puede tener hasta ${MAX_CARACTERES_EE} caracteres`),
    ),
  nrc: z.pipe(
    z.pipe(
      z
        .string()
        .check(
          z.trim(),
          z.minLength(1, 'Escribe el NRC'),
          z.regex(/^\d+$/, 'El NRC solo lleva números'),
        ),
      z.transform(Number),
    ),
    z.number().check(z.gt(0, 'El NRC debe ser mayor que cero')),
  ),
})
