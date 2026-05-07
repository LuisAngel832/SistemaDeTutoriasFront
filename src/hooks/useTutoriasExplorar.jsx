import { useEffect, useState } from 'react'

const BASE_URL = 'https://backtutorias.onrender.com'

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
        const response = await fetch(`${BASE_URL}/tutorias/all`, {
          method: 'GET',
          headers: getAuthHeaders(),
        })

        if (!response.ok) {
          setError('No se pudieron cargar las tutorias')
          return
        }

        const data = await response.json()
        const activas = (data?.data || []).filter((item) => item.estado === 'PENDIENTE')
        setTutorias(activas)
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
