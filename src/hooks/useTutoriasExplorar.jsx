import { useEffect, useState } from 'react'

const BASE_URL = import.meta.env.VITE_API_URL ?? ''

const getAuthHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${localStorage.getItem('token')}`,
})

export const useTutoriasExplorar = () => {
  const [tutorias, setTutorias] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchTutorias = async () => {
      try {
        const response = await fetch(`${BASE_URL}/tutoria/disponibles`, {
          method: 'GET',
          headers: getAuthHeaders(),
        })

        if (!response.ok) {
          setError('No se pudieron cargar las tutorias')
          return
        }

        const data = await response.json()
        setTutorias(data?.data || [])
      } catch {
        setError('Error al conectar con el servidor')
      } finally {
        setIsLoading(false)
      }
    }

    fetchTutorias()
  }, [])

  return { tutorias, isLoading, error }
}
