import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { adminApi } from '@/api/admin'
import { clavesAdmin } from '@/api/queryKeys'
import { ejecutarMutacion } from '@/utils/ejecutarMutacion'

// Lista de tutores autorizados: alta (pre-registro) y baja de quienes aun no crean su cuenta.
export const useTutores = () => {
  const queryClient = useQueryClient()
  // Tambien refresca el filtro "Todos los tutores" de la pantalla 15.
  const invalidar = () => queryClient.invalidateQueries({ queryKey: clavesAdmin.tutores() })

  const tutoresQuery = useQuery({
    queryKey: clavesAdmin.tutores(),
    queryFn: ({ signal }) => adminApi.tutores({ signal }),
  })

  const autorizarM = useMutation({ mutationFn: adminApi.autorizarTutor, onSuccess: invalidar })
  const quitarM = useMutation({ mutationFn: adminApi.quitarTutor, onSuccess: invalidar })

  return {
    tutores: Array.isArray(tutoresQuery.data) ? tutoresQuery.data : [],
    isLoading: tutoresQuery.isPending,
    error: tutoresQuery.error?.message ?? '',
    autorizando: autorizarM.isPending,
    quitando: quitarM.isPending,
    autorizar: (datos) => ejecutarMutacion(autorizarM, datos, 'Tutor autorizado.'),
    quitar: (matricula) => ejecutarMutacion(quitarM, matricula, 'Pre-registro eliminado.'),
  }
}
