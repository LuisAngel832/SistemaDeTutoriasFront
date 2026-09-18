import { z } from 'zod'
import { ROLES } from '@/constants/roles'

export const MIN_CARACTERES_CONTRASENA = 8

const matricula = z
  .string()
  .trim()
  .min(1, 'Ingresa tu matrícula')
  .regex(/^\d{4,12}$/, 'La matrícula debe tener solo números')

export const loginSchema = z.object({
  matricula,
  contrasena: z.string().min(1, 'Ingresa tu contraseña'),
})

export const registroSchema = z.object({
  rol: z.enum([ROLES.TUTORADO, ROLES.TUTOR]),
  nombre: z.string().trim().min(1, 'Ingresa tu nombre'),
  matricula,
  apellidoP: z.string().trim().min(1, 'Ingresa tu apellido paterno'),
  apellidoM: z.string().trim().min(1, 'Ingresa tu apellido materno'),
  correo: z.email('Escribe un correo electrónico válido').trim(),
  pwd: z
    .string()
    .min(
      MIN_CARACTERES_CONTRASENA,
      `La contraseña debe tener al menos ${MIN_CARACTERES_CONTRASENA} caracteres`,
    ),
})
