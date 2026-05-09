import { useEffect, useState } from 'react'

const BASE_URL = 'https://backtutorias.onrender.com'

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
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!nrcMateria || !horario || !fecha || !edificio || !aula) {
      setMensaje('Completa todos los campos')
      setShowModal(true)
      return
    }

    const payload = {
      idHorario: Number(horario),
      fecha,
      edificio: Number(edificio),
      aula: Number(aula),
      nrcMateria: Number(nrcMateria),
    }

    setIsSubmitting(true)

    try {
      const response = await fetch(`${BASE_URL}/tutorias/genera-tutoria`, {
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
        const response = await fetch(`${BASE_URL}/tutor/misHorarios`, {
          method: 'GET',
          headers: getAuthHeaders(),
        })

        if (!response.ok) {
          return
        }

        const data = await response.json()
        setHorariosDisponibles(data?.data || [])
      } catch {
        setHorariosDisponibles([])
      }
    }

    fetchHorarios()
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
    isSubmitting,
  }
}

export default useCrearTutoria
