import { useQuery } from '@tanstack/react-query'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { PanelFormulario, Pagina } from '@/components/layout/Pagina'
import { Alert, Button, Skeleton } from '@/components/ui'
import { IconCrear } from '@/components/ui/icons'
import { clavesTutorias } from '@/api/queryKeys'
import { tutoriasApi } from '@/api/tutorias'
import { ROUTES } from '@/constants/routes'
import { ESTADO_TUTORIA } from '@/constants/tutoria'
import { FormularioTutoria } from '@/features/tutor/components/FormularioTutoria'
import { useCatalogosTutoria } from '@/features/tutor/hooks/useCatalogosTutoria'
import { useGuardarTutoria } from '@/features/tutor/hooks/useGuardarTutoria'
import { ordenarHorarios } from '@/utils/formatters'

// Datos del detalle -> valores del formulario (los selects trabajan con strings).
const aValores = (tutoria) => ({
  idMateria: String(tutoria.materia?.idMateria ?? ''),
  edificio: String(tutoria.edificio ?? ''),
  aula: String(tutoria.aula ?? ''),
  horarios: ordenarHorarios(tutoria.horarios).map((horario) => ({
    idHorario: horario.idHorario ?? null,
    dia: horario.dia,
    horaInicio: horario.horaInicio,
    horaFin: horario.horaFin,
    temas: (horario.temas ?? []).map((tema) => tema.tema),
  })),
})

// Edicion de una tutoria (diseno propio sobre la pantalla 10). Solo se permite sin inscritos
// activos (RN-5); los temas se editan en linea desde el detalle.
const EditarTutoria = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const catalogos = useCatalogosTutoria()
  const { guardar } = useGuardarTutoria(id)
  const {
    data: tutoria,
    isPending,
    error,
  } = useQuery({
    queryKey: clavesTutorias.detalle(id),
    queryFn: ({ signal }) => tutoriasApi.detalle(id, { signal }),
  })

  const volver = (
    <Button as={Link} to={ROUTES.tutor.detalle(id)} variant="secondary" size="sm">
      ← Volver al detalle
    </Button>
  )

  const actualizar = async (datos) => {
    const res = await guardar(datos)
    if (res.ok) {
      toast.success(res.message)
      navigate(ROUTES.tutor.detalle(id))
    }
    return res
  }

  let contenido
  if (isPending) {
    contenido = <Skeleton height={480} />
  } else if (error || !tutoria) {
    contenido = <Alert tone="error">{error?.message || 'No encontramos esta tutoría.'}</Alert>
  } else if (tutoria.estado !== ESTADO_TUTORIA.ACTIVA) {
    contenido = <Alert tone="warning">La tutoría no está activa: ya no se puede editar.</Alert>
  } else if ((tutoria.cupo?.ocupados ?? 0) > 0) {
    contenido = (
      <Alert tone="warning" title="Tiene tutorados inscritos">
        Solo puedes cambiar horarios o lugar sin tutorados inscritos. Los temas sí se pueden editar
        desde el detalle de la tutoría.
      </Alert>
    )
  } else {
    contenido = (
      <FormularioTutoria
        editar
        valoresIniciales={aValores(tutoria)}
        materias={
          catalogos.materias.length ? catalogos.materias : tutoria.materia ? [tutoria.materia] : []
        }
        edificios={catalogos.edificios}
        cargandoCatalogos={catalogos.cargando}
        textoEnviar="Guardar cambios"
        onEnviar={actualizar}
      />
    )
  }

  return (
    <Pagina width="form">
      <div>{volver}</div>
      <PanelFormulario
        title="Editar tutoría"
        subtitle={
          tutoria?.materia
            ? `${tutoria.materia.nombre} · NRC ${tutoria.materia.nrc}`
            : 'Cambia el lugar o los horarios de la tutoría.'
        }
        icon={<IconCrear />}
      >
        {catalogos.error ? <Alert tone="error">{catalogos.error}</Alert> : null}
        {contenido}
      </PanelFormulario>
    </Pagina>
  )
}

export default EditarTutoria
