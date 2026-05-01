import { useEffect, useState } from 'react'

const TUTORIAS_URL = 'https://backtutorias.onrender.com/tutor/misTutorias'

export const useTutorias = () => {
  const [tutorias, setTutorias] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchTutorias = async () => {
      try {
        const response = await fetch(TUTORIAS_URL, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
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
