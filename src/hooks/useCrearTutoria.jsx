import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { horariosApi } from '../api/horarios'
import { materiasApi } from '../api/materias'
import { clavesHorarios, clavesMaterias, clavesTutorias } from '../api/queryKeys'
import { tutoriasApi } from '../api/tutorias'
import { ejecutarMutacion } from './ejecutarMutacion'

const MENSAJE_EXITO = 'La tutoría quedó programada y ya es visible para los tutorados.'

// Listas y mutacion que necesita el formulario de crear tutoria.
// El estado del formulario lo maneja react-hook-form en la pantalla.
const useCrearTutoria = () => {
  const queryClient = useQueryClient()

  // Si fallan, el formulario muestra los selects vacios con su aviso.
  const horariosQuery = useQuery({
    queryKey: clavesHorarios.lista(),
    queryFn: ({ signal }) => horariosApi.listar({ signal }),
  })
  const materiasQuery = useQuery({
    queryKey: clavesMaterias.lista(),
    queryFn: ({ signal }) => materiasApi.listar({ signal }),
    // El catalogo de experiencias educativas cambia poco.
    staleTime: 5 * 60_000,
  })

  const crearTutoria = useMutation({
    mutationFn: tutoriasApi.crear,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: clavesTutorias.todas }),
  })

  return {
    crear: (datos) => ejecutarMutacion(crearTutoria, datos, MENSAJE_EXITO),
    horarios: horariosQuery.data ?? [],
    materias: materiasQuery.data ?? [],
    cargandoListas: horariosQuery.isPending || materiasQuery.isPending,
    isSubmitting: crearTutoria.isPending,
  }
}

export default useCrearTutoria
