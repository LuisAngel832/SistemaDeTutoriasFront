import { describe, expect, it } from 'vitest'
import { estaLlena, etiquetaLugares, porcentajeCupo, tonoCupo } from './cupo'

describe('cupo', () => {
  const cupo = (ocupados) => ({ ocupados, maximo: 7, disponibles: 7 - ocupados })

  it('elige la insignia de lugares', () => {
    expect(etiquetaLugares(cupo(4))).toEqual({ texto: '3 lugares', tone: 'success' })
    expect(etiquetaLugares(cupo(6))).toEqual({ texto: 'Último lugar', tone: 'warning' })
    expect(etiquetaLugares(cupo(7))).toEqual({ texto: 'Llena', tone: 'danger' })
  })

  it('elige el tono y el porcentaje de la barra', () => {
    expect(tonoCupo(cupo(3))).toBe('normal')
    expect(tonoCupo(cupo(6))).toBe('limite')
    expect(tonoCupo(cupo(7))).toBe('lleno')
    expect(estaLlena(cupo(7))).toBe(true)
    expect(porcentajeCupo(cupo(4))).toBe(57)
  })
})
