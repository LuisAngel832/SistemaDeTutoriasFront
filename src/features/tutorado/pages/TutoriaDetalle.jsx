import { useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { Pagina } from '@/components/layout/Pagina'
import { Button } from '@/components/ui'
import { IconCalendario, IconEdificio, IconReloj, IconTutorias } from '@/components/ui/icons'
import { ROUTES } from '@/constants/routes'
import { ESTADO_PANEL, ESTADO_TUTORIA } from '@/constants/tutoria'
import { useAuth } from '@/features/auth/AuthContext'
import { Comentarios } from '@/features/comentarios/Comentarios'
import { BadgeEstado } from '@/features/tutorias/components/BadgeEstado'
import {
  DatosDetalle,
  DetalleCargando,
  DetalleError,
  DetalleTutoriaLayout,
  EncabezadoDetalle,
  SeccionTutoria,
} from '@/features/tutorias/components/DetalleTutoria'
import { HorariosYTemas } from '@/features/tutorias/components/HorariosYTemas'
import { ConfirmarInscripcion } from '@/features/tutorado/components/ConfirmarInscripcion'
import { PanelInscripcion } from '@/features/tutorado/components/PanelInscripcion'
import { TuSemana } from '@/features/tutorado/components/TuSemana'
import { useDetalleTutoria } from '@/features/tutorado/hooks/useDetalleTutoria'
import { avisar } from '@/utils/avisos'
import { formatFechaLarga, formatLugar, formatSesionesPorSemana } from '@/utils/formatters'

// Pantallas 04 a 06: detalle de una tutoria, confirmacion de inscripcion y estados del panel.
const TutoriaDetalleTutorado = () => {
  const { id } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const { correo } = useAuth()
  const { tutoria, semana, isLoading, error, isSubmitting, inscribirse, darseDeBaja } =
    useDetalleTutoria(id)
  const [confirmando, setConfirmando] = useState(false)

  // "Volver a explorar" conserva los filtros con los que se llego.
  const desde = location.state?.desde
  const volverA = desde ? `${ROUTES.tutorado.inicio}?${desde}` : ROUTES.tutorado.inicio
  const volver = (
    <Button as={Link} to={volverA} variant="secondary" size="sm">
      ← Volver a explorar
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
          message={error || 'No encontramos esta tutoría.'}
          to={ROUTES.tutorado.inicio}
          linkLabel="Volver a explorar"
        />
      </Pagina>
    )
  }

  const panel = tutoria.panelTutorado ?? {}
  const inscrito = panel.estado === ESTADO_PANEL.INSCRIPCION_ACTIVA
  const activa = tutoria.estado === ESTADO_TUTORIA.ACTIVA

  const confirmar = async () => {
    const res = await inscribirse()
    setConfirmando(false)
    if (!res.ok) {
      avisar(res)
      return
    }
    toast.success('Inscripción confirmada', {
      description: `Ya tienes lugar en ${tutoria.materia?.nombre}. Te enviamos la confirmación por correo.`,
    })
    navigate(ROUTES.tutorado.inscripciones)
  }

  const darmeDeBaja = async () => {
    const res = await darseDeBaja()
    avisar(res)
    if (res.ok) navigate(ROUTES.tutorado.inscripciones)
  }

  const proxima = tutoria.proximaSesion
  const datos = [
    {
      etiqueta: 'Experiencia Educativa',
      valor: `NRC ${tutoria.materia?.nrc}`,
      Icono: IconTutorias,
    },
    { etiqueta: 'Lugar', valor: formatLugar(tutoria.edificio, tutoria.aula), Icono: IconEdificio },
    {
      etiqueta: 'Horarios por semana',
      valor: formatSesionesPorSemana(tutoria.horarios),
      Icono: IconReloj,
    },
    {
      etiqueta: 'Próxima sesión',
      valor: proxima ? formatFechaLarga(proxima.fecha) : 'Sin sesiones próximas',
      Icono: IconCalendario,
    },
  ]

  return (
    <Pagina>
      <DetalleTutoriaLayout
        back={volver}
        main={
          <>
            <EncabezadoDetalle
              titulo={tutoria.materia?.nombre}
              etiqueta="Imparte"
              detalle={tutoria.tutor?.nombreCompleto}
              insignia={<BadgeEstado tipo="tutoria" estado={tutoria.estado} />}
            />
            <DatosDetalle datos={datos} />

            <SeccionTutoria title="Horarios y temas">
              <HorariosYTemas horarios={tutoria.horarios} />
            </SeccionTutoria>

            <SeccionTutoria
              title="Comentarios y sugerencias"
              description={
                inscrito ? undefined : 'Inscríbete para sugerir temas u observaciones al tutor.'
              }
            >
              <Comentarios idTutoria={id} modo={inscrito && activa ? 'tutorado' : 'lectura'} />
            </SeccionTutoria>
          </>
        }
        aside={
          <>
            <PanelInscripcion
              tutoria={tutoria}
              isSubmitting={isSubmitting}
              onInscribirse={() => setConfirmando(true)}
              onDarseDeBaja={darmeDeBaja}
            />
            {semana && activa && panel.estado !== ESTADO_PANEL.BAJA_AUTOMATICA ? (
              <TuSemana tutoria={tutoria} semana={semana} />
            ) : null}
          </>
        }
      />

      <ConfirmarInscripcion
        open={confirmando}
        tutoria={tutoria}
        correo={correo}
        loading={isSubmitting}
        onConfirmar={confirmar}
        onCerrar={() => setConfirmando(false)}
      />
    </Pagina>
  )
}

export default TutoriaDetalleTutorado
