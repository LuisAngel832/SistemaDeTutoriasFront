import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { clavesAdmin, clavesSesiones, clavesTutorias } from '@/api/queryKeys'
import { sesionesApi } from '@/api/sesiones'
import { ejecutarMutacion } from '@/utils/ejecutarMutacion'

// Pase de lista de una sesion (pantallas 12 y 13). Cada marca se guarda al momento (PUT
// parcial) y la respuesta, que es la lista completa, reemplaza la que hay en cache.
export const usePaseDeLista = (idSesion) => {
  const queryClient = useQueryClient()
  const clave = clavesSesiones.lista(idSesion)

  const listaQuery = useQuery({
    queryKey: clave,
    queryFn: ({ signal }) => sesionesApi.lista(idSesion, { signal }),
  })

  const marcarM = useMutation({
    mutationFn: (marcas) => sesionesApi.guardarMarcas(idSesion, marcas),
    // La marca se ve de inmediato; si el backend la rechaza se vuelve a pedir la lista.
    onMutate: async (marcas) => {
      await queryClient.cancelQueries({ queryKey: clave })
      const anterior = queryClient.getQueryData(clave)
      if (anterior) {
        const nuevas = new Map(marcas.map((marca) => [marca.matricula, marca.asistio]))
        queryClient.setQueryData(clave, {
          ...anterior,
          tutorados: anterior.tutorados.map((tutorado) =>
            nuevas.has(tutorado.matricula)
              ? { ...tutorado, asistio: nuevas.get(tutorado.matricula) }
              : tutorado,
          ),
        })
      }
      return { anterior }
    },
    onSuccess: (lista) => {
      if (lista) queryClient.setQueryData(clave, lista)
    },
    onError: (_error, _marcas, contexto) => {
      if (contexto?.anterior) queryClient.setQueryData(clave, contexto.anterior)
      queryClient.invalidateQueries({ queryKey: clave })
    },
  })

  const cerrarM = useMutation({
    mutationFn: () => sesionesApi.cerrarLista(idSesion),
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: clavesSesiones.todas }),
        queryClient.invalidateQueries({ queryKey: clavesTutorias.todas }),
        queryClient.invalidateQueries({ queryKey: clavesAdmin.todas }),
      ]),
  })

  const marcar = (marcas) => ejecutarMutacion(marcarM, marcas)

  // Con exito, `resultado` trae { asistieron, noAsistieron, bajasAplicadas }.
  const cerrar = () => ejecutarMutacion(cerrarM, undefined, 'Pase de lista cerrado.')

  return {
    lista: listaQuery.data ?? null,
    isLoading: listaQuery.isPending,
    error: listaQuery.error?.message ?? '',
    guardando: marcarM.isPending,
    cerrando: cerrarM.isPending,
    marcar,
    cerrar,
  }
}
