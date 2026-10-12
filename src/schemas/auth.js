// zod/mini: API funcional y tree-shakeable; el login es la primera pantalla y debe pesar poco.
import * as z from 'zod/mini'

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
  .check(
    z.overwrite(normalizarMatricula),
    z.minLength(1, 'Ingresa tu matrícula'),
    z.regex(FORMATO_MATRICULA, 'Escribe la S seguida de 8 dígitos, por ejemplo S24011236'),
  )

const correoValido = z.email()

// Login con correo o matricula. Se transforma en el body de POST /auth/signin:
// { correo, pwd } si trae "@" o { matricula, pwd } en otro caso.
export const loginSchema = z.pipe(
  z
    .object({
      usuario: z.string().check(z.trim(), z.minLength(1, 'Ingresa tu correo o tu matrícula')),
      contrasena: z.string().check(z.minLength(1, 'Ingresa tu contraseña')),
    })
    .check(
      z.superRefine(({ usuario }, ctx) => {
        if (!usuario) return
        const valido = usuario.includes('@')
          ? correoValido.safeParse(usuario).success
          : FORMATO_MATRICULA.test(normalizarMatricula(usuario))
        if (!valido) {
          ctx.addIssue({
            code: 'custom',
            path: ['usuario'],
            message: 'Escribe tu correo o tu matrícula (S seguida de 8 dígitos)',
          })
        }
      }),
    ),
  z.transform(({ usuario, contrasena }) =>
    usuario.includes('@')
      ? { correo: usuario.toLowerCase(), pwd: contrasena }
      : { matricula: normalizarMatricula(usuario), pwd: contrasena },
  ),
)

export const registroSchema = z.object({
  rol: z.enum([ROLES_REGISTRO.TUTORADO, ROLES_REGISTRO.TUTOR], {
    error: 'Elige cómo usarás el sistema',
  }),
  nombre: z.string().check(z.trim(), z.minLength(1, 'Ingresa tu nombre')),
  apellidos: z.string().check(z.trim(), z.minLength(1, 'Ingresa tus apellidos')),
  matricula,
  correo: z.pipe(
    z.string().check(z.trim(), z.toLowerCase()),
    z.email('Escribe un correo electrónico válido'),
  ),
  pwd: z
    .string()
    .check(
      z.minLength(
        MIN_CARACTERES_CONTRASENA,
        `La contraseña debe tener al menos ${MIN_CARACTERES_CONTRASENA} caracteres`,
      ),
    ),
})
