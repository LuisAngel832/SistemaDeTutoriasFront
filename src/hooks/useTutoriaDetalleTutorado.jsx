import { useCallback, useEffect, useState } from 'react'

const BASE_URL = 'https://backtutorias.onrender.com'

const getAuthHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${localStorage.getItem('token')}`,
})

const fetchJson = async (url, options = {}) => {
  const response = await fetch(url, options)
  const data = await response.json()
  return { response, data }
}

export const useTutoriaDetalleTutorado = (id) => {
  const [tutoria, setTutoria] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const fetchTutoria = useCallback(
    async (showLoading = true) => {
      if (showLoading) {
        setIsLoading(true)
      }
      setError('')

      try {
        const { response, data } = await fetchJson(`${BASE_URL}/tutorias/${id}`, {
          method: 'GET',
          headers: getAuthHeaders(),
        })

        if (!response.ok) {
          setError(data?.message || 'No se pudo cargar la tutoria')
          return
        }

        setTutoria(data?.data || null)
      } catch {
        setError('Error al conectar con el servidor')
      } finally {
        setIsLoading(false)
      }
    },
    [id],
  )

  useEffect(() => {
    const fetchInitialTutoria = async () => {
      try {
        const { response, data } = await fetchJson(`${BASE_URL}/tutorias/${id}`, {
          method: 'GET',
          headers: getAuthHeaders(),
        })

        if (!response.ok) {
          setError(data?.message || 'No se pudo cargar la tutoria')
          return
        }

        setTutoria(data?.data || null)
      } catch {
        setError('Error al conectar con el servidor')
      } finally {
        setIsLoading(false)
      }
    }

    fetchInitialTutoria()
  }, [id])

  const inscribirse = async () => {
    setIsSubmitting(true)
    try {
      const { response, data } = await fetchJson(`${BASE_URL}/tutorado/inscribirse/${id}`, {
        method: 'POST',
        headers: getAuthHeaders(),
      })

      if (!response.ok) {
        return data?.message || 'No fue posible inscribirse'
      }

      await fetchTutoria(false)
      return data?.message || 'Inscripcion realizada'
    } catch {
      return 'Error al conectar con el servidor'
    } finally {
      setIsSubmitting(false)
    }
  }

  const cancelarInscripcion = async () => {
    setIsSubmitting(true)
    try {
      const { response, data } = await fetchJson(`${BASE_URL}/tutorado/cancelar/${id}`, {
        method: 'POST',
        headers: getAuthHeaders(),
      })

      if (!response.ok) {
        return data?.message || 'No fue posible cancelar la inscripcion'
      }

      await fetchTutoria(false)
      return data?.message || 'Inscripcion cancelada'
    } catch {
      return 'Error al conectar con el servidor'
    } finally {
      setIsSubmitting(false)
    }
  }

  return {
    tutoria,
    isLoading,
    error,
    isSubmitting,
    inscribirse,
    cancelarInscripcion,
    recargar: () => fetchTutoria(true),
  }
}
