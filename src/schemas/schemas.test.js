import { describe, expect, it } from 'vitest'
import { loginSchema, registroSchema } from './auth'
import { horarioSchema } from './horario'
import { crearTutoriaSchema, editarTutoriaSchema } from './tutoria'

const mensajes = (resultado) => resultado.error.issues.map((issue) => issue.message)
const porCampo = (resultado) =>
  Object.fromEntries(resultado.error.issues.map((issue) => [issue.path.join('.'), issue.message]))

describe('loginSchema', () => {
  it('exige matricula numerica y contrasena', () => {
    expect(loginSchema.safeParse({ matricula: '1001', contrasena: 'secreta' }).success).toBe(true)
    expect(porCampo(loginSchema.safeParse({ matricula: 'abc', contrasena: '' }))).toEqual({
      matricula: 'La matrícula debe tener solo números',
      contrasena: 'Ingresa tu contraseña',
    })
  })
})

describe('registroSchema', () => {
  const valido = {
    rol: 'tutorado',
    nombre: 'Luis',
    matricula: '20230001',
    apellidoP: 'Perez',
    apellidoM: 'Ruiz',
    correo: 'luis@uv.mx',
    pwd: '12345678',
  }

  it('acepta un registro completo', () => {
    expect(registroSchema.safeParse(valido).success).toBe(true)
  })

  it('valida correo y longitud de la contrasena', () => {
    const resultado = registroSchema.safeParse({ ...valido, correo: 'luis', pwd: '123' })
    expect(mensajes(resultado)).toEqual([
      'Escribe un correo electrónico válido',
      'La contraseña debe tener al menos 8 caracteres',
    ])
  })
})

describe('horarioSchema', () => {
  it('pide que la hora final sea mayor que la de inicio', () => {
    expect(
      horarioSchema.safeParse({ dia: 'Lunes', horaInicio: '10:00', horaFin: '12:00' }).success,
    ).toBe(true)
    expect(
      porCampo(horarioSchema.safeParse({ dia: 'Lunes', horaInicio: '12:00', horaFin: '10:00' })),
    ).toEqual({ horaFin: 'La hora final debe ser mayor que la hora de inicio' })
  })
})

describe('esquemas de tutoria', () => {
  it('convierte las selecciones a numeros', () => {
    const resultado = crearTutoriaSchema.safeParse({
      nrc: '12345',
      idHorario: '2',
      fecha: '2030-01-01',
      edificio: '1',
      aula: '5',
      temas: ['Costos'],
    })
    expect(resultado.data).toEqual({
      nrc: 12345,
      idHorario: 2,
      fecha: '2030-01-01',
      edificio: 1,
      aula: 5,
      temas: ['Costos'],
    })
  })

  it('exige cada campo y rechaza fechas pasadas', () => {
    const resultado = crearTutoriaSchema.safeParse({
      nrc: '',
      idHorario: '',
      fecha: '2000-01-01',
      edificio: '',
      aula: '',
      temas: [],
    })
    expect(porCampo(resultado)).toEqual({
      nrc: 'Elige la Experiencia Educativa',
      idHorario: 'Elige el horario',
      fecha: 'La fecha no puede ser anterior a hoy',
      edificio: 'Elige el edificio',
      aula: 'Elige el aula',
    })
  })

  it('editarTutoriaSchema no pide la Experiencia Educativa', () => {
    const resultado = editarTutoriaSchema.safeParse({
      idHorario: '3',
      fecha: '2030-02-02',
      edificio: '2',
      aula: '9',
    })
    expect(resultado.data).toEqual({ idHorario: 3, fecha: '2030-02-02', edificio: 2, aula: 9 })
  })
})
