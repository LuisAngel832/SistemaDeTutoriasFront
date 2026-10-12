import { describe, expect, it } from 'vitest'
import { loginSchema, registroSchema } from './auth'
import { materiaSchema } from './materia'
import { aPayloadTutoria, formularioTutoriaSchema } from './tutoria'

const mensajes = (resultado) => resultado.error.issues.map((issue) => issue.message)
const porCampo = (resultado) =>
  Object.fromEntries(resultado.error.issues.map((issue) => [issue.path.join('.'), issue.message]))

describe('loginSchema', () => {
  it('arma el body con la matricula normalizada o con el correo', () => {
    expect(loginSchema.parse({ usuario: ' zs23014587 ', contrasena: 'secreta' })).toEqual({
      matricula: 'S23014587',
      pwd: 'secreta',
    })
    expect(loginSchema.parse({ usuario: 'Ana@UV.mx', contrasena: 'secreta' })).toEqual({
      correo: 'ana@uv.mx',
      pwd: 'secreta',
    })
  })

  it('exige un correo o una matricula valida y la contrasena', () => {
    expect(porCampo(loginSchema.safeParse({ usuario: '1234', contrasena: '' }))).toEqual({
      usuario: 'Escribe tu correo o tu matrícula (S seguida de 8 dígitos)',
      contrasena: 'Ingresa tu contraseña',
    })
    expect(mensajes(loginSchema.safeParse({ usuario: '', contrasena: 'x' }))).toContain(
      'Ingresa tu correo o tu matrícula',
    )
  })
})

describe('registroSchema', () => {
  const valido = {
    rol: 'TUTORADO',
    nombre: 'Sofía',
    apellidos: 'Ramos Gutiérrez',
    matricula: 'zs24011236',
    correo: 'ZS24011236@estudiantes.uv.mx',
    pwd: '12345678',
  }

  it('normaliza matricula y correo', () => {
    expect(registroSchema.parse(valido)).toMatchObject({
      matricula: 'S24011236',
      correo: 'zs24011236@estudiantes.uv.mx',
    })
  })

  it('valida cada campo', () => {
    expect(
      porCampo(
        registroSchema.safeParse({
          rol: 'ADMIN',
          nombre: '',
          apellidos: ' ',
          matricula: '123',
          correo: 'sofia',
          pwd: '123',
        }),
      ),
    ).toEqual({
      rol: 'Elige cómo usarás el sistema',
      nombre: 'Ingresa tu nombre',
      apellidos: 'Ingresa tus apellidos',
      matricula: 'Escribe la S seguida de 8 dígitos, por ejemplo S24011236',
      correo: 'Escribe un correo electrónico válido',
      pwd: 'La contraseña debe tener al menos 8 caracteres',
    })
  })
})

describe('formularioTutoriaSchema', () => {
  const horario = (cambios = {}) => ({
    idHorario: null,
    dia: 'MARTES',
    horaInicio: '08:00',
    horaFin: '10:00',
    temas: [],
    ...cambios,
  })
  const valido = (horarios = [horario()]) => ({
    idMateria: '13',
    edificio: '1',
    aula: '10',
    horarios,
  })

  it('convierte las selecciones a numeros', () => {
    const resultado = formularioTutoriaSchema.safeParse(valido())
    expect(resultado.data).toMatchObject({ idMateria: 13, edificio: 1, aula: 10 })
  })

  it('exige los campos, al menos un horario y solo dias habiles', () => {
    expect(
      porCampo(
        formularioTutoriaSchema.safeParse({
          idMateria: '',
          edificio: '',
          aula: '',
          horarios: [horario({ dia: 'SABADO' })],
        }),
      ),
    ).toMatchObject({
      idMateria: 'Elige la Experiencia Educativa',
      edificio: 'Elige el edificio',
      aula: 'Elige el aula',
      'horarios.0.dia': 'Elige el día',
    })
    expect(mensajes(formularioTutoriaSchema.safeParse(valido([])))).toContain(
      'Agrega al menos un horario',
    )
  })

  it('pide que la hora de fin sea posterior y que los temas no se repitan', () => {
    expect(
      porCampo(
        formularioTutoriaSchema.safeParse(
          valido([horario({ horaInicio: '10:00', horaFin: '08:00', temas: ['VLAN', 'vlan'] })]),
        ),
      ),
    ).toEqual({
      'horarios.0.horaFin': 'La hora de fin debe ser posterior a la de inicio',
      'horarios.0.temas': 'Hay temas repetidos en este horario',
    })
  })

  it('detecta traslapes del mismo dia pero acepta horarios contiguos', () => {
    expect(
      porCampo(
        formularioTutoriaSchema.safeParse(
          valido([horario(), horario({ horaInicio: '09:00', horaFin: '11:00' })]),
        ),
      ),
    ).toEqual({ 'horarios.1.horaInicio': 'Se traslapa con el horario 1' })
    expect(
      formularioTutoriaSchema.safeParse(
        valido([horario(), horario({ horaInicio: '10:00', horaFin: '12:00' })]),
      ).success,
    ).toBe(true)
  })

  it('arma el body de crear y de editar', () => {
    const datos = formularioTutoriaSchema.parse(
      valido([horario({ idHorario: 31, temas: ['OSI'] }), horario({ dia: 'VIERNES' })]),
    )
    expect(aPayloadTutoria(datos)).toEqual({
      idMateria: 13,
      edificio: 1,
      aula: 10,
      horarios: [
        { dia: 'MARTES', horaInicio: '08:00', horaFin: '10:00', temas: ['OSI'] },
        { dia: 'VIERNES', horaInicio: '08:00', horaFin: '10:00', temas: [] },
      ],
    })
    expect(aPayloadTutoria(datos, { editar: true }).horarios[0]).toEqual({
      idHorario: 31,
      dia: 'MARTES',
      horaInicio: '08:00',
      horaFin: '10:00',
      temas: ['OSI'],
    })
    expect(aPayloadTutoria(datos, { editar: true })).not.toHaveProperty('idMateria')
  })
})

describe('materiaSchema', () => {
  it('valida nombre y NRC y convierte el NRC a numero', () => {
    expect(materiaSchema.parse({ nombre: ' Redes ', nrc: '52310' })).toEqual({
      nombre: 'Redes',
      nrc: 52310,
    })
    expect(porCampo(materiaSchema.safeParse({ nombre: '', nrc: '52a' }))).toEqual({
      nombre: 'Escribe el nombre de la Experiencia Educativa',
      nrc: 'El NRC solo lleva números',
    })
    expect(mensajes(materiaSchema.safeParse({ nombre: 'Redes', nrc: '0' }))).toContain(
      'El NRC debe ser mayor que cero',
    )
  })
})
