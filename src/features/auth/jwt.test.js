import { describe, expect, it } from 'vitest'
import { crearToken } from '../../test/tokens'
import { decodificarToken, expiracionDelToken, tokenExpirado } from './jwt'

describe('decodificarToken', () => {
  it('lee el payload del JWT', () => {
    expect(decodificarToken(crearToken({ rol: 'TUTORADO', matricula: 2001 }))).toMatchObject({
      rol: 'TUTORADO',
      matricula: 2001,
    })
  })

  it('devuelve null con tokens ilegibles', () => {
    expect(decodificarToken('')).toBeNull()
    expect(decodificarToken('no-es-un-jwt')).toBeNull()
    expect(decodificarToken('a.%%%.c')).toBeNull()
    expect(decodificarToken(undefined)).toBeNull()
  })
})

describe('tokenExpirado', () => {
  it('es falso para un token vigente', () => {
    expect(tokenExpirado(crearToken({ expiraEnSeg: 3600 }))).toBe(false)
  })

  it('es verdadero si ya vencio o vence dentro del margen', () => {
    expect(tokenExpirado(crearToken({ expiraEnSeg: -10 }))).toBe(true)
    expect(tokenExpirado(crearToken({ expiraEnSeg: 10 }), { margenSeg: 30 })).toBe(true)
    expect(tokenExpirado(crearToken({ expiraEnSeg: 10 }), { margenSeg: 0 })).toBe(false)
  })

  it('no vence si el token no trae exp, pero un token ilegible se considera vencido', () => {
    const sinExp = crearToken({ expiraEnSeg: null })
    expect(expiracionDelToken(sinExp)).toBeNull()
    expect(tokenExpirado(sinExp)).toBe(false)
    expect(tokenExpirado('basura')).toBe(true)
  })
})
