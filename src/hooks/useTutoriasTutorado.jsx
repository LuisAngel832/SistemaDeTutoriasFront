import { useEffect, useState } from 'react'

const BASE_URL = import.meta.env.VITE_API_URL ?? ''

const getAuthHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${localStorage.getItem('token')}`,
})

export const useTutoriasTutorado = () => {
  const [tutorias, setTutorias] = useState([])
  // El back actual no expone un endpoint de tutorias canceladas para el tutorado.
  // Se deja vacio hasta que GET /asistencia/mis-inscripciones (o equivalente) lo incluya.
  const [tutoriasCanceladas, setTutoriasCanceladas] = useState([])
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  const fetchInscripciones = async () => {
    setIsLoading(true)
    setError('')

    try {
      const response = await fetch(`${BASE_URL}/asistencia/mis-inscripciones`, {
        method: 'GET',
        headers: getAuthHeaders(),
      })

      const body = await response.json().catch(() => null)

      if (!response.ok) {
        setError(body?.message || 'Error al obtener tutorias')
        return
      }

      setTutorias(body?.data || [])
      setTutoriasCanceladas([])
    } catch (fetchError) {
      setError(fetchError.message || 'Error al conectar con el servidor')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchInscripciones()
  }, [])

  return {
    tutorias,
    tutoriasCanceladas,
    error,
    isLoading,
    refetch: fetchInscripciones,
  }
}
