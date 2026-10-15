// zod/mini: API funcional y tree-shakeable; el login es la primera pantalla y debe pesar poco.
import * as z from 'zod/mini'

// Rol que elige el usuario al crear su cuenta (el backend no acepta ADMIN).
export const ROLES_REGISTRO = { TUTORADO: 'TUTORADO', TUTOR: 'TUTOR' }

// Limites del backend (SignupRequest): BCrypt solo usa los primeros 72 bytes de la contrasena.
export const MIN_CARACTERES_CONTRASENA = 8
export const MAX_CARACTERES_CONTRASENA = 72
const MAX_BYTES_CONTRASENA = 72
const MAX_CARACTERES = { nombre: 50, apellidos: 200, correo: 255 }

const FORMATO_MATRICULA = /^S\d{8}$/
// Matricula de alumno con o sin la "z" del correo y en cualquier mayuscula.
const MATRICULA_ALUMNO = /^z?s(\d{8})$/i
// Los admin no tienen matricula de alumno: entran con su numero de personal (p. ej. 25480).
const NUMERO_PERSONAL = /^\d+$/

// Normaliza la matricula como el backend (MatriculaHelper.paraBusqueda): la de un alumno queda
// como "S" + 8 digitos ("zs24011236" -> "S24011236"); cualquier otra, sin espacios.
export const normalizarMatricula = (valor) => {
  const limpio = String(valor ?? '').trim()
  const alumno = MATRICULA_ALUMNO.exec(limpio)
  return alumno ? `S${alumno[1]}` : limpio
}

const bytes = (valor) => new TextEncoder().encode(valor).length

const texto = (vacio, maximo, largo) =>
  z.string().check(z.trim(), z.minLength(1, vacio), z.maxLength(maximo, largo))

const nombre = (vacio) =>
  texto(
    vacio,
    MAX_CARACTERES.nombre,
    `El nombre no puede tener más de ${MAX_CARACTERES.nombre} caracteres`,
  )

const apellidos = (vacio) =>
  texto(
    vacio,
    MAX_CARACTERES.apellidos,
    `Los apellidos no pueden tener más de ${MAX_CARACTERES.apellidos} caracteres`,
  )

const matricula = (vacio) =>
  z
    .string()
    .check(
      z.overwrite(normalizarMatricula),
      z.minLength(1, vacio),
      z.regex(FORMATO_MATRICULA, 'Escribe la S seguida de 8 dígitos, por ejemplo S24011236'),
    )

const correoValido = z.email()

const correo = z.pipe(
  z.string().check(z.trim(), z.toLowerCase()),
  z
    .email('Escribe un correo electrónico válido')
    .check(
      z.maxLength(
        MAX_CARACTERES.correo,
        `El correo no puede tener más de ${MAX_CARACTERES.correo} caracteres`,
      ),
    ),
)

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
          : FORMATO_MATRICULA.test(normalizarMatricula(usuario)) || NUMERO_PERSONAL.test(usuario)
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
  nombre: nombre('Ingresa tu nombre'),
  apellidos: apellidos('Ingresa tus apellidos'),
  matricula: matricula('Ingresa tu matrícula'),
  correo,
  pwd: z.string().check(
    z.minLength(
      MIN_CARACTERES_CONTRASENA,
      `La contraseña debe tener al menos ${MIN_CARACTERES_CONTRASENA} caracteres`,
    ),
    z.maxLength(
      MAX_CARACTERES_CONTRASENA,
      `La contraseña no puede tener más de ${MAX_CARACTERES_CONTRASENA} caracteres`,
    ),
    // Solo si cabe en caracteres, para no dar dos errores a la vez.
    z.refine(
      (pwd) => pwd.length > MAX_CARACTERES_CONTRASENA || bytes(pwd) <= MAX_BYTES_CONTRASENA,
      'La contraseña es demasiado larga: los acentos y los emojis ocupan más espacio',
    ),
  ),
})

// Pre-registro de un tutor por el admin (POST /admin/tutores): mismos campos que el registro,
// sin contrasena ni rol.
export const autorizarTutorSchema = z.object({
  nombre: nombre('Ingresa el nombre'),
  apellidos: apellidos('Ingresa los apellidos'),
  matricula: matricula('Ingresa la matrícula'),
  correo,
})
