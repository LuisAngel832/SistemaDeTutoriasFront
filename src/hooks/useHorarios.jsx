import { horariosApi } from '../api/horarios'
import { useRecurso } from './useRecurso'

const useHorarios = () => {
  const {
    datos: horarios,
    isLoading,
    error,
    recargar,
    refrescar,
  } = useRecurso(horariosApi.listar, [])

  // Lanzan ApiError si el backend rechaza la operacion (el formulario muestra el mensaje).
  const crearHorario = async (payload) => {
    await horariosApi.crear(payload)
    await refrescar()
  }

  const eliminarHorario = async (idHorario) => {
    await horariosApi.eliminar(idHorario)
    await refrescar()
  }

  return {
    horarios,
    isLoading,
    error,
    refetch: recargar,
    crearHorario,
    eliminarHorario,
  }
}

export default useHorarios
