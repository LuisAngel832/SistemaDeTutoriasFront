import { useEffect, useState } from 'react'

const BASE_URL = import.meta.env.VITE_API_URL ?? ''

const getAuthHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${localStorage.getItem('token')}`,
})

const useMisTutorias = () => {
  const [tutorias, setTutorias] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchTutorias = async () => {
    setIsLoading(true)
    setError('')

    try {
      const response = await fetch(`${BASE_URL}/tutoria/mis-tutorias`, {
        method: 'GET',
        headers: getAuthHeaders(),
      })

      const body = await response.json().catch(() => null)

      if (!response.ok) {
        setError(body?.message || 'No se pudieron cargar las tutorias')
        return
      }

      setTutorias(body?.data || [])
    } catch {
      setError('Error al conectar con el servidor')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchTutorias()
  }, [])

  return {
    tutorias,
    isLoading,
    error,
    refetch: fetchTutorias,
  }
}

export default useMisTutorias
