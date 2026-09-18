import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { horariosApi } from '../api/horarios'
import { materiasApi } from '../api/materias'
import { clavesHorarios, clavesMaterias, clavesTutorias } from '../api/queryKeys'
import { tutoriasApi } from '../api/tutorias'

const VALORES_INICIALES = { nrc: '', idHorario: '', fecha: '', edificio: '', aula: '' }

const useCrearTutoria = () => {
  const queryClient = useQueryClient()
  const [valores, setValores] = useState(VALORES_INICIALES)
  const [temas, setTemas] = useState([])
  // { ok, message } del ultimo intento de crear la tutoria.
  const [resultado, setResultado] = useState(null)

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

  const cambiar = (campo, valor) => {
    setValores((actuales) => ({ ...actuales, [campo]: valor }))
    setResultado((actual) => (actual?.ok === false ? null : actual))
  }

  const agregarTema = (tema) => {
    const limpio = tema.trim()
    if (!limpio) return
    setTemas((actuales) =>
      actuales.some((t) => t.toLowerCase() === limpio.toLowerCase())
        ? actuales
        : [...actuales, limpio],
    )
  }

  const quitarTema = (tema) => setTemas((actuales) => actuales.filter((t) => t !== tema))

  const reset = () => {
    setValores(VALORES_INICIALES)
    setTemas([])
    setResultado(null)
  }

  const crear = async () => {
    if (Object.values(valores).some((valor) => !valor)) {
      setResultado({ ok: false, message: 'Completa todos los campos obligatorios.' })
      return
    }

    try {
      await crearTutoria.mutateAsync({
        idHorario: Number(valores.idHorario),
        fecha: valores.fecha,
        edificio: Number(valores.edificio),
        aula: Number(valores.aula),
        nrc: Number(valores.nrc),
        temas,
      })
      setValores(VALORES_INICIALES)
      setTemas([])
      setResultado({
        ok: true,
        message: 'La tutoría quedó programada y ya es visible para los tutorados.',
      })
    } catch (error) {
      setResultado({ ok: false, message: error.message })
    }
  }

  return {
    valores,
    cambiar,
    temas,
    agregarTema,
    quitarTema,
    reset,
    crear,
    resultado,
    cerrarResultado: () => setResultado(null),
    horarios: horariosQuery.data ?? [],
    materias: materiasQuery.data ?? [],
    cargandoListas: horariosQuery.isPending || materiasQuery.isPending,
    isSubmitting: crearTutoria.isPending,
  }
}

export default useCrearTutoria
