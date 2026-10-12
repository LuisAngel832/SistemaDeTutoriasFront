import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { materiasApi } from '@/api/materias'
import { clavesAdmin, clavesMaterias } from '@/api/queryKeys'

// Envuelve una mutacion: { ok, message } o { ok: false, message, errores } con los errores
// por campo del backend (NRC duplicado).
const ejecutar = async (mutacion, variables, mensajeExito) => {
  try {
    await mutacion.mutateAsync(variables)
    return { ok: true, message: mensajeExito }
  } catch (error) {
    return { ok: false, message: error.message, errores: error.errores ?? {} }
  }
}

// Catalogo de Experiencias Educativas (pantalla 16).
export const useExperiencias = (q) => {
  const queryClient = useQueryClient()
  const invalidar = () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: clavesMaterias.todas }),
      queryClient.invalidateQueries({ queryKey: clavesAdmin.todas }),
    ])

  const listaQuery = useQuery({
    queryKey: clavesMaterias.lista(q),
    queryFn: ({ signal }) => materiasApi.listar({ q }, { signal }),
    placeholderData: keepPreviousData,
  })

  const crearM = useMutation({ mutationFn: materiasApi.crear, onSuccess: invalidar })
  const actualizarM = useMutation({
    mutationFn: ({ idMateria, ...datos }) => materiasApi.actualizar(idMateria, datos),
    onSuccess: invalidar,
  })
  const eliminarM = useMutation({ mutationFn: materiasApi.eliminar, onSuccess: invalidar })

  return {
    materias: Array.isArray(listaQuery.data) ? listaQuery.data : [],
    isLoading: listaQuery.isPending,
    error: listaQuery.error?.message ?? '',
    guardando: crearM.isPending || actualizarM.isPending,
    eliminando: eliminarM.isPending,
    crear: (datos) => ejecutar(crearM, datos, 'Experiencia educativa creada.'),
    actualizar: (idMateria, datos) =>
      ejecutar(actualizarM, { idMateria, ...datos }, 'Experiencia educativa actualizada.'),
    eliminar: (idMateria) => ejecutar(eliminarM, idMateria, 'Experiencia educativa eliminada.'),
  }
}
