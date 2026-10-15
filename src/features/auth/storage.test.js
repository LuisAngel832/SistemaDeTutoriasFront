import { describe, expect, it } from 'vitest'
import { CLAVE_TOKEN, esClaveDeSesion, guardarToken, leerToken, limpiarToken } from './storage'

describe('storage de la sesion', () => {
  it('guarda solo el token en una clave', () => {
    guardarToken('t')

    expect(localStorage.getItem(CLAVE_TOKEN)).toBe('t')
    expect(localStorage.length).toBe(1)
    expect(leerToken()).toBe('t')
  })

  it('borra las claves de la version anterior al guardar', () => {
    for (const [clave, valor] of Object.entries({ rol: 'admin', matricula: 'S1', nombre: 'Ana' })) {
      localStorage.setItem(clave, valor)
    }
    localStorage.setItem('sidebarCollapsed', 'true')

    guardarToken('t')

    expect(localStorage.getItem('rol')).toBeNull()
    expect(localStorage.getItem('matricula')).toBeNull()
    expect(localStorage.getItem('nombre')).toBeNull()
    expect(localStorage.getItem('sidebarCollapsed')).toBe('true')
  })

  it('limpia la sesion', () => {
    guardarToken('t')
    limpiarToken()
    expect(leerToken()).toBe('')
  })

  it('reconoce la clave de sesion (null = localStorage.clear en otra pestana)', () => {
    expect(esClaveDeSesion('token')).toBe(true)
    expect(esClaveDeSesion(null)).toBe(true)
    expect(esClaveDeSesion('rol')).toBe(false)
    expect(esClaveDeSesion('sidebarCollapsed')).toBe(false)
  })
})
