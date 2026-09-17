import { useState } from 'react'
import { horariosApi } from '../api/horarios'
import { materiasApi } from '../api/materias'
import { tutoriasApi } from '../api/tutorias'
import { useRecurso } from './useRecurso'

const useCrearTutoria = () => {
  const [nrcExperiencia, setNrcExperiencia] = useState('')
  const [horario, setHorario] = useState('')
  const [fecha, setFecha] = useState('')
  const [edificio, setEdificio] = useState('')
  const [aula, setAula] = useState('')
  const [temas, setTemas] = useState([])
  const [mensaje, setMensaje] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Si fallan, el formulario muestra los selects vacios con su mensaje de ayuda.
  const { datos: horariosDisponibles } = useRecurso(horariosApi.listar, [])
  const { datos: experienciasDisponibles } = useRecurso(materiasApi.listar, [])

  const agregarTema = (tema) => {
    const limpio = tema.trim()
    if (!limpio) return
    setTemas((prev) =>
      prev.some((t) => t.toLowerCase() === limpio.toLowerCase()) ? prev : [...prev, limpio],
    )
  }

  const quitarTema = (tema) => {
    setTemas((prev) => prev.filter((t) => t !== tema))
  }

  const reset = () => {
    setNrcExperiencia('')
    setHorario('')
    setFecha('')
    setEdificio('')
    setAula('')
    setTemas([])
  }

  const handleSubmit = async () => {
    if (!nrcExperiencia || !horario || !fecha || !edificio || !aula) {
      setMensaje('Completa todos los campos')
      setShowModal(true)
      return
    }

    const idHorarioNum = Number(horario)
    const edificioNum = Number(edificio)
    const aulaNum = Number(aula)
    const nrcNum = Number(nrcExperiencia)

    if (
      !Number.isFinite(idHorarioNum) ||
      !Number.isFinite(edificioNum) ||
      !Number.isFinite(aulaNum) ||
      !Number.isFinite(nrcNum)
    ) {
      setMensaje('Hay campos numericos invalidos. Revisa Horario, Edificio, Aula y NRC.')
      setShowModal(true)
      return
    }

    const payload = {
      idHorario: idHorarioNum,
      fecha,
      edificio: edificioNum,
      aula: aulaNum,
      nrc: nrcNum,
      temas,
    }

    setIsSubmitting(true)

    try {
      await tutoriasApi.crear(payload)
      setMensaje('Tutoria creada correctamente')
      reset()
    } catch (err) {
      setMensaje(err.message)
    } finally {
      setShowModal(true)
      setIsSubmitting(false)
    }
  }

  return {
    nrcExperiencia,
    setNrcExperiencia,
    horario,
    setHorario,
    fecha,
    setFecha,
    edificio,
    setEdificio,
    aula,
    setAula,
    mensaje,
    showModal,
    setShowModal,
    temas,
    agregarTema,
    quitarTema,
    handleSubmit,
    reset,
    horariosDisponibles,
    experienciasDisponibles,
    isSubmitting,
  }
}

export default useCrearTutoria
