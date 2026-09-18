import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { horariosApi } from '../api/horarios'
import { clavesHorarios } from '../api/queryKeys'

const useHorarios = () => {
  const queryClient = useQueryClient()
  const invalidar = () => queryClient.invalidateQueries({ queryKey: clavesHorarios.todos })

  const { data, isPending, error, refetch } = useQuery({
    queryKey: clavesHorarios.lista(),
    queryFn: ({ signal }) => horariosApi.listar({ signal }),
  })

  // Lanzan ApiError si el backend rechaza la operacion (la pantalla muestra el mensaje).
  const crear = useMutation({ mutationFn: horariosApi.crear, onSuccess: invalidar })
  const eliminar = useMutation({ mutationFn: horariosApi.eliminar, onSuccess: invalidar })

  return {
    horarios: data ?? [],
    isLoading: isPending,
    error: error?.message ?? '',
    refetch,
    crearHorario: crear.mutateAsync,
    creando: crear.isPending,
    eliminarHorario: eliminar.mutateAsync,
    // Id del horario que se esta eliminando (para deshabilitar solo ese boton).
    eliminandoId: eliminar.isPending ? eliminar.variables : null,
  }
}

export default useHorarios
