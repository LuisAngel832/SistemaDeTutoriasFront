import { useMutation, useQueryClient } from '@tanstack/react-query'
import { clavesAdmin, clavesMaterias, clavesSesiones, clavesTutorias } from '@/api/queryKeys'
import { tutoriasApi } from '@/api/tutorias'
import { aPayloadTutoria } from '@/schemas/tutoria'

// Crea (sin idTutoria) o edita una tutoria. Devuelve { ok, message, tutoria }.
export const useGuardarTutoria = (idTutoria) => {
  const queryClient = useQueryClient()
  const editar = idTutoria != null

  const mutacion = useMutation({
    mutationFn: (datos) => {
      const payload = aPayloadTutoria(datos, { editar })
      return editar ? tutoriasApi.actualizar(idTutoria, payload) : tutoriasApi.crear(payload)
    },
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: clavesTutorias.todas }),
        queryClient.invalidateQueries({ queryKey: clavesSesiones.todas }),
        // El catalogo de EE muestra cuantas tutorias activas tiene cada una.
        queryClient.invalidateQueries({ queryKey: clavesMaterias.todas }),
        queryClient.invalidateQueries({ queryKey: clavesAdmin.todas }),
      ]),
  })

  const guardar = async (datos) => {
    try {
      const tutoria = await mutacion.mutateAsync(datos)
      return { ok: true, message: editar ? 'Tutoría actualizada.' : 'Tutoría creada.', tutoria }
    } catch (error) {
      return { ok: false, message: error.message }
    }
  }

  return { guardar }
}
