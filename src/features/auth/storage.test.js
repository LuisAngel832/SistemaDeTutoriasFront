import { describe, expect, it } from 'vitest'
import {
  esClaveDeSesion,
  guardarRegistroPendiente,
  guardarSesion,
  leerRegistroPendiente,
  leerSesion,
  limpiarSesion,
  SESION_VACIA,
  STORAGE_KEYS,
} from './storage'

describe('storage de la sesion', () => {
  it('guarda y lee la sesion con las claves historicas', () => {
    const sesion = {
      token: 't',
      rol: 'tutor',
      matricula: 'S21009342',
      nombre: 'Ana',
      correo: 'ana@uv.mx',
    }
    guardarSesion(sesion)

    expect(localStorage.getItem(STORAGE_KEYS.TOKEN)).toBe('t')
    expect(localStorage.getItem('rol')).toBe('tutor')
    expect(leerSesion()).toEqual(sesion)
  })

  it('elimina los campos vacios y limpia la sesion', () => {
    guardarSesion({ token: 't', rol: 'tutor', matricula: 'S1', nombre: '' })
    expect(localStorage.getItem('nombre')).toBeNull()

    limpiarSesion()
    expect(leerSesion()).toEqual(SESION_VACIA)
  })

  it('reconoce las claves de sesion (null = localStorage.clear en otra pestana)', () => {
    expect(esClaveDeSesion('token')).toBe(true)
    expect(esClaveDeSesion(null)).toBe(true)
    expect(esClaveDeSesion('sidebarCollapsed')).toBe(false)
  })

  it('guarda el registro pendiente en sessionStorage', () => {
    const registro = { tokenRegistro: 'tr', perfil: { correo: 'a@b.mx' }, expira: 1 }
    guardarRegistroPendiente(registro)
    expect(leerRegistroPendiente()).toEqual(registro)
    expect(localStorage.getItem(STORAGE_KEYS.REGISTRO_PENDIENTE)).toBeNull()

    guardarRegistroPendiente(null)
    expect(leerRegistroPendiente()).toBeNull()
  })
})
