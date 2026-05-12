import { useCallback, useEffect, useState } from 'react'

const BASE_URL = 'https://backtutorias.onrender.com'

const getAuthHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${localStorage.getItem('token')}`,
})

export const useTutoriasTutor = () => {
  const [tutorias, setTutorias] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchTutorias = useCallback(async () => {
    setIsLoading(true)
    setError('')

    try {
      const response = await fetch(`${BASE_URL}/tutor/misTutorias`, {
        method: 'GET',
        headers: getAuthHeaders(),
      })

      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        setError(data?.message || 'No se pudieron cargar las tutorias')
        return
      }

      setTutorias(data?.data || [])
    } catch {
      setError('Error al conectar con el servidor')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchTutorias()
  }, [fetchTutorias])

  return { tutorias, isLoading, error, refetch: fetchTutorias }
}
