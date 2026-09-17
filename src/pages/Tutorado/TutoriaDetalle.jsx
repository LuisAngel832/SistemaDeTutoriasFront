import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { Pagina } from '../../components/layout/Pagina'
import { Button } from '../../components/ui'
import { ROUTES } from '../../constants/routes'
import Comentarios from '../../features/comentarios/Comentarios'
import {
  DetalleCargando,
  DetalleError,
  DetalleTutoriaLayout,
  EncabezadoTutoria,
  ListaTemas,
  SeccionTutoria,
} from '../../features/tutorias/components/DetalleTutoria'
import { PanelInscripcion } from '../../features/tutorias/components/PanelInscripcion'
import { TutoriaInfoGrid } from '../../features/tutorias/components/TutoriaInfoGrid'
import { useAhora } from '../../hooks/useAhora'
import { useTutoriaDetalleTutorado } from '../../hooks/useTutoriaDetalleTutorado'
import { minutosHasta } from '../../utils/fechas'

const TutoriaDetalle = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { tutoria, inscripcion, isLoading, error, isSubmitting, inscribirse, cancelarInscripcion } =
    useTutoriaDetalleTutorado(id)
  const ahora = useAhora()

  // Si se llego por un enlace directo no hay historial al que volver.
  const volverAtras = () =>
    location.key === 'default' ? navigate(ROUTES.tutorado.inicio) : navigate(-1)

  const volver = (
    <Button variant="secondary" size="sm" onClick={volverAtras}>
      ← Volver
    </Button>
  )

  if (isLoading) {
    return (
      <Pagina>
        <DetalleCargando back={volver} />
      </Pagina>
    )
  }

  if (error || !tutoria) {
    return (
      <Pagina>
        <DetalleError
          message={error || 'No se encontro la tutoria.'}
          to={ROUTES.tutorado.inicio}
          linkLabel="Volver a explorar"
        />
      </Pagina>
    )
  }

  const inscrito = Boolean(inscripcion)

  return (
    <Pagina>
      <DetalleTutoriaLayout
        back={volver}
        main={
          <>
            <EncabezadoTutoria tutoria={tutoria} />
            <TutoriaInfoGrid tutoria={tutoria} />

            {tutoria.temas?.length ? (
              <SeccionTutoria title="Temas a revisar">
                <ListaTemas temas={tutoria.temas} />
              </SeccionTutoria>
            ) : null}

            <SeccionTutoria
              title="Comentarios y sugerencias"
              description={
                inscrito ? undefined : 'Inscribete para sugerir temas u observaciones al tutor.'
              }
            >
              <Comentarios idTutoria={id} modo={inscrito ? 'tutorado' : 'lectura'} />
            </SeccionTutoria>
          </>
        }
        aside={
          <PanelInscripcion
            tutoria={tutoria}
            inscripcion={inscripcion}
            minutosRestantes={minutosHasta(tutoria.fecha, tutoria.horaInicio, ahora)}
            isSubmitting={isSubmitting}
            onInscribirse={inscribirse}
            onCancelar={cancelarInscripcion}
          />
        }
      />
    </Pagina>
  )
}

export default TutoriaDetalle
