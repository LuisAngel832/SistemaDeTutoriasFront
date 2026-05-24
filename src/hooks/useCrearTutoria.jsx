import { useEffect, useState } from 'react'

const BASE_URL = import.meta.env.VITE_API_URL ?? ''

const getAuthHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${localStorage.getItem('token')}`,
})

const useCrearTutoria = () => {
  const [nrcMateria, setNrcMateria] = useState('')
  const [horario, setHorario] = useState('')
  const [fecha, setFecha] = useState('')
  const [edificio, setEdificio] = useState('')
  const [aula, setAula] = useState('')
  const [mensaje, setMensaje] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [horariosDisponibles, setHorariosDisponibles] = useState([])
  const [materiasDisponibles, setMateriasDisponibles] = useState([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!nrcMateria || !horario || !fecha || !edificio || !aula) {
      setMensaje('Completa todos los campos')
      setShowModal(true)
      return
    }

    const idHorarioNum = Number(horario)
    const edificioNum = Number(edificio)
    const aulaNum = Number(aula)
    const nrcNum = Number(nrcMateria)

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
      temas: [],
    }

    setIsSubmitting(true)

    try {
      const response = await fetch(`${BASE_URL}/tutoria`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      })

      const responseBody = await response.json()

      if (!response.ok) {
        setMensaje(responseBody?.message || 'No se pudo crear la tutoria')
        setShowModal(true)
        return
      }

      setMensaje('Tutoria creada correctamente')
      setShowModal(true)
      setNrcMateria('')
      setHorario('')
      setFecha('')
      setEdificio('')
      setAula('')
    } catch {
      setMensaje('Error al conectar con el servidor')
      setShowModal(true)
    } finally {
      setIsSubmitting(false)
    }
  }

  useEffect(() => {
    const fetchHorarios = async () => {
      try {
        const response = await fetch(`${BASE_URL}/horario`, {
          method: 'GET',
          headers: getAuthHeaders(),
        })

        if (!response.ok) {
          return
        }

        const data = await response.json()
        const lista = (data?.data || []).map((h) => ({
          ...h,
          idHorario: h.idHorario ?? h.id ?? h.idHorarios ?? h.horarioId,
        }))
        setHorariosDisponibles(lista)
      } catch {
        setHorariosDisponibles([])
      }
    }

    const fetchMaterias = async () => {
      try {
        const response = await fetch(`${BASE_URL}/materia`, {
          method: 'GET',
          headers: getAuthHeaders(),
        })

        if (!response.ok) {
          return
        }

        const data = await response.json()
        setMateriasDisponibles(data?.data || [])
      } catch {
        setMateriasDisponibles([])
      }
    }

    fetchHorarios()
    fetchMaterias()
  }, [])

  return {
    nrcMateria,
    setNrcMateria,
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
    handleSubmit,
    horariosDisponibles,
    materiasDisponibles,
    isSubmitting,
  }
}

export default useCrearTutoria
