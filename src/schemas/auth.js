import { z } from 'zod'

// Rol que elige el usuario en su primer acceso (el backend no acepta ADMIN).
export const ROLES_REGISTRO = { TUTORADO: 'TUTORADO', TUTOR: 'TUTOR' }

// Normaliza la matricula como el backend: sin espacios, sin la "z" del correo y con "S"
// mayuscula ("zs24011236" -> "S24011236").
export const normalizarMatricula = (valor) =>
  String(valor ?? '')
    .trim()
    .replace(/^z/i, '')
    .replace(/^s/, 'S')

const matricula = z
  .string()
  .transform(normalizarMatricula)
  .pipe(
    z
      .string()
      .min(1, 'Ingresa tu matrícula')
      .regex(/^S\d{8}$/, 'Escribe la S seguida de 8 dígitos, por ejemplo S24011236'),
  )

export const completarRegistroSchema = z.object({
  matricula,
  rol: z.enum([ROLES_REGISTRO.TUTORADO, ROLES_REGISTRO.TUTOR], {
    error: 'Elige cómo usarás el sistema',
  }),
})
