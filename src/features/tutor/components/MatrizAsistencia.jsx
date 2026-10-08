import { Badge } from '@/components/ui'
import { IconCheck, IconCruz } from '@/components/ui/icons'
import { ESTADO_INSCRIPCION, ESTADO_SESION } from '@/constants/tutoria'
import { clases } from '@/utils/clases'
import { fechaDeMarca, formatDiaMes, formatDiaSemanaCorto, SIN_DATO } from '@/utils/formatters'
import styles from './MatrizAsistencia.module.css'

// Estado de una celda: la marca del tutorado en la sesion o por que no tiene marca.
const estadoCelda = (tutorado, sesion) => {
  if (sesion.estado === ESTADO_SESION.CANCELADA) return 'cancelada'
  const marca = tutorado.marcas?.[sesion.idSesion]
  if (marca === true) return 'asistio'
  if (marca === false) {
    return String(sesion.idSesion) === String(tutorado.idSesionBaja) ? 'baja' : 'falto'
  }
  const inscripcion = fechaDeMarca(tutorado.fechaInscripcion)
  const baja = fechaDeMarca(tutorado.fechaBaja)
  if ((inscripcion && sesion.fecha < inscripcion) || (baja && sesion.fecha > baja)) {
    return 'noInscrito'
  }
  return 'sinMarca'
}

const CELDAS = {
  asistio: { texto: 'Asistió', Icono: IconCheck },
  falto: { texto: 'No asistió', Icono: IconCruz },
  baja: { texto: 'Inasistencia que causó la baja', Icono: IconCruz },
  cancelada: { texto: 'Sesión cancelada: no cuenta' },
  noInscrito: { texto: 'Aún no estaba inscrito' },
  sinMarca: { texto: 'Sin marca' },
}

const ContenidoCelda = ({ estado }) => {
  const { Icono } = CELDAS[estado]
  if (Icono) return <Icono />
  return estado === 'noInscrito' ? '·' : SIN_DATO
}

const Celda = ({ estado }) => (
  <span className={clases(styles.celda, styles[estado])} title={CELDAS[estado].texto}>
    <ContenidoCelda estado={estado} />
    <span className={styles.oculto}>{CELDAS[estado].texto}</span>
  </span>
)

// Matriz tutorado x sesion de la pantalla 14.
export const MatrizAsistencia = ({ sesiones, tutorados }) => (
  <>
    <div className={styles.contenedor}>
      <table className={styles.tabla}>
        <thead>
          <tr>
            <th scope="col" className={styles.nombre}>
              Tutorado
            </th>
            {sesiones.map((sesion) => (
              <th
                key={sesion.idSesion}
                scope="col"
                className={clases(
                  styles.sesion,
                  sesion.estado === ESTADO_SESION.CANCELADA && styles.columnaCancelada,
                )}
              >
                <span className={styles.dia}>{formatDiaSemanaCorto(sesion.fecha)}</span>
                <span>{formatDiaMes(sesion.fecha)}</span>
                {sesion.estado === ESTADO_SESION.CANCELADA ? (
                  <span className={styles.etiquetaCancelada}>Cancelada</span>
                ) : null}
                {sesion.estado === ESTADO_SESION.LISTA_ABIERTA ? (
                  <span className={styles.etiquetaAbierta}>Abierta</span>
                ) : null}
              </th>
            ))}
            <th scope="col" className={styles.total}>
              Asistió / faltó
            </th>
          </tr>
        </thead>
        <tbody>
          {tutorados.map((tutorado) => {
            const baja = tutorado.estadoInscripcion === ESTADO_INSCRIPCION.BAJA_AUTOMATICA
            return (
              <tr key={tutorado.matricula} className={clases(baja && styles.filaBaja)}>
                <th scope="row" className={styles.nombre}>
                  <span className={styles.persona}>{tutorado.nombreCompleto}</span>
                  <span className={styles.matricula}>{tutorado.matricula}</span>
                  {baja ? (
                    <Badge tone="danger" className={styles.badge}>
                      Baja automática
                      {tutorado.fechaBaja
                        ? ` · ${formatDiaMes(fechaDeMarca(tutorado.fechaBaja))}`
                        : ''}
                    </Badge>
                  ) : tutorado.estadoInscripcion === ESTADO_INSCRIPCION.BAJA ? (
                    <Badge tone="neutral" className={styles.badge}>
                      Baja
                    </Badge>
                  ) : null}
                </th>
                {sesiones.map((sesion) => (
                  <td
                    key={sesion.idSesion}
                    className={clases(
                      sesion.estado === ESTADO_SESION.CANCELADA && styles.columnaCancelada,
                    )}
                  >
                    <Celda estado={estadoCelda(tutorado, sesion)} />
                  </td>
                ))}
                <td className={styles.total}>
                  <span className={styles.asistioTotal}>{tutorado.asistio ?? 0}</span>
                  {' / '}
                  <span className={styles.faltoTotal}>{tutorado.falto ?? 0}</span>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>

    <ul className={styles.leyenda} aria-label="Leyenda">
      {['asistio', 'falto', 'baja', 'cancelada', 'noInscrito'].map((estado) => (
        <li key={estado}>
          <span className={clases(styles.celda, styles.chica, styles[estado])} aria-hidden="true">
            <ContenidoCelda estado={estado} />
          </span>
          {CELDAS[estado].texto}
        </li>
      ))}
    </ul>
  </>
)
