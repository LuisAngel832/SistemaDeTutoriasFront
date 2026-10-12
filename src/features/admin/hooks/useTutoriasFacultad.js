import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { adminApi } from '@/api/admin'
import {
  clavesAdmin,
  clavesInscripciones,
  clavesMaterias,
  clavesSesiones,
  clavesTutorias,
} from '@/api/queryKeys'
import { tutoriasApi } from '@/api/tutorias'
import { ejecutarMutacion } from '@/utils/ejecutarMutacion'
import { inicioDePeriodo } from '@/utils/fechas'

// Pantalla 15: indicadores, tabla filtrada y tutores, mas desactivar una tutoria o todas
// (cierre de periodo). Las bajas automaticas se cuentan desde el inicio del periodo escolar.
export const useTutoriasFacultad = (filtros) => {
  const queryClient = useQueryClient()
  const desde = inicioDePeriodo()

  const resumenQuery = useQuery({
    queryKey: clavesAdmin.resumen(desde),
    queryFn: ({ signal }) => adminApi.resumen({ desde }, { signal }),
  })
  const tutoriasQuery = useQuery({
    queryKey: clavesAdmin.tutorias(filtros),
    queryFn: ({ signal }) => adminApi.tutorias(filtros, { signal }),
    placeholderData: keepPreviousData,
  })
  const tutoresQuery = useQuery({
    queryKey: clavesAdmin.tutores(),
    queryFn: ({ signal }) => adminApi.tutores({ signal }),
    staleTime: 5 * 60_000,
  })

  const invalidar = () =>
    Promise.all(
      [clavesAdmin, clavesTutorias, clavesSesiones, clavesInscripciones, clavesMaterias].map(
        (claves) => queryClient.invalidateQueries({ queryKey: claves.todas }),
      ),
    )

  const desactivarM = useMutation({
    mutationFn: (idTutoria) => tutoriasApi.desactivar(idTutoria),
    onSuccess: invalidar,
  })
  const cierreM = useMutation({ mutationFn: adminApi.cerrarPeriodo, onSuccess: invalidar })

  const cerrarPeriodo = async () => {
    try {
      const data = await cierreM.mutateAsync()
      const total = data?.tutoriasDesactivadas
      return {
        ok: true,
        message:
          total == null
            ? 'Periodo cerrado.'
            : `Periodo cerrado: se desactivaron ${total} tutoría${total === 1 ? '' : 's'}.`,
      }
    } catch (error) {
      return { ok: false, message: error.message }
    }
  }

  return {
    desde,
    resumen: resumenQuery.data ?? null,
    tutorias: Array.isArray(tutoriasQuery.data) ? tutoriasQuery.data : [],
    tutores: Array.isArray(tutoresQuery.data) ? tutoresQuery.data : [],
    cargandoResumen: resumenQuery.isPending,
    cargandoTutorias: tutoriasQuery.isPending,
    actualizando: tutoriasQuery.isFetching && !tutoriasQuery.isPending,
    error: tutoriasQuery.error?.message || resumenQuery.error?.message || '',
    desactivando: desactivarM.isPending,
    cerrandoPeriodo: cierreM.isPending,
    desactivar: (tutoria) =>
      ejecutarMutacion(
        desactivarM,
        tutoria.idTutoria,
        `${tutoria.materia?.nombre} quedó desactivada. Avisamos por correo a sus inscritos.`,
      ),
    cerrarPeriodo,
  }
}
