import { useQuery } from '@tanstack/react-query'
import { catalogosApi } from '@/api/catalogos'
import { materiasApi } from '@/api/materias'
import { clavesCatalogos, clavesMaterias } from '@/api/queryKeys'

// Catalogos del formulario de tutoria: Experiencias Educativas y edificios con sus aulas.
// Cambian poco, asi que se conservan unos minutos.
export const useCatalogosTutoria = () => {
  const materiasQuery = useQuery({
    queryKey: clavesMaterias.lista(),
    queryFn: ({ signal }) => materiasApi.listar({}, { signal }),
    staleTime: 5 * 60_000,
  })
  const edificiosQuery = useQuery({
    queryKey: clavesCatalogos.edificios(),
    queryFn: ({ signal }) => catalogosApi.edificios({ signal }),
    staleTime: 30 * 60_000,
  })

  return {
    materias: Array.isArray(materiasQuery.data) ? materiasQuery.data : [],
    edificios: Array.isArray(edificiosQuery.data) ? edificiosQuery.data : [],
    cargando: materiasQuery.isPending || edificiosQuery.isPending,
    error: materiasQuery.error?.message || edificiosQuery.error?.message || '',
  }
}
