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
  const [reloadKey, setReloadKey] = useState(0)

  const refetch = useCallback(() => {
    setReloadKey((key) => key + 1)
  }, [])

  useEffect(() => {
    let cancelled = false

    const fetchTutorias = async () => {
      setIsLoading(true)
      setError('')

      try {
        const response = await fetch(`${BASE_URL}/tutor/misTutorias`, {
          method: 'GET',
          headers: getAuthHeaders(),
        })

        const data = await response.json().catch(() => ({}))

        if (cancelled) return

        if (!response.ok) {
          setError(data?.message || 'No se pudieron cargar las tutorias')
          return
        }

        setTutorias(data?.data || [])
      } catch {
        if (!cancelled) setError('Error al conectar con el servidor')
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    fetchTutorias()

    return () => {
      cancelled = true
    }
  }, [reloadKey])

  return { tutorias, isLoading, error, refetch }
}
