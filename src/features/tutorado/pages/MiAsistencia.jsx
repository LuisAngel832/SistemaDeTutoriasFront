import { useId, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Pagina } from '@/components/layout/Pagina'
import { Alert, Badge, Button, Card, ConfirmDialog } from '@/components/ui'
import { IconCampana, IconCheck, IconCruz, IconEdificio, IconReloj } from '@/components/ui/icons'
import { ROUTES } from '@/constants/routes'
import {
  ESTADO_INSCRIPCION,
  ESTADO_TUTORIA,
  INASISTENCIAS_PERMITIDAS,
  MI_ASISTENCIA,
} from '@/constants/tutoria'
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
import { MedidorInasistencias } from '@/features/tutorias/components/MedidorInasistencias'
import { useMiAsistencia } from '@/features/tutorado/hooks/useMiAsistencia'
import { avisar } from '@/utils/avisos'
import { clases } from '@/utils/clases'
import {
  fechaDeMarca,
  formatFechaCompleta,
  formatFechaCorta,
  formatFechaLarga,
  formatLugar,
  formatRangoHora,
  formatResumenHorarios,
  pluralizar,
} from '@/utils/formatters'
import styles from './MiAsistencia.module.css'

// Sesiones que se ven antes de "Ver las N sesiones".
const SESIONES_VISIBLES = 6

const Volver = () => (
  <Button as={Link} to={ROUTES.tutorado.inscripciones} variant="secondary" size="sm">
    ← Mis tutorías
  </Button>
)

// Pantalla 08: historial de asistencia del tutorado en una tutoria.
const MiAsistencia = () => {
  const { idTutoria } = useParams()
  const navigate = useNavigate()
  const { datos, isLoading, error, isSubmitting, darseDeBaja } = useMiAsistencia(idTutoria)

  if (isLoading) {
    return (
      <Pagina>
        <DetalleCargando back={<Volver />} />
      </Pagina>
    )
  }

  if (error || !datos) {
    return (
      <Pagina>
        <DetalleError
          message={error || 'No encontramos tu inscripción en esta tutoría.'}
          to={ROUTES.tutorado.inscripciones}
          linkLabel="Volver a mis tutorías"
        />
      </Pagina>
    )
  }

  const { tutoria, inscripcion, resumen, proximaSesion, historial = [] } = datos
  const activa =
    inscripcion?.estado === ESTADO_INSCRIPCION.ACTIVA && tutoria?.estado === ESTADO_TUTORIA.ACTIVA

  const darmeDeBaja = async () => {
    const res = await darseDeBaja()
    avisar(res)
    if (res.ok) navigate(ROUTES.tutorado.inscripciones)
  }

  return (
    <Pagina>
      <DetalleTutoriaLayout
        back={<Volver />}
        main={
          <>
            <EncabezadoDetalle
              titulo={tutoria.materia?.nombre}
              etiqueta="Imparte"
              detalle={tutoria.tutor?.nombreCompleto}
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
              title="Historial de asistencia"
              accion={
                inscripcion?.fechaInscripcion
                  ? `Inscripción desde el ${formatFechaCompleta(fechaDeMarca(inscripcion.fechaInscripcion))}`
                  : null
              }
            >
              <Historial historial={historial} />
            </SeccionTutoria>

            <SeccionTutoria title="Horarios y temas">
              <HorariosYTemas horarios={tutoria.horarios} />
            </SeccionTutoria>

            <SeccionTutoria title="Comentarios y sugerencias">
              <Comentarios idTutoria={idTutoria} modo={activa ? 'tutorado' : 'lectura'} />
            </SeccionTutoria>
          </>
        }
        aside={
          <>
            <TuAsistencia resumen={resumen} />
            {activa && proximaSesion ? <ProximaSesion sesion={proximaSesion} /> : null}
            <TuInscripcion
              inscripcion={inscripcion}
              activa={activa}
              materia={tutoria.materia?.nombre}
              isSubmitting={isSubmitting}
              onDarseDeBaja={darmeDeBaja}
            />
          </>
        }
      />
    </Pagina>
  )
}

const ASISTENCIA = {
  [MI_ASISTENCIA.ASISTIO]: { texto: 'Asistió', clase: 'asistio', Icono: IconCheck },
  [MI_ASISTENCIA.NO_ASISTIO]: { texto: 'No asistió', clase: 'falto', Icono: IconCruz },
  [MI_ASISTENCIA.PENDIENTE]: { texto: 'Pendiente', clase: 'neutra' },
  [MI_ASISTENCIA.NO_CUENTA]: { texto: 'No cuenta', clase: 'neutra' },
  [MI_ASISTENCIA.SIN_MARCA]: { texto: 'Sin marca', clase: 'neutra' },
}

const Historial = ({ historial }) => {
  const [todas, setTodas] = useState(false)
  const visibles = todas ? historial : historial.slice(0, SESIONES_VISIBLES)

  if (!historial.length) {
    return <p className={styles.vacio}>Todavía no hay sesiones en tu historial.</p>
  }

  return (
    <>
      <div className={styles.tablaContenedor}>
        <table className={styles.tabla}>
          <thead>
            <tr>
              <th scope="col">Fecha</th>
              <th scope="col">Horario</th>
              <th scope="col">Sesión</th>
              <th scope="col">Tu asistencia</th>
            </tr>
          </thead>
          <tbody>
            {visibles.map((sesion) => {
              const asistencia = ASISTENCIA[sesion.miAsistencia] ?? ASISTENCIA.SIN_MARCA
              const { Icono } = asistencia
              return (
                <tr
                  key={`${sesion.fecha}-${sesion.horaInicio}`}
                  className={clases(
                    sesion.miAsistencia === MI_ASISTENCIA.NO_ASISTIO && styles.filaFalta,
                  )}
                >
                  <td>{formatFechaCorta(sesion.fecha)}</td>
                  <td>{formatRangoHora(sesion.horaInicio, sesion.horaFin)}</td>
                  <td>
                    <BadgeEstado tipo="sesion" estado={sesion.estadoSesion} />
                  </td>
                  <td className={styles[asistencia.clase]}>
                    {Icono ? <Icono /> : null}
                    {asistencia.texto}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      {historial.length > SESIONES_VISIBLES ? (
        <button type="button" className={styles.verTodas} onClick={() => setTodas((v) => !v)}>
          {todas ? 'Ver menos' : `Ver las ${historial.length} sesiones →`}
        </button>
      ) : null}
    </>
  )
}

const TuAsistencia = ({ resumen = {} }) => {
  const idTitulo = useId()
  const permitidas = resumen.inasistenciasPermitidas ?? INASISTENCIAS_PERMITIDAS
  const inasistencias = resumen.inasistencias ?? 0

  return (
    <Card as="section" padding="lg" aria-labelledby={idTitulo}>
      <h2 className={styles.lateralTitulo} id={idTitulo}>
        Tu asistencia
      </h2>
      <p className={styles.cifra}>
        <strong className={clases(inasistencias > 0 && styles.cifraAviso)}>{inasistencias}</strong>
        de {pluralizar(permitidas, 'inasistencia permitida', 'inasistencias permitidas')}
      </p>
      <MedidorInasistencias
        inasistencias={inasistencias}
        permitidas={permitidas}
        etiqueta={false}
      />
      <Alert tone="warning" compact className={styles.aviso}>
        Si llegas a {permitidas + 1} inasistencias en sesiones completadas, se te dará de baja
        automáticamente y te avisaremos por correo.
      </Alert>
      <dl className={styles.conteos}>
        <div>
          <dt>Sesiones con asistencia</dt>
          <dd className={styles.positivo}>{resumen.sesionesConAsistencia ?? 0}</dd>
        </div>
        <div>
          <dt>Inasistencias</dt>
          <dd className={styles.negativo}>{inasistencias}</dd>
        </div>
        <div>
          <dt>Sesiones canceladas</dt>
          <dd>{resumen.sesionesCanceladas ?? 0}</dd>
        </div>
      </dl>
    </Card>
  )
}

const ProximaSesion = ({ sesion }) => (
  <Card as="section" padding="lg" className={styles.proxima} aria-label="Próxima sesión">
    <p className={styles.proximaEtiqueta}>Próxima sesión</p>
    <p className={styles.proximaFecha}>{formatFechaLarga(sesion.fecha)}</p>
    <p className={styles.proximaDetalle}>
      {formatRangoHora(sesion.horaInicio, sesion.horaFin)} ·{' '}
      {formatLugar(sesion.edificio, sesion.aula)}
    </p>
    {sesion.recordatorioA ? (
      <p className={styles.recordatorio}>
        <IconCampana />
        Recordatorio por correo a las {sesion.recordatorioA}
      </p>
    ) : null}
  </Card>
)

const TuInscripcion = ({ inscripcion, activa, materia, isSubmitting, onDarseDeBaja }) => {
  const [confirmando, setConfirmando] = useState(false)
  const idTitulo = useId()
  const fechaBaja = fechaDeMarca(inscripcion?.fechaBaja)

  return (
    <Card as="section" padding="lg" aria-labelledby={idTitulo}>
      <h2 className={styles.lateralTitulo} id={idTitulo}>
        Tu inscripción
      </h2>
      {activa ? (
        <>
          <p className={styles.texto}>
            Si ya no vas a asistir, date de baja para liberar tu lugar a otro tutorado.
          </p>
          <Button
            variant="danger-outline"
            fullWidth
            disabled={isSubmitting}
            onClick={() => setConfirmando(true)}
          >
            Darme de baja
          </Button>
          <ConfirmDialog
            open={confirmando}
            tone="danger"
            title="¿Darte de baja?"
            description={`Liberarás tu lugar en ${materia}. Podrás volver a inscribirte si quedan lugares.`}
            confirmLabel="Sí, darme de baja"
            loading={isSubmitting}
            onConfirm={async () => {
              await onDarseDeBaja()
              setConfirmando(false)
            }}
            onCancel={() => setConfirmando(false)}
          />
        </>
      ) : (
        <>
          <p className={styles.texto}>
            {inscripcion?.estado === ESTADO_INSCRIPCION.BAJA_AUTOMATICA ? (
              <Badge tone="danger">Baja automática</Badge>
            ) : inscripcion?.estado === ESTADO_INSCRIPCION.BAJA ? (
              <Badge tone="neutral">Baja</Badge>
            ) : (
              <Badge tone="neutral">Tutoría desactivada</Badge>
            )}{' '}
            {fechaBaja ? `desde el ${formatFechaLarga(fechaBaja, { mayuscula: false })}.` : null}
          </p>
          <Button as={Link} to={ROUTES.tutorado.inicio} variant="secondary" fullWidth>
            Explorar otras tutorías
          </Button>
        </>
      )}
    </Card>
  )
}

export default MiAsistencia
