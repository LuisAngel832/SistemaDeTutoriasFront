import { useState } from 'react'
import { horariosApi } from '../api/horarios'
import { materiasApi } from '../api/materias'
import { tutoriasApi } from '../api/tutorias'
import { useRecurso } from './useRecurso'

const VALORES_INICIALES = { nrc: '', idHorario: '', fecha: '', edificio: '', aula: '' }

const useCrearTutoria = () => {
  const [valores, setValores] = useState(VALORES_INICIALES)
  const [temas, setTemas] = useState([])
  // { ok, message } del ultimo intento de crear la tutoria.
  const [resultado, setResultado] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Si fallan, el formulario muestra los selects vacios con su aviso.
  const { datos: horarios, isLoading: cargandoHorarios } = useRecurso(horariosApi.listar, [])
  const { datos: materias, isLoading: cargandoMaterias } = useRecurso(materiasApi.listar, [])

  const cambiar = (campo, valor) => {
    setValores((actuales) => ({ ...actuales, [campo]: valor }))
    setResultado((actual) => (actual?.ok === false ? null : actual))
  }

  const agregarTema = (tema) => {
    const limpio = tema.trim()
    if (!limpio) return
    setTemas((actuales) =>
      actuales.some((t) => t.toLowerCase() === limpio.toLowerCase())
        ? actuales
        : [...actuales, limpio],
    )
  }

  const quitarTema = (tema) => setTemas((actuales) => actuales.filter((t) => t !== tema))

  const reset = () => {
    setValores(VALORES_INICIALES)
    setTemas([])
    setResultado(null)
  }

  const crear = async () => {
    if (Object.values(valores).some((valor) => !valor)) {
      setResultado({ ok: false, message: 'Completa todos los campos obligatorios.' })
      return
    }

    setIsSubmitting(true)
    try {
      await tutoriasApi.crear({
        idHorario: Number(valores.idHorario),
        fecha: valores.fecha,
        edificio: Number(valores.edificio),
        aula: Number(valores.aula),
        nrc: Number(valores.nrc),
        temas,
      })
      setValores(VALORES_INICIALES)
      setTemas([])
      setResultado({
        ok: true,
        message: 'La tutoria quedo programada y ya es visible para los tutorados.',
      })
    } catch (err) {
      setResultado({ ok: false, message: err.message })
    } finally {
      setIsSubmitting(false)
    }
  }

  return {
    valores,
    cambiar,
    temas,
    agregarTema,
    quitarTema,
    reset,
    crear,
    resultado,
    cerrarResultado: () => setResultado(null),
    horarios,
    materias,
    cargandoListas: cargandoHorarios || cargandoMaterias,
    isSubmitting,
  }
}

export default useCrearTutoria
