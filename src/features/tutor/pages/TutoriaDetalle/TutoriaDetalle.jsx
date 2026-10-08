import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Pagina } from '@/components/layout/Pagina'
import { Alert, Button, Card, ConfirmDialog, Skeleton } from '@/components/ui'
import { IconEdificio, IconReloj } from '@/components/ui/icons'
import { ROUTES } from '@/constants/routes'
import { ESTADO_SESION, ESTADO_TUTORIA } from '@/constants/tutoria'
import { Comentarios } from '@/features/comentarios/Comentarios'
import { ConfirmarCancelacion } from '@/features/tutor/components/ConfirmarCancelacion'
import { ListaSesiones } from '@/features/tutor/components/ListaSesiones'
import { PanelInscritos } from '@/features/tutor/components/PanelInscritos'
import { useAccionesSesion } from '@/features/tutor/hooks/useAccionesSesion'
import { useDetalleTutor } from '@/features/tutor/hooks/useDetalleTutor'
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
import { avisar } from '@/utils/avisos'
import { formatLugar, formatResumenHorarios, pluralizar } from '@/utils/formatters'
import styles from './TutoriaDetalle.module.css'

const Volver = () => (
  <Button as={Link} to={ROUTES.tutor.inicio} variant="secondary" size="sm">
    ← Mis tutorías
  </Button>
)

// Pantalla 11: detalle de una tutoria para su tutor.
const TutoriaDetalleTutor = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const detalle = useDetalleTutor(id)
  const { tutoria, sesiones, inscritos, isLoading, error } = detalle
  const { abrirLista, cancelar, abriendo, cancelando } = useAccionesSesion()
  const [porCancelar, setPorCancelar] = useState(null)
  const [confirmandoDesactivar, setConfirmandoDesactivar] = useState(false)

  if (isLoading) {
    return (
      <Pagina>
        <DetalleCargando back={<Volver />} />
      </Pagina>
    )
  }

  if (error || !tutoria) {
    return (
      <Pagina>
        <DetalleError
          message={error || 'No encontramos esta tutoría.'}
          to={ROUTES.tutor.inicio}
          linkLabel="Volver a mis tutorías"
        />
      </Pagina>
    )
  }

  const activa = tutoria.estado === ESTADO_TUTORIA.ACTIVA
  const listaAbierta = sesiones.some((sesion) => sesion.estado === ESTADO_SESION.LISTA_ABIERTA)
  const conInscritos = (tutoria.cupo?.ocupados ?? 0) > 0
  const motivoNoEditar = listaAbierta
    ? 'Cierra el pase de lista abierto antes de editar.'
    : conInscritos
      ? 'Solo puedes cambiar horarios o lugar sin tutorados inscritos. Los temas sí se pueden editar arriba.'
      : null

  const informar = (res) => {
    avisar(res)
    return res
  }

  const abrir = async (sesion) => {
    const res = await abrirLista(sesion)
    if (res.ok && res.idSesion != null) navigate(ROUTES.tutor.paseDeLista(res.idSesion))
    else avisar(res)
  }

  const confirmarCancelacion = async () => {
    avisar(await cancelar(porCancelar))
    setPorCancelar(null)
  }

  const confirmarDesactivar = async () => {
    const res = await detalle.desactivar()
    avisar(res)
    setConfirmandoDesactivar(false)
  }

  return (
    <Pagina>
      <DetalleTutoriaLayout
        back={<Volver />}
        main={
          <>
            <EncabezadoDetalle
              titulo={tutoria.materia?.nombre}
              etiqueta="Experiencia Educativa"
              detalle={`NRC ${tutoria.materia?.nrc}`}
              insignia={<BadgeEstado tipo="tutoria" estado={tutoria.estado} />}
            />
            <DatosDetalle
              datos={[
                {
                  etiqueta: 'Horarios',
                  valor: formatResumenHorarios(tutoria.horarios),
                  Icono: IconReloj,
                },
                {
                  etiqueta: 'Lugar',
                  valor: formatLugar(tutoria.edificio, tutoria.aula),
                  Icono: IconEdificio,
                },
              ]}
            />

            <SeccionTutoria
              title="Sesiones"
              accion={<Link to={ROUTES.tutor.historial(id)}>Historial de asistencia →</Link>}
            >
              {detalle.errorSesiones ? (
                <Alert tone="error" compact>
                  {detalle.errorSesiones}
                </Alert>
              ) : detalle.cargandoSesiones ? (
                <Skeleton height={180} />
              ) : sesiones.length ? (
                <ListaSesiones
                  sesiones={sesiones}
                  ocupado={abriendo || cancelando}
                  onAbrirLista={abrir}
                  onCancelar={setPorCancelar}
                />
              ) : (
                <p className={styles.vacio}>Todavía no hay sesiones registradas ni próximas.</p>
              )}
            </SeccionTutoria>

            <SeccionTutoria
              title="Horarios y temas"
              description={activa ? 'Puedes cambiar los temas aunque haya inscritos.' : undefined}
            >
              <HorariosYTemas
                horarios={tutoria.horarios}
                editable={activa}
                ocupado={detalle.ocupado}
                onAgregarTema={async (horario, texto) =>
                  informar(await detalle.agregarTema(horario, texto))
                }
                onQuitarTema={async (tema) => informar(await detalle.quitarTema(tema))}
              />
            </SeccionTutoria>

            {activa ? (
              <div className={styles.acciones}>
                <div className={styles.botones}>
                  <Button
                    variant="danger-outline"
                    disabled={listaAbierta || detalle.desactivando}
                    onClick={() => setConfirmandoDesactivar(true)}
                  >
                    Desactivar tutoría
                  </Button>
                  {motivoNoEditar ? (
                    <Button variant="secondary" disabled>
                      Editar tutoría
                    </Button>
                  ) : (
                    <Button as={Link} to={ROUTES.tutor.editar(id)} variant="secondary">
                      Editar tutoría
                    </Button>
                  )}
                </div>
                {motivoNoEditar ? <p className={styles.motivo}>{motivoNoEditar}</p> : null}
              </div>
            ) : (
              <Alert tone="info" compact className={styles.inactiva}>
                Esta tutoría está inactiva: ya no acepta inscripciones ni genera sesiones, pero
                conserva su historial.
              </Alert>
            )}
          </>
        }
        aside={<PanelInscritos datos={inscritos} />}
        footer={
          <Card as="section" padding="lg" className={styles.comentarios}>
            <h2 className={styles.comentariosTitulo}>Comentarios de los tutorados</h2>
            <p className={styles.comentariosTexto}>
              Sugerencias y observaciones para las próximas sesiones.
            </p>
            <Comentarios idTutoria={id} columnas />
          </Card>
        }
      />

      <ConfirmarCancelacion
        sesion={porCancelar}
        loading={cancelando}
        onConfirmar={confirmarCancelacion}
        onCerrar={() => setPorCancelar(null)}
      />

      <ConfirmDialog
        open={confirmandoDesactivar}
        tone="danger"
        title="¿Desactivar la tutoría?"
        description={`Dejará de aceptar inscripciones y de generar sesiones. ${
          tutoria.cupo?.ocupados
            ? `Avisaremos por correo a ${
                tutoria.cupo.ocupados === 1
                  ? 'la persona inscrita'
                  : `los ${pluralizar(tutoria.cupo.ocupados, 'inscrito')}`
              }. `
            : ''
        }No se puede reactivar.`}
        confirmLabel="Sí, desactivar"
        loading={detalle.desactivando}
        onConfirm={confirmarDesactivar}
        onCancel={() => setConfirmandoDesactivar(false)}
      />
    </Pagina>
  )
}

export default TutoriaDetalleTutor
