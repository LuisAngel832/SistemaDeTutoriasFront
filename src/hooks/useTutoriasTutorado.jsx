import { useEffect, useState } from 'react'

const BASE_URL = 'https://backtutorias.onrender.com'

const getAuthHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${localStorage.getItem('token')}`,
})

export const useTutoriasTutorado = () => {
  const [tutorias, setTutorias] = useState([])
  const [tutoriasCanceladas, setTutoriasCanceladas] = useState([])
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  const refetch = async () => {
    setIsLoading(true)
    setError('')

    try {
      const [activasResponse, canceladasResponse] = await Promise.all([
        fetch(`${BASE_URL}/tutorado/mis-tutorias`, {
          method: 'GET',
          headers: getAuthHeaders(),
        }),
        fetch(`${BASE_URL}/tutorado/misTutoriasCanceladas`, {
          method: 'GET',
          headers: getAuthHeaders(),
        }),
      ])

      const activasData = await activasResponse.json()
      const canceladasData = await canceladasResponse.json()

      if (!activasResponse.ok) {
        throw new Error(activasData?.message || 'Error al obtener tutorias')
      }

      if (!canceladasResponse.ok) {
        throw new Error(canceladasData?.message || 'Error al obtener tutorias canceladas')
      }

      setTutorias(activasData?.data || [])
      setTutoriasCanceladas(canceladasData?.data || [])
    } catch (fetchError) {
      setError(fetchError.message)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    const fetchOnMount = async () => {
      try {
        const [activasResponse, canceladasResponse] = await Promise.all([
          fetch(`${BASE_URL}/tutorado/mis-tutorias`, {
            method: 'GET',
            headers: getAuthHeaders(),
          }),
          fetch(`${BASE_URL}/tutorado/misTutoriasCanceladas`, {
            method: 'GET',
            headers: getAuthHeaders(),
          }),
        ])

        const activasData = await activasResponse.json()
        const canceladasData = await canceladasResponse.json()

        if (!activasResponse.ok) {
          throw new Error(activasData?.message || 'Error al obtener tutorias')
        }

        if (!canceladasResponse.ok) {
          throw new Error(canceladasData?.message || 'Error al obtener tutorias canceladas')
        }

        setTutorias(activasData?.data || [])
        setTutoriasCanceladas(canceladasData?.data || [])
      } catch (fetchError) {
        setError(fetchError.message)
      } finally {
        setIsLoading(false)
      }
    }

    fetchOnMount()
  }, [])

  return {
    tutorias,
    tutoriasCanceladas,
    error,
    isLoading,
    refetch,
  }
}
