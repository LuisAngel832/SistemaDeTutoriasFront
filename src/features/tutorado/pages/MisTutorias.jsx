import { useId } from 'react'
import { Link } from 'react-router-dom'
import { EncabezadoPagina, GridTarjetas, Pagina, SeccionPagina } from '@/components/layout/Pagina'
import { Alert, Badge, Button, Card, Chip, EmptyState, Skeleton } from '@/components/ui'
import { IconCalendario, IconCampana } from '@/components/ui/icons'
import { ROUTES } from '@/constants/routes'
import { ESTADO_INSCRIPCION, ESTADO_TUTORIA } from '@/constants/tutoria'
import { HorariosSemana } from '@/features/tutorias/components/HorariosSemana'
import { Lugar } from '@/features/tutorias/components/Lugar'
import { MedidorInasistencias } from '@/features/tutorias/components/MedidorInasistencias'
import { useMisInscripciones } from '@/features/tutorado/hooks/useMisInscripciones'
import { diaRelativo } from '@/utils/fechas'
import {
  fechaDeMarca,
  formatCuando,
  formatDiaMes,
  formatDiaNombre,
  formatDiaSemanaCorto,
  formatFechaLarga,
  formatLugar,
  formatRangoHora,
  formatResumenHorarios,
  pluralizar,
} from '@/utils/formatters'
import styles from './MisTutorias.module.css'

// Pantalla 07: proxima sesion, inscripciones activas e inscripciones anteriores.
const MisTutorias = () => {
  const { proximaSesion, activas, anteriores, isLoading, error } = useMisInscripciones()
  const sinInscripciones = !activas.length && !anteriores.length

  return (
    <Pagina aria-busy={isLoading}>
      <EncabezadoPagina
        title="Mis tutorías"
        subtitle="Tus inscripciones, tu próxima sesión y cuántas inasistencias llevas en cada tutoría."
      />

      {error ? <Alert tone="error">{error}</Alert> : null}

      {isLoading ? (
        <>
          <Skeleton height={110} />
          <GridTarjetas>
            <Skeleton height={300} />
            <Skeleton height={300} />
            <Skeleton height={300} />
          </GridTarjetas>
        </>
      ) : sinInscripciones && !error ? (
        <EmptyState
          title="Aún no tienes inscripciones"
          description="Explora las tutorías disponibles e inscríbete a la que necesites."
          action={
            <Button as={Link} to={ROUTES.tutorado.inicio} variant="brand">
              Explorar tutorías
            </Button>
          }
        />
      ) : (
        <>
          {proximaSesion ? <ProximaSesion sesion={proximaSesion} /> : null}

          <SeccionPagina titulo="Inscripciones activas" cantidad={activas.length}>
            {activas.length ? (
              <GridTarjetas>
                {activas.map((item) => (
                  <TarjetaInscripcion key={item.tutoria.idTutoria} item={item} />
                ))}
              </GridTarjetas>
            ) : (
              <EmptyState
                compact
                description="No tienes inscripciones activas."
                action={
                  <Button as={Link} to={ROUTES.tutorado.inicio} variant="brand" size="sm">
                    Explorar tutorías
                  </Button>
                }
              />
            )}
          </SeccionPagina>

          {anteriores.length ? (
            <SeccionPagina titulo="Inscripciones anteriores" cantidad={anteriores.length}>
              <Card as="ul" className={styles.anteriores}>
                {anteriores.map((item) => (
                  <FilaAnterior key={item.tutoria.idTutoria} item={item} />
                ))}
              </Card>
            </SeccionPagina>
          ) : null}
        </>
      )}
    </Pagina>
  )
}

const ProximaSesion = ({ sesion }) => {
  const relativo = diaRelativo(sesion.fecha)
  const cuando = relativo ?? formatFechaLarga(sesion.fecha, { mayuscula: false })
  const dia = formatDiaNombre(sesion.dia).toLowerCase()
  const temas = sesion.temas ?? []

  return (
    <Card as="section" className={styles.proxima} aria-label="Próxima sesión">
      <div className={styles.fecha} aria-hidden="true">
        <span>{formatDiaSemanaCorto(sesion.fecha)}</span>
        <strong>{Number(sesion.fecha?.slice(8, 10))}</strong>
      </div>
      <div className={styles.proximaDatos}>
        <p className={styles.proximaEtiqueta}>Próxima sesión · {cuando}</p>
        <h2 className={styles.proximaTitulo}>
          <Link to={ROUTES.tutorado.asistencia(sesion.idTutoria)}>{sesion.materia?.nombre}</Link>
        </h2>
        <p className={styles.proximaDetalle}>
          {formatRangoHora(sesion.horaInicio, sesion.horaFin)} ·{' '}
          {formatLugar(sesion.edificio, sesion.aula)}
        </p>
      </div>
      {temas.length ? (
        <div className={styles.proximaTemas}>
          <p className={styles.proximaEtiquetaTemas}>Temas del {dia}</p>
          <ul>
            {temas.map((tema) => (
              <li key={tema}>
                <Chip tone="primary">{tema}</Chip>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      {sesion.recordatorioA ? (
        <p className={styles.recordatorio}>
          <IconCampana />
          Recordatorio por correo a las {sesion.recordatorioA}
        </p>
      ) : null}
    </Card>
  )
}

const TarjetaInscripcion = ({ item }) => {
  const idTitulo = useId()
  const { tutoria, inscripcion, proximaSesion } = item

  return (
    <Card as="article" className={styles.tarjeta} aria-labelledby={idTitulo}>
      <div className={styles.encabezado}>
        <h3 className={styles.titulo} id={idTitulo}>
          {tutoria.materia?.nombre}
        </h3>
        {inscripcion?.nueva ? (
          <Badge tone="info">Nueva</Badge>
        ) : (
          <Badge tone="success">Activa</Badge>
        )}
      </div>
      <p className={styles.tutor}>Imparte {tutoria.tutor?.nombreCompleto}</p>
      <HorariosSemana horarios={tutoria.horarios} />
      <Lugar edificio={tutoria.edificio} aula={tutoria.aula} />
      <div className={styles.separador} />
      <MedidorInasistencias
        inasistencias={item.inasistencias}
        permitidas={item.inasistenciasPermitidas}
      />
      {proximaSesion ? (
        <p className={styles.siguiente}>
          <IconCalendario />
          {proximaSesion.primera ? 'Primera sesión' : 'Próxima'}:{' '}
          {formatCuando(proximaSesion.fecha, proximaSesion.horaInicio)}
        </p>
      ) : null}
      <Button
        as={Link}
        to={ROUTES.tutorado.asistencia(tutoria.idTutoria)}
        variant="brand"
        fullWidth
        className={styles.accion}
        aria-describedby={idTitulo}
      >
        Ver detalle y asistencia <span aria-hidden="true">→</span>
      </Button>
    </Card>
  )
}

const describirAnterior = ({ tutoria, inscripcion, inasistencias }) => {
  const fecha = formatDiaMes(fechaDeMarca(inscripcion?.fechaBaja), { anio: true })
  if (inscripcion?.estado === ESTADO_INSCRIPCION.BAJA_AUTOMATICA) {
    return {
      texto: `El ${fecha} acumulaste ${pluralizar(inasistencias, 'inasistencia')}`,
      insignia: <Badge tone="danger">Baja automática</Badge>,
    }
  }
  if (inscripcion?.estado === ESTADO_INSCRIPCION.BAJA) {
    return { texto: `Te diste de baja el ${fecha}`, insignia: <Badge tone="neutral">Baja</Badge> }
  }
  // Inscripcion activa en una tutoria que el tutor o el admin desactivo.
  if (tutoria.estado === ESTADO_TUTORIA.INACTIVA) {
    return {
      texto: 'La tutoría dejó de impartirse',
      insignia: <Badge tone="neutral">Tutoría desactivada</Badge>,
    }
  }
  return { texto: '', insignia: null }
}

const FilaAnterior = ({ item }) => {
  const { tutoria } = item
  const { texto, insignia } = describirAnterior(item)

  return (
    <li className={styles.fila}>
      <div className={styles.filaDatos}>
        <Link to={ROUTES.tutorado.asistencia(tutoria.idTutoria)} className={styles.filaTitulo}>
          {tutoria.materia?.nombre}
        </Link>
        <span className={styles.filaDetalle}>
          {tutoria.tutor?.nombreCompleto} ·{' '}
          {formatResumenHorarios(tutoria.horarios, { abreviado: true })}
        </span>
      </div>
      <span className={styles.filaTexto}>{texto}</span>
      {insignia}
    </li>
  )
}

export default MisTutorias
