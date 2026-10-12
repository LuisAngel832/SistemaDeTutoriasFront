import { z } from 'zod'

// Rol que elige el usuario al crear su cuenta (el backend no acepta ADMIN).
export const ROLES_REGISTRO = { TUTORADO: 'TUTORADO', TUTOR: 'TUTOR' }

export const MIN_CARACTERES_CONTRASENA = 8

const FORMATO_MATRICULA = /^S\d{8}$/

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
      .regex(FORMATO_MATRICULA, 'Escribe la S seguida de 8 dígitos, por ejemplo S24011236'),
  )

// Login con correo o matricula. Se transforma en el body de POST /auth/signin:
// { correo, pwd } si trae "@" o { matricula, pwd } en otro caso.
export const loginSchema = z
  .object({
    usuario: z.string().trim().min(1, 'Ingresa tu correo o tu matrícula'),
    contrasena: z.string().min(1, 'Ingresa tu contraseña'),
  })
  .superRefine(({ usuario }, ctx) => {
    if (!usuario) return
    const valido = usuario.includes('@')
      ? z.email().safeParse(usuario).success
      : FORMATO_MATRICULA.test(normalizarMatricula(usuario))
    if (!valido) {
      ctx.addIssue({
        code: 'custom',
        path: ['usuario'],
        message: 'Escribe tu correo o tu matrícula (S seguida de 8 dígitos)',
      })
    }
  })
  .transform(({ usuario, contrasena }) =>
    usuario.includes('@')
      ? { correo: usuario.toLowerCase(), pwd: contrasena }
      : { matricula: normalizarMatricula(usuario), pwd: contrasena },
  )

export const registroSchema = z.object({
  rol: z.enum([ROLES_REGISTRO.TUTORADO, ROLES_REGISTRO.TUTOR], {
    error: 'Elige cómo usarás el sistema',
  }),
  nombre: z.string().trim().min(1, 'Ingresa tu nombre'),
  apellidos: z.string().trim().min(1, 'Ingresa tus apellidos'),
  matricula,
  correo: z.string().trim().toLowerCase().pipe(z.email('Escribe un correo electrónico válido')),
  pwd: z
    .string()
    .min(
      MIN_CARACTERES_CONTRASENA,
      `La contraseña debe tener al menos ${MIN_CARACTERES_CONTRASENA} caracteres`,
    ),
})
