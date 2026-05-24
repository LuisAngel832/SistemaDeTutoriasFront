import { useEffect, useState } from 'react'

const BASE_URL = import.meta.env.VITE_API_URL ?? ''

const getAuthHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${localStorage.getItem('token')}`,
})

const normalizar = (h) => ({
  ...h,
  idHorario: h.idHorario ?? h.id ?? h.idHorarios ?? h.horarioId,
})

const useHorarios = () => {
  const [horarios, setHorarios] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchHorarios = async () => {
    setIsLoading(true)
    setError('')
    try {
      const response = await fetch(`${BASE_URL}/horario`, {
        method: 'GET',
        headers: getAuthHeaders(),
      })
      const body = await response.json().catch(() => null)

      if (!response.ok) {
        setError(body?.message || 'No se pudieron cargar los horarios')
        return
      }

      setHorarios((body?.data || []).map(normalizar))
    } catch {
      setError('Error al conectar con el servidor')
    } finally {
      setIsLoading(false)
    }
  }

  const crearHorario = async (payload) => {
    const response = await fetch(`${BASE_URL}/horario`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    })
    const body = await response.json().catch(() => null)
    if (!response.ok) {
      throw new Error(body?.message || 'No se pudo agregar el horario')
    }
    await fetchHorarios()
    return body
  }

  const eliminarHorario = async (idHorario) => {
    const response = await fetch(`${BASE_URL}/horario/${idHorario}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    })
    const body = await response.json().catch(() => null)
    if (!response.ok) {
      throw new Error(body?.message || 'No se pudo eliminar el horario')
    }
    await fetchHorarios()
  }

  useEffect(() => {
    fetchHorarios()
  }, [])

  return {
    horarios,
    isLoading,
    error,
    refetch: fetchHorarios,
    crearHorario,
    eliminarHorario,
  }
}

export default useHorarios
