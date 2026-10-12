import { useId, useState } from 'react'
import { Link } from 'react-router-dom'
import { Alert, Button, Card, ConfirmDialog } from '@/components/ui'
import { IconAlerta, IconCampana, IconCorreo } from '@/components/ui/icons'
import { ROUTES } from '@/constants/routes'
import { ESTADO_PANEL, INASISTENCIAS_PERMITIDAS } from '@/constants/tutoria'
import { BarraCupo } from '@/features/tutorias/components/BarraCupo'
import { MedidorInasistencias } from '@/features/tutorias/components/MedidorInasistencias'
import { describirChoque } from '@/utils/choques'
import {
  fechaDeMarca,
  formatFechaLarga,
  formatHora,
  formatNombreDiaDeFecha,
  pluralizar,
} from '@/utils/formatters'
import styles from './PanelInscripcion.module.css'

// Columna derecha del detalle de una tutoria para el tutorado, segun panelTutorado.estado
// (pantalla 06). `onInscribirse` abre la confirmacion (pantalla 05).
export const PanelInscripcion = ({ tutoria, isSubmitting, onInscribirse, onDarseDeBaja }) => {
  const panel = tutoria.panelTutorado ?? {}
  const idTitulo = useId()
  const inscrito =
    panel.estado === ESTADO_PANEL.INSCRIPCION_ACTIVA ||
    panel.estado === ESTADO_PANEL.BAJA_AUTOMATICA

  return (
    <Card as="section" padding="lg" aria-labelledby={idTitulo}>
      <h2 className={styles.titulo} id={idTitulo}>
        {inscrito ? 'Tu inscripción' : 'Inscribirse'}
      </h2>
      <ContenidoPanel
        tutoria={tutoria}
        panel={panel}
        isSubmitting={isSubmitting}
        onInscribirse={onInscribirse}
        onDarseDeBaja={onDarseDeBaja}
      />
    </Card>
  )
}

const Cupo = ({ cupo }) => (
  <BarraCupo
    cupo={cupo}
    texto={`${cupo?.ocupados ?? 0} de ${cupo?.maximo ?? 0} lugares ocupados`}
  />
)

const BotonInscribirme = ({ disabled, onClick }) => (
  <Button fullWidth disabled={disabled} onClick={onClick} className={styles.accion}>
    Inscribirme
  </Button>
)

const ExplorarOtras = ({ variant }) => (
  <Button
    as={Link}
    to={ROUTES.tutorado.inicio}
    variant={variant}
    fullWidth
    className={styles.accion}
  >
    Explorar otras tutorías
  </Button>
)

const ContenidoPanel = ({ tutoria, panel, isSubmitting, onInscribirse, onDarseDeBaja }) => {
  const [confirmandoBaja, setConfirmandoBaja] = useState(false)
  const { cupo } = tutoria
  const inscripcion = panel.inscripcion ?? {}
  const permitidas = inscripcion.inasistenciasPermitidas ?? INASISTENCIAS_PERMITIDAS

  switch (panel.estado) {
    case ESTADO_PANEL.INSCRIPCION_ACTIVA: {
      const proxima = tutoria.proximaSesion
      return (
        <>
          <div className={styles.activa}>
            <span className={styles.punto} aria-hidden="true" />
            <div>
              <strong>Inscripción activa</strong>
              {proxima ? (
                <span>
                  Próxima sesión: {formatFechaLarga(proxima.fecha, { mayuscula: false })},{' '}
                  {formatHora(proxima.horaInicio)}
                </span>
              ) : null}
            </div>
          </div>
          {proxima?.recordatorioA ? (
            <p className={styles.nota}>
              <IconCampana />
              Te enviaremos el recordatorio por correo el {formatNombreDiaDeFecha(proxima.fecha)} a
              las {proxima.recordatorioA}.
            </p>
          ) : null}
          <MedidorInasistencias
            inasistencias={inscripcion.inasistencias ?? 0}
            permitidas={permitidas}
          />
          <p className={styles.pie}>La tercera inasistencia causa la baja automática.</p>
          <Button
            as={Link}
            to={ROUTES.tutorado.asistencia(tutoria.idTutoria)}
            variant="secondary"
            fullWidth
            className={styles.accion}
          >
            Ver mi asistencia
          </Button>
          <Button
            variant="danger-outline"
            fullWidth
            disabled={isSubmitting}
            onClick={() => setConfirmandoBaja(true)}
          >
            Darme de baja
          </Button>
          <ConfirmDialog
            open={confirmandoBaja}
            tone="danger"
            title="¿Darte de baja?"
            description={`Liberarás tu lugar en ${tutoria.materia?.nombre}. Podrás volver a inscribirte si quedan lugares.`}
            confirmLabel="Sí, darme de baja"
            loading={isSubmitting}
            onConfirm={async () => {
              await onDarseDeBaja()
              setConfirmandoBaja(false)
            }}
            onCancel={() => setConfirmandoBaja(false)}
          />
        </>
      )
    }

    case ESTADO_PANEL.CHOQUE_HORARIO:
      return (
        <>
          <Cupo cupo={cupo} />
          <Alert tone="error" title="Se cruza con tu horario" className={styles.aviso}>
            {(panel.choques ?? []).map((choque) => (
              <p key={`${choque.dia}-${choque.horaInicio}`}>{describirChoque(choque)}</p>
            ))}
            <Link to={ROUTES.tutorado.inscripciones} className={styles.enlace}>
              Revisar mis tutorías
            </Link>
          </Alert>
          <BotonInscribirme disabled />
        </>
      )

    case ESTADO_PANEL.LLENA:
      return (
        <>
          <Cupo cupo={cupo} />
          <Alert tone="error" title="Tutoría llena" className={styles.aviso}>
            Ya se ocuparon los {cupo?.maximo} lugares. Si alguien se da de baja, el lugar vuelve a
            quedar disponible.
          </Alert>
          <BotonInscribirme disabled />
        </>
      )

    case ESTADO_PANEL.NO_ACTIVA:
      return (
        <>
          <Alert tone="warning" title="Esta tutoría ya no está disponible" className={styles.aviso}>
            Dejó de estar activa y no acepta inscripciones nuevas.
          </Alert>
          <ExplorarOtras variant="brand" />
        </>
      )

    case ESTADO_PANEL.BAJA_AUTOMATICA: {
      const fecha = fechaDeMarca(inscripcion.fechaBaja)
      return (
        <>
          <Alert tone="error" title="Baja automática" className={styles.aviso}>
            {fecha
              ? `El ${formatFechaLarga(fecha, { mayuscula: false })} acumulaste ${pluralizar(inscripcion.inasistencias ?? permitidas + 1, 'inasistencia')} y se te dio de baja. Te avisamos por correo.`
              : 'Acumulaste más inasistencias de las permitidas y se te dio de baja.'}
          </Alert>
          <MedidorInasistencias
            inasistencias={inscripcion.inasistencias ?? permitidas + 1}
            permitidas={permitidas}
          />
          <ExplorarOtras variant="secondary" />
        </>
      )
    }

    default: {
      const horarios = tutoria.horarios?.length ?? 0
      return (
        <>
          <Cupo cupo={cupo} />
          <p className={styles.quedan}>
            {cupo?.disponibles === 1 ? 'Queda 1 lugar' : `Quedan ${cupo?.disponibles ?? 0} lugares`}
          </p>
          <p className={styles.descripcion}>
            Tu inscripción incluye{' '}
            {horarios === 1 ? 'el horario semanal' : `los ${horarios} horarios semanales`} de esta
            tutoría.
          </p>
          <ul className={styles.reglas}>
            <li>
              <IconCorreo />
              Te enviaremos la confirmación por correo.
            </li>
            <li>
              <IconCampana />
              Recibirás un recordatorio 2 horas antes de cada sesión.
            </li>
            <li className={styles.reglaAviso}>
              <IconAlerta />
              Con más de {permitidas} inasistencias se te da de baja automáticamente.
            </li>
          </ul>
          <BotonInscribirme
            disabled={!panel.puedeInscribirse || isSubmitting}
            onClick={onInscribirse}
          />
        </>
      )
    }
  }
}
