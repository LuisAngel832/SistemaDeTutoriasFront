import { useEffect, useState } from 'react'

const BASE_URL = 'https://backtutorias.onrender.com'

export const useTutoriasTutorado = () => {
  const [tutorias, setTutorias] = useState([])
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchTutorias = async () => {
      try {
        const response = await fetch(`${BASE_URL}/tutorado/mis-tutorias`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data?.message || 'Error al obtener tutorias')
        }

        setTutorias(data?.data || [])
      } catch (fetchError) {
        setError(fetchError.message)
      } finally {
        setIsLoading(false)
      }
    }

    fetchTutorias()
  }, [])

  return { tutorias, error, isLoading }
}
