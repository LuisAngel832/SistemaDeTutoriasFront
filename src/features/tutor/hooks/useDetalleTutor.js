import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { clavesAdmin, clavesMaterias, clavesSesiones, clavesTutorias } from '@/api/queryKeys'
import { temasApi } from '@/api/temas'
import { tutoriasApi } from '@/api/tutorias'
import { ejecutarMutacion } from '@/utils/ejecutarMutacion'

// Dias de sesiones futuras (virtuales) que se muestran en el detalle.
const DIAS_SESIONES = 7

// Detalle de una tutoria para su tutor (pantalla 11): datos, sesiones e inscritos, mas las
// acciones sobre temas y el estado de la tutoria.
export const useDetalleTutor = (idTutoria) => {
  const queryClient = useQueryClient()

  const detalleQuery = useQuery({
    queryKey: clavesTutorias.detalle(idTutoria),
    queryFn: ({ signal }) => tutoriasApi.detalle(idTutoria, { signal }),
  })
  const sesionesQuery = useQuery({
    queryKey: clavesTutorias.sesiones(idTutoria),
    queryFn: ({ signal }) => tutoriasApi.sesiones(idTutoria, { dias: DIAS_SESIONES }, { signal }),
  })
  const inscritosQuery = useQuery({
    queryKey: clavesTutorias.inscritos(idTutoria),
    queryFn: ({ signal }) => tutoriasApi.inscritos(idTutoria, { signal }),
  })

  const refrescarDetalle = () =>
    queryClient.invalidateQueries({ queryKey: clavesTutorias.detalle(idTutoria) })

  const agregarTemaM = useMutation({
    mutationFn: ({ idHorario, tema }) => temasApi.agregar(idHorario, tema),
    onSuccess: refrescarDetalle,
  })
  const quitarTemaM = useMutation({ mutationFn: temasApi.eliminar, onSuccess: refrescarDetalle })
  const desactivarM = useMutation({
    mutationFn: () => tutoriasApi.desactivar(idTutoria),
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: clavesTutorias.todas }),
        queryClient.invalidateQueries({ queryKey: clavesSesiones.todas }),
        queryClient.invalidateQueries({ queryKey: clavesMaterias.todas }),
        queryClient.invalidateQueries({ queryKey: clavesAdmin.todas }),
      ]),
  })

  return {
    tutoria: detalleQuery.data ?? null,
    sesiones: Array.isArray(sesionesQuery.data) ? sesionesQuery.data : [],
    inscritos: inscritosQuery.data ?? null,
    isLoading: detalleQuery.isPending,
    cargandoSesiones: sesionesQuery.isPending,
    error: detalleQuery.error?.message ?? '',
    errorSesiones: sesionesQuery.error?.message ?? '',
    ocupado: agregarTemaM.isPending || quitarTemaM.isPending,
    desactivando: desactivarM.isPending,
    agregarTema: (horario, tema) =>
      ejecutarMutacion(agregarTemaM, { idHorario: horario.idHorario, tema }, 'Tema agregado.'),
    quitarTema: (tema) => ejecutarMutacion(quitarTemaM, tema.idTema, 'Tema eliminado.'),
    desactivar: () =>
      ejecutarMutacion(
        desactivarM,
        undefined,
        'Tutoría desactivada. Avisamos por correo a los inscritos.',
      ),
  }
}
