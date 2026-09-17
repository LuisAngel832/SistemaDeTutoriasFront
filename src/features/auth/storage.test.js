import { describe, expect, it } from 'vitest'
import {
  esClaveDeSesion,
  guardarSesion,
  leerSesion,
  limpiarSesion,
  SESION_VACIA,
  STORAGE_KEYS,
} from './storage'

describe('storage de la sesion', () => {
  it('guarda y lee la sesion con las claves historicas', () => {
    guardarSesion({ token: 't', rol: 'tutor', matricula: '1001', nombre: 'Ana' })

    expect(localStorage.getItem(STORAGE_KEYS.TOKEN)).toBe('t')
    expect(localStorage.getItem('rol')).toBe('tutor')
    expect(leerSesion()).toEqual({ token: 't', rol: 'tutor', matricula: '1001', nombre: 'Ana' })
  })

  it('elimina los campos vacios y limpia la sesion', () => {
    guardarSesion({ token: 't', rol: 'tutor', matricula: '1001', nombre: '' })
    expect(localStorage.getItem('nombre')).toBeNull()

    limpiarSesion()
    expect(leerSesion()).toEqual(SESION_VACIA)
  })

  it('reconoce las claves de sesion (null = localStorage.clear en otra pestana)', () => {
    expect(esClaveDeSesion('token')).toBe(true)
    expect(esClaveDeSesion(null)).toBe(true)
    expect(esClaveDeSesion('sidebarCollapsed')).toBe(false)
  })
})
