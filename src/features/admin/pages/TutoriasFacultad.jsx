import { useId, useMemo, useState } from 'react'
import { EncabezadoPagina, Pagina } from '@/components/layout/Pagina'
import {
  Alert,
  Button,
  Card,
  ConfirmDialog,
  EmptyState,
  Indicador,
  Indicadores,
  Input,
  Modal,
  Select,
  Skeleton,
} from '@/components/ui'
import { IconAlerta, IconBuscar } from '@/components/ui/icons'
import { CUPO_MAXIMO, ESTADO_TUTORIA, UMBRAL_ASISTENCIA_BAJA } from '@/constants/tutoria'
import { useTutoriasFacultad } from '@/features/admin/hooks/useTutoriasFacultad'
import { BadgeEstado } from '@/features/tutorias/components/BadgeEstado'
import { BarraCupo } from '@/features/tutorias/components/BarraCupo'
import { useValorDiferido } from '@/features/tutorias/hooks/useValorDiferido'
import { avisar } from '@/utils/avisos'
import { clases } from '@/utils/clases'
import {
  formatDiaNombre,
  formatListaDias,
  formatLugar,
  formatMes,
  formatPorcentaje,
  formatRangoHora,
  horasComunes,
  ordenarHorarios,
  pluralizar,
} from '@/utils/formatters'
import styles from './TutoriasFacultad.module.css'

const ESTADOS = [
  { value: 'ACTIVA', label: 'Solo activas' },
  { value: 'INACTIVA', label: 'Inactivas' },
  { value: 'TODAS', label: 'Todas' },
]

// Pantalla 15: tutorias de la facultad con su cupo y su asistencia.
const TutoriasFacultad = () => {
  const idBuscar = useId()
  const [busqueda, setBusqueda] = useState('')
  const [matriculaTutor, setMatriculaTutor] = useState('')
  const [estado, setEstado] = useState('ACTIVA')
  const q = useValorDiferido(busqueda.trim())
  const filtros = useMemo(() => ({ q, matriculaTutor, estado }), [q, matriculaTutor, estado])
  const datos = useTutoriasFacultad(filtros)
  const { resumen, tutorias, tutores, desde } = datos
  const [porDesactivar, setPorDesactivar] = useState(null)
  const [cerrandoPeriodo, setCerrandoPeriodo] = useState(false)

  const desactivar = async () => {
    avisar(await datos.desactivar(porDesactivar))
    setPorDesactivar(null)
  }

  return (
    <Pagina aria-busy={datos.cargandoTutorias || datos.actualizando}>
      <EncabezadoPagina
        title="Tutorías de la facultad"
        subtitle="Todas las tutorías activas con su cupo y su asistencia."
        action={
          <Button
            variant="danger-outline"
            disabled={!resumen?.tutoriasActivas}
            onClick={() => setCerrandoPeriodo(true)}
          >
            Cerrar periodo
          </Button>
        }
      />

      {datos.cargandoResumen ? (
        <Skeleton height={96} />
      ) : resumen ? (
        <Indicadores>
          <Indicador etiqueta="Tutorías activas" valor={resumen.tutoriasActivas} />
          <Indicador etiqueta="Inscripciones activas" valor={resumen.inscripcionesActivas} />
          <Indicador
            etiqueta="Lugares disponibles"
            valor={resumen.lugaresDisponibles}
            detalle={`de ${resumen.lugaresTotales}`}
            tone="success"
          />
          <Indicador
            etiqueta="Bajas automáticas"
            valor={resumen.bajasAutomaticas}
            detalle={`desde ${formatMes(desde)}`}
            tone={resumen.bajasAutomaticas ? 'danger' : 'neutral'}
          />
        </Indicadores>
      ) : null}

      {datos.error ? <Alert tone="error">{datos.error}</Alert> : null}

      <Card padding="lg">
        <div className={styles.filtros}>
          <div className={styles.buscador}>
            <span className={styles.icono} aria-hidden="true">
              <IconBuscar />
            </span>
            <Input
              id={idBuscar}
              type="search"
              className={styles.campo}
              aria-label="Buscar por Experiencia Educativa, NRC o tutor"
              placeholder="Buscar Experiencia Educativa o tutor…"
              value={busqueda}
              onChange={(evento) => setBusqueda(evento.target.value)}
            />
          </div>
          <Select
            aria-label="Filtrar por tutor"
            value={matriculaTutor}
            onChange={(evento) => setMatriculaTutor(evento.target.value)}
          >
            <option value="">Todos los tutores</option>
            {tutores.map((tutor) => (
              <option key={tutor.matricula} value={tutor.matricula}>
                {tutor.nombreCompleto}
              </option>
            ))}
          </Select>
          <Select
            aria-label="Filtrar por estado"
            value={estado}
            onChange={(evento) => setEstado(evento.target.value)}
          >
            {ESTADOS.map((opcion) => (
              <option key={opcion.value} value={opcion.value}>
                {opcion.label}
              </option>
            ))}
          </Select>
        </div>

        {datos.cargandoTutorias ? (
          <Skeleton height={320} />
        ) : tutorias.length ? (
          <TablaTutorias tutorias={tutorias} onDesactivar={setPorDesactivar} />
        ) : (
          <EmptyState compact description="No hay tutorías que coincidan con los filtros." />
        )}

        {resumen ? (
          <p className={styles.pie}>
            {pluralizar(resumen.tutoriasActivas, 'tutoría activa', 'tutorías activas')} · cupo fijo
            de {CUPO_MAXIMO} tutorados por tutoría
          </p>
        ) : null}
      </Card>

      <ConfirmDialog
        open={Boolean(porDesactivar)}
        tone="danger"
        title="¿Desactivar la tutoría?"
        description={
          porDesactivar
            ? `${porDesactivar.materia?.nombre} (${porDesactivar.tutor?.nombreCompleto}) dejará de aceptar inscripciones y de generar sesiones.${
                porDesactivar.cupo?.ocupados
                  ? ` Avisaremos por correo a ${pluralizar(porDesactivar.cupo.ocupados, 'inscrito')}.`
                  : ''
              } No se puede reactivar.`
            : ''
        }
        confirmLabel="Sí, desactivar"
        loading={datos.desactivando}
        onConfirm={desactivar}
        onCancel={() => setPorDesactivar(null)}
      />

      <CierrePeriodo
        open={cerrandoPeriodo}
        activas={resumen?.tutoriasActivas ?? 0}
        loading={datos.cerrandoPeriodo}
        onConfirmar={async () => {
          const res = await datos.cerrarPeriodo()
          avisar(res)
          if (res.ok) setCerrandoPeriodo(false)
          return res
        }}
        onCerrar={() => setCerrandoPeriodo(false)}
      />
    </Pagina>
  )
}

// Horarios en dos lineas: "Mar y jue" / "16:00 – 18:00", o una linea por horario si sus horas
// son distintas.
const CeldaHorarios = ({ horarios = [] }) => {
  const horas = horasComunes(horarios)
  if (horas) {
    return (
      <>
        <span className={styles.linea}>{formatListaDias(horarios, { abreviado: true })}</span>
        <span className={styles.linea}>{horas}</span>
      </>
    )
  }
  return ordenarHorarios(horarios).map((horario) => (
    <span key={horario.idHorario ?? horario.dia} className={styles.linea}>
      {formatDiaNombre(horario.dia).slice(0, 3)}{' '}
      {formatRangoHora(horario.horaInicio, horario.horaFin)}
    </span>
  ))
}

const TablaTutorias = ({ tutorias, onDesactivar }) => {
  const ordenadas = useMemo(
    () =>
      [...tutorias].sort((a, b) =>
        (a.materia?.nombre ?? '').localeCompare(b.materia?.nombre ?? ''),
      ),
    [tutorias],
  )

  return (
    <div className={styles.tablaContenedor}>
      <table className={styles.tabla}>
        <thead>
          <tr>
            <th scope="col">Experiencia Educativa</th>
            <th scope="col">Tutor</th>
            <th scope="col">Horarios</th>
            <th scope="col">Lugar</th>
            <th scope="col">Cupo</th>
            <th scope="col" className={styles.derecha}>
              Asistencia
            </th>
            <th scope="col">Estado</th>
            <th scope="col">
              <span className={styles.oculto}>Acciones</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {ordenadas.map((tutoria) => {
            const pct = tutoria.asistenciaPct
            const baja = pct != null && pct < UMBRAL_ASISTENCIA_BAJA
            return (
              <tr key={tutoria.idTutoria}>
                <th scope="row">
                  <span className={styles.materia}>{tutoria.materia?.nombre}</span>
                  <span className={styles.nrc}>NRC {tutoria.materia?.nrc}</span>
                </th>
                <td>{tutoria.tutor?.nombreCompleto}</td>
                <td>
                  <CeldaHorarios horarios={tutoria.horarios} />
                </td>
                <td className={styles.nowrap}>
                  {formatLugar(tutoria.edificio, tutoria.aula, { corto: true })}
                </td>
                <td>
                  <BarraCupo cupo={tutoria.cupo} variante="mini" />
                </td>
                <td className={clases(styles.derecha, styles.asistencia, baja && styles.baja)}>
                  {baja ? <IconAlerta /> : null}
                  {formatPorcentaje(pct)}
                  {baja ? <span className={styles.oculto}> (asistencia baja)</span> : null}
                </td>
                <td>
                  <BadgeEstado tipo="tutoria" estado={tutoria.estado} />
                </td>
                <td className={styles.derecha}>
                  {tutoria.estado === ESTADO_TUTORIA.ACTIVA ? (
                    <Button
                      variant="danger-outline"
                      size="sm"
                      onClick={() => onDesactivar(tutoria)}
                      aria-label={`Desactivar ${tutoria.materia?.nombre}`}
                    >
                      Desactivar
                    </Button>
                  ) : null}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

// Cierre de periodo: desactiva todas las tutorias activas. Pide confirmar con una casilla.
const CierrePeriodo = ({ open, activas, loading, onConfirmar, onCerrar }) => {
  const [entendido, setEntendido] = useState(false)
  const [error, setError] = useState('')
  const idCasilla = useId()

  const cerrar = () => {
    setEntendido(false)
    setError('')
    onCerrar()
  }

  const confirmar = async () => {
    const res = await onConfirmar()
    if (res.ok) {
      setEntendido(false)
      setError('')
    } else {
      setError(res.message)
    }
  }

  return (
    <Modal
      open={open}
      onClose={loading ? undefined : cerrar}
      title="¿Cerrar el periodo?"
      description={`Se desactivará${activas === 1 ? ' la tutoría activa' : `n las ${activas} tutorías activas`} y avisaremos por correo a sus inscritos. Conservan su historial, pero no se pueden reactivar.`}
      actions={
        <>
          <Button variant="secondary" onClick={cerrar} disabled={loading}>
            Volver
          </Button>
          <Button variant="danger" onClick={confirmar} disabled={!entendido} loading={loading}>
            Cerrar periodo
          </Button>
        </>
      }
    >
      {error ? (
        <Alert tone="error" compact>
          {error}
        </Alert>
      ) : null}
      <label className={styles.casilla} htmlFor={idCasilla}>
        <input
          id={idCasilla}
          type="checkbox"
          checked={entendido}
          onChange={(evento) => setEntendido(evento.target.checked)}
        />
        Entiendo que esta acción no se puede deshacer
      </label>
    </Modal>
  )
}

export default TutoriasFacultad
