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

const useTutoriaDetalleTutor = (id) => {
  const [tutoria, setTutoria] = useState(null)
  const [inscritos, setInscritos] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const fetchTutoria = useCallback(
    async (showLoading = true) => {
      if (showLoading) setIsLoading(true)
      setError('')

      try {
        const [det, ins] = await Promise.all([
          fetchJson(`${BASE_URL}/tutoria/${id}`, {
            method: 'GET',
            headers: getAuthHeaders(),
          }),
          fetchJson(`${BASE_URL}/asistencia/tutoria/${id}`, {
            method: 'GET',
            headers: getAuthHeaders(),
          }),
        ])

        if (!det.response.ok) {
          setError(det.data?.message || 'No se pudo cargar la tutoria')
          return
        }

        setTutoria(det.data?.data || null)

        if (ins.response.ok) {
          setInscritos(ins.data?.data || [])
        } else {
          setInscritos([])
        }
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

  const actualizar = async (payload) => {
    setIsSubmitting(true)
    try {
      const { response, data } = await fetchJson(`${BASE_URL}/tutoria/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      })
      if (!response.ok) {
        return { ok: false, message: data?.message || 'No se pudo actualizar' }
      }
      await fetchTutoria(false)
      return { ok: true, message: data?.message || 'Tutoria actualizada' }
    } catch {
      return { ok: false, message: 'Error al conectar con el servidor' }
    } finally {
      setIsSubmitting(false)
    }
  }

  const cancelar = async () => {
    setIsSubmitting(true)
    try {
      const { response, data } = await fetchJson(`${BASE_URL}/tutoria/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      })
      if (!response.ok) {
        return { ok: false, message: data?.message || 'No se pudo cancelar la tutoria' }
      }
      await fetchTutoria(false)
      return { ok: true, message: data?.message || 'Tutoria cancelada' }
    } catch {
      return { ok: false, message: 'Error al conectar con el servidor' }
    } finally {
      setIsSubmitting(false)
    }
  }

  const agregarTema = async (tema) => {
    const limpio = (tema || '').trim()
    if (!limpio) return { ok: false, message: 'El tema no puede estar vacio' }
    try {
      const { response, data } = await fetchJson(`${BASE_URL}/temas`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ idTutoria: Number(id), tema: limpio }),
      })
      if (!response.ok) {
        return { ok: false, message: data?.message || 'No se pudo crear el tema' }
      }
      await fetchTutoria(false)
      return { ok: true, message: data?.message || 'Tema creado' }
    } catch {
      return { ok: false, message: 'Error al conectar con el servidor' }
    }
  }

  const quitarTema = async (idTema) => {
    if (!idTema) return { ok: false, message: 'Tema invalido' }
    try {
      const { response, data } = await fetchJson(`${BASE_URL}/temas/${idTema}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      })
      if (!response.ok) {
        return { ok: false, message: data?.message || 'No se pudo eliminar el tema' }
      }
      await fetchTutoria(false)
      return { ok: true, message: data?.message || 'Tema eliminado' }
    } catch {
      return { ok: false, message: 'Error al conectar con el servidor' }
    }
  }

  const completar = async () => {
    setIsSubmitting(true)
    try {
      const { response, data } = await fetchJson(`${BASE_URL}/tutoria/completar/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
      })
      if (!response.ok) {
        return { ok: false, message: data?.message || 'No se pudo completar la tutoria' }
      }
      await fetchTutoria(false)
      return { ok: true, message: data?.message || 'Tutoria marcada como completada' }
    } catch {
      return { ok: false, message: 'Error al conectar con el servidor' }
    } finally {
      setIsSubmitting(false)
    }
  }

  return {
    tutoria,
    inscritos,
    isLoading,
    error,
    isSubmitting,
    actualizar,
    cancelar,
    completar,
    agregarTema,
    quitarTema,
    recargar: () => fetchTutoria(true),
  }
}

export default useTutoriaDetalleTutor
