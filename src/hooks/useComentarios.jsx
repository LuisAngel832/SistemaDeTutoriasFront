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

const useComentarios = (idTutoria) => {
  const [comentarios, setComentarios] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  const cargar = useCallback(
    async (showLoading = true) => {
      if (!idTutoria) return
      if (showLoading) setIsLoading(true)
      setError('')

      try {
        const { response, data } = await fetchJson(
          `${BASE_URL}/comentarios/tutoria/${idTutoria}`,
          { method: 'GET', headers: getAuthHeaders() },
        )

        if (!response.ok) {
          setError(data?.message || 'No se pudieron cargar los comentarios')
          return
        }

        setComentarios(data?.data || [])
      } catch {
        setError('Error al conectar con el servidor')
      } finally {
        setIsLoading(false)
      }
    },
    [idTutoria],
  )

  useEffect(() => {
    cargar(true)
  }, [cargar])

  const crear = async (comentario) => {
    const texto = (comentario || '').trim()
    if (!texto) return { ok: false, message: 'El comentario no puede estar vacio' }

    try {
      const { response, data } = await fetchJson(`${BASE_URL}/comentarios`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ idTutoria: Number(idTutoria), comentario: texto }),
      })

      if (!response.ok) {
        return { ok: false, message: data?.message || 'No se pudo registrar el comentario' }
      }

      await cargar(false)
      return { ok: true, message: data?.message || 'Comentario publicado' }
    } catch {
      return { ok: false, message: 'Error al conectar con el servidor' }
    }
  }

  const eliminar = async (idComentario) => {
    if (!idComentario) return { ok: false, message: 'Comentario invalido' }
    try {
      const { response, data } = await fetchJson(
        `${BASE_URL}/comentarios/${idComentario}`,
        { method: 'DELETE', headers: getAuthHeaders() },
      )
      if (!response.ok) {
        return { ok: false, message: data?.message || 'No se pudo eliminar el comentario' }
      }
      await cargar(false)
      return { ok: true, message: data?.message || 'Comentario eliminado' }
    } catch {
      return { ok: false, message: 'Error al conectar con el servidor' }
    }
  }

  return {
    comentarios,
    isLoading,
    error,
    crear,
    eliminar,
    recargar: () => cargar(true),
  }
}

export default useComentarios
