import { describe, expect, it } from 'vitest'
import { filterTutorias } from './filterTutorias'

const sample = [
  { idTutoria: 1, estado: 'PROGRAMADA', materia: { nombreMateria: 'Cálculo Diferencial' } },
  { idTutoria: 2, estado: 'EN_CURSO', materia: { nombreMateria: 'Estructuras de Datos' } },
  { idTutoria: 3, estado: 'COMPLETADA', materia: { nombreMateria: 'Cálculo Integral' } },
  { idTutoria: 4, estado: 'CANCELADA', materia: { nombreMateria: 'Bases de Datos' } },
]

describe('filterTutorias', () => {
  it('returns everything when no filter is applied', () => {
    expect(filterTutorias(sample, { search: '', estado: '' })).toHaveLength(4)
  })

  it('filters by estado exactly', () => {
    const result = filterTutorias(sample, { search: '', estado: 'EN_CURSO' })
    expect(result.map((t) => t.idTutoria)).toEqual([2])
  })

  it('filters by materia case-insensitively and matches substrings', () => {
    const result = filterTutorias(sample, { search: 'cálculo', estado: '' })
    expect(result.map((t) => t.idTutoria)).toEqual([1, 3])
  })

  it('combines search and estado', () => {
    const result = filterTutorias(sample, { search: 'cálculo', estado: 'COMPLETADA' })
    expect(result.map((t) => t.idTutoria)).toEqual([3])
  })

  it('ignores whitespace-only search', () => {
    expect(filterTutorias(sample, { search: '   ', estado: '' })).toHaveLength(4)
  })

  it('survives tutorias missing materia field', () => {
    const broken = [...sample, { idTutoria: 5, estado: 'PROGRAMADA' }]
    expect(filterTutorias(broken, { search: 'cálculo', estado: '' })).toHaveLength(2)
  })
})
