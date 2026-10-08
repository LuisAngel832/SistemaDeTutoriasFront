import { useEffect, useId } from 'react'
import { Link, useLocation, useSearchParams } from 'react-router-dom'
import { EncabezadoPagina, Pagina } from '@/components/layout/Pagina'
import {
  Alert,
  Button,
  Card,
  EmptyState,
  Indicador,
  Indicadores,
  Select,
  Skeleton,
} from '@/components/ui'
import { ROUTES } from '@/constants/routes'
import { ESTADO_TUTORIA } from '@/constants/tutoria'
import { MatrizAsistencia } from '@/features/tutor/components/MatrizAsistencia'
import { useHistorialAsistencia } from '@/features/tutor/hooks/useHistorialAsistencia'
import {
  formatFechaLarga,
  formatListaDias,
  formatLugar,
  formatPorcentaje,
  horasComunes,
  pluralizar,
} from '@/utils/formatters'
import styles from './HistorialAsistencia.module.css'

const etiquetaTutoria = (tutoria) =>
  `${tutoria.materia?.nombre} · ${formatListaDias(tutoria.horarios, { abreviado: true }).toLowerCase()}${
    tutoria.estado === ESTADO_TUTORIA.INACTIVA ? ' (inactiva)' : ''
  }`

// Aviso que deja el cierre de un pase de lista (pantalla 13 -> 14).
const textoCierre = ({ fecha, bajas = [] }) => {
  const lista = `Lista del ${formatFechaLarga(fecha, { mayuscula: false })} cerrada.`
  if (!bajas.length) return { titulo: lista, detalle: '' }
  const nombres = new Intl.ListFormat('es', { type: 'conjunction' }).format(
    bajas.map((baja) => baja.nombreCompleto),
  )
  return {
    titulo: lista,
    detalle:
      bajas.length === 1
        ? `Se aplicó la baja automática a ${nombres} por acumular ${pluralizar(bajas[0].inasistencias, 'inasistencia')}. Ya se le avisó por correo.`
        : `Se aplicó la baja automática a ${nombres} por acumular más inasistencias de las permitidas. Ya se les avisó por correo.`,
  }
}

// Pantalla 14: la marca de cada tutorado en cada sesion de una tutoria.
const HistorialAsistencia = () => {
  const [parametros, setParametros] = useSearchParams()
  const location = useLocation()
  const idSelector = useId()
  const idTutoria = parametros.get('tutoria') ?? ''
  const { tutorias, historial, cargandoTutorias, cargandoHistorial, error } =
    useHistorialAsistencia(idTutoria)

  // Sin tutoria elegida se muestra la primera activa (o la primera, si todas estan inactivas).
  useEffect(() => {
    if (idTutoria || !tutorias.length) return
    const primera = tutorias.find((t) => t.estado === ESTADO_TUTORIA.ACTIVA) ?? tutorias[0]
    setParametros({ tutoria: String(primera.idTutoria) }, { replace: true })
  }, [idTutoria, tutorias, setParametros])

  const cierre = location.state?.cierre
  const aviso = cierre ? textoCierre(cierre) : null

  const selector = tutorias.length ? (
    <div className={styles.selector}>
      <label htmlFor={idSelector} className={styles.etiqueta}>
        Tutoría
      </label>
      <Select
        id={idSelector}
        value={idTutoria}
        onChange={(evento) => setParametros({ tutoria: evento.target.value })}
      >
        {tutorias.map((tutoria) => (
          <option key={tutoria.idTutoria} value={String(tutoria.idTutoria)}>
            {etiquetaTutoria(tutoria)}
          </option>
        ))}
      </Select>
    </div>
  ) : null

  return (
    <Pagina aria-busy={cargandoTutorias || cargandoHistorial}>
      <EncabezadoPagina
        title="Historial de asistencia"
        subtitle="La marca de cada tutorado en cada sesión, desde que inició la tutoría."
        action={selector}
      />

      {aviso ? (
        <Alert tone="success" title={aviso.titulo}>
          {aviso.detalle}
        </Alert>
      ) : null}
      {error ? <Alert tone="error">{error}</Alert> : null}

      {cargandoTutorias ? (
        <Skeleton height={360} />
      ) : !tutorias.length ? (
        <EmptyState
          title="Aún no tienes tutorías"
          description="El historial aparece cuando pasas lista en las sesiones de tus tutorías."
          action={
            <Button as={Link} to={ROUTES.tutor.nuevaTutoria}>
              Crear tutoría
            </Button>
          }
        />
      ) : cargandoHistorial || !historial ? (
        <Skeleton height={360} />
      ) : (
        <Historial historial={historial} />
      )}
    </Pagina>
  )
}

const Historial = ({ historial }) => {
  const { tutoria, resumen = {}, sesiones = [], tutorados = [] } = historial
  const horas = horasComunes(tutoria.horarios)

  return (
    <>
      <Indicadores>
        <Indicador etiqueta="Sesiones completadas" valor={resumen.sesionesCompletadas ?? 0} />
        <Indicador
          etiqueta="Asistencia"
          valor={formatPorcentaje(resumen.asistenciaPct)}
          tone="success"
          detalle={
            resumen.marcasTotales
              ? `${resumen.marcasAsistio} de ${resumen.marcasTotales} marcas`
              : 'sin marcas todavía'
          }
        />
        <Indicador etiqueta="Sesiones canceladas" valor={resumen.sesionesCanceladas ?? 0} />
        <Indicador
          etiqueta="Bajas automáticas"
          valor={resumen.bajasAutomaticas ?? 0}
          tone={resumen.bajasAutomaticas ? 'danger' : 'neutral'}
        />
      </Indicadores>

      <Card as="section" padding="lg" aria-label="Asistencia por sesión">
        <div className={styles.encabezado}>
          <h2 className={styles.titulo}>
            {tutoria.materia} · {formatListaDias(tutoria.horarios).toLowerCase()}
            {horas ? ` ${horas}` : ''}
          </h2>
          <p className={styles.lugar}>
            {formatLugar(tutoria.edificio, tutoria.aula)} · {tutoria.cupo?.ocupados ?? 0} de{' '}
            {tutoria.cupo?.maximo ?? 0} inscritos activos
          </p>
        </div>
        {sesiones.length && tutorados.length ? (
          <MatrizAsistencia sesiones={sesiones} tutorados={tutorados} />
        ) : (
          <p className={styles.vacio}>Todavía no hay sesiones con pase de lista en esta tutoría.</p>
        )}
      </Card>
    </>
  )
}

export default HistorialAsistencia
