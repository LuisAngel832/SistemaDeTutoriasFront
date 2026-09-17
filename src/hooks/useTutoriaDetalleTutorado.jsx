import { useCallback, useEffect, useState } from 'react'

const BASE_URL = import.meta.env.VITE_API_URL ?? ''

const getAuthHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${localStorage.getItem('token')}`,
})

const fetchJson = async (url, options = {}) => {
  const response = await fetch(url, options)
  const data = await response.json().catch(() => null)
  return { response, data }
}

const findInscripcion = async (idTutoria) => {
  const { response, data } = await fetchJson(`${BASE_URL}/asistencia/mis-inscripciones`, {
    method: 'GET',
    headers: getAuthHeaders(),
  })
  if (!response.ok) return null
  const inscripciones = data?.data || []
  const target = Number(idTutoria)

  return (
    inscripciones.find((item) => {
      const candidatos = [
        item.idTutoria,
        item.tutoria?.idTutoria,
        item.tutoria?.id,
        item.idTutoriaInscrita,
      ]
        .filter((v) => v != null)
        .map(Number)

      return candidatos.includes(target)
    }) || null
  )
}

export const useTutoriaDetalleTutorado = (id) => {
  const [tutoria, setTutoria] = useState(null)
  const [inscripcion, setInscripcion] = useState(null)
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
        const { response, data } = await fetchJson(`${BASE_URL}/tutoria/${id}`, {
          method: 'GET',
          headers: getAuthHeaders(),
        })

        if (!response.ok) {
          setError(data?.message || 'No se pudo cargar la tutoria')
          return
        }

        setTutoria(data?.data || null)
        const insc = await findInscripcion(id)
        setInscripcion(insc)
      } catch {
        setError('Error al conectar con el servidor')
      } finally {
        setIsLoading(false)
      }
    },
    [id],
  )

  useEffect(() => {
    fetchTutoria(true)
  }, [fetchTutoria])

  const inscribirse = async () => {
    setIsSubmitting(true)
    try {
      const { response, data } = await fetchJson(`${BASE_URL}/asistencia`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ idTutoria: Number(id) }),
      })

      if (!response.ok) {
        return { ok: false, message: data?.message || 'No fue posible inscribirse' }
      }

      await fetchTutoria(false)
      // El backend responde "Asistencia marcada.", que confunde al tutorado.
      return { ok: true, message: 'Te inscribiste a la tutoria.' }
    } catch {
      return { ok: false, message: 'Error al conectar con el servidor' }
    } finally {
      setIsSubmitting(false)
    }
  }

  const cancelarInscripcion = async () => {
    setIsSubmitting(true)
    try {
      const insc = inscripcion || (await findInscripcion(id))
      const idAsistencia = insc?.idAsistencia
      if (!idAsistencia) {
        return { ok: false, message: 'No tienes una inscripcion para cancelar' }
      }

      const { response, data } = await fetchJson(`${BASE_URL}/asistencia/${idAsistencia}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      })

      if (!response.ok) {
        return { ok: false, message: data?.message || 'No fue posible cancelar la inscripcion' }
      }

      await fetchTutoria(false)
      return { ok: true, message: 'Cancelaste tu inscripcion.' }
    } catch {
      return { ok: false, message: 'Error al conectar con el servidor' }
    } finally {
      setIsSubmitting(false)
    }
  }

  return {
    tutoria,
    inscripcion,
    isLoading,
    error,
    isSubmitting,
    inscribirse,
    cancelarInscripcion,
    recargar: () => fetchTutoria(true),
  }
}
