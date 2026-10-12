import { useMutation, useQueryClient } from '@tanstack/react-query'
import { clavesAdmin, clavesSesiones, clavesTutorias } from '@/api/queryKeys'
import { sesionesApi } from '@/api/sesiones'
import { ejecutarMutacion } from '@/utils/ejecutarMutacion'

// Abrir el pase de lista y cancelar una sesion (pantallas 09 y 11). Ambas crean la sesion en
// el backend, asi que se refrescan las sesiones de hoy y las de la tutoria.
export const useAccionesSesion = () => {
  const queryClient = useQueryClient()

  const invalidar = () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: clavesSesiones.todas }),
      queryClient.invalidateQueries({ queryKey: clavesTutorias.todas }),
      queryClient.invalidateQueries({ queryKey: clavesAdmin.todas }),
    ])

  const abrirM = useMutation({
    mutationFn: sesionesApi.abrirLista,
    onSuccess: (lista) => {
      // La respuesta ya es la lista: se guarda para no pedirla otra vez al navegar.
      const idSesion = lista?.sesion?.idSesion
      if (idSesion != null) queryClient.setQueryData(clavesSesiones.lista(idSesion), lista)
      return invalidar()
    },
  })
  const cancelarM = useMutation({ mutationFn: sesionesApi.cancelar, onSuccess: invalidar })

  // sesion: { idHorario, fecha }. Devuelve { ok, message, idSesion }.
  const abrirLista = async (sesion) => {
    try {
      const lista = await abrirM.mutateAsync({ idHorario: sesion.idHorario, fecha: sesion.fecha })
      return { ok: true, message: 'Pase de lista abierto.', idSesion: lista?.sesion?.idSesion }
    } catch (error) {
      return { ok: false, message: error.message }
    }
  }

  const cancelar = (sesion) =>
    ejecutarMutacion(
      cancelarM,
      { idHorario: sesion.idHorario, fecha: sesion.fecha },
      'Sesión cancelada. Avisamos por correo a los tutorados.',
    )

  return {
    abrirLista,
    cancelar,
    abriendo: abrirM.isPending,
    cancelando: cancelarM.isPending,
  }
}
