import { Link } from 'react-router-dom'
import { Button } from '@/components/ui'
import { ROUTES } from '@/constants/routes'
import { ESTADO_SESION } from '@/constants/tutoria'
import { BadgeEstado } from '@/features/tutorias/components/BadgeEstado'
import { clases } from '@/utils/clases'
import { diaRelativo } from '@/utils/fechas'
import { formatFechaCorta, formatRangoHora, pluralizar } from '@/utils/formatters'
import styles from './ListaSesiones.module.css'

// Texto de cada estado de sesion en el detalle de la tutoria (pantalla 11).
const describir = (sesion) => {
  switch (sesion.estado) {
    case ESTADO_SESION.PROGRAMADA:
      return sesion.recordatorioA
        ? `Recordatorio a los tutorados a las ${sesion.recordatorioA}`
        : 'Sesión programada'
    case ESTADO_SESION.LISTA_ABIERTA: {
      const faltan = (sesion.inscritos ?? 0) - (sesion.marcados ?? 0)
      return faltan > 0
        ? `${sesion.marcados ?? 0} de ${sesion.inscritos ?? 0} marcados · faltan ${faltan} por marcar`
        : `${sesion.marcados ?? 0} de ${sesion.inscritos ?? 0} marcados · falta cerrar la lista`
    }
    case ESTADO_SESION.COMPLETADA:
      return `${sesion.asistieron ?? 0} de ${sesion.inscritos ?? 0} asistieron`
    case ESTADO_SESION.CANCELADA:
      return `Se avisó por correo a ${sesion.inscritos ? `los ${pluralizar(sesion.inscritos, 'tutorado')}` : 'los tutorados'} · no cuenta para inasistencias`
    default:
      return ''
  }
}

// Sesiones de una tutoria: registradas y virtuales de los proximos dias, de la mas reciente a
// la mas antigua. Las acciones se habilitan segun `sesion.acciones`.
export const ListaSesiones = ({ sesiones, ocupado, onAbrirLista, onCancelar }) => (
  <ul className={styles.lista}>
    {sesiones.map((sesion) => {
      const { acciones = {} } = sesion
      const esHoy = diaRelativo(sesion.fecha) === 'hoy'
      return (
        <li
          key={sesion.idSesion ?? `${sesion.idHorario}-${sesion.fecha}`}
          className={clases(
            styles.fila,
            sesion.estado === ESTADO_SESION.LISTA_ABIERTA && styles.abierta,
          )}
        >
          <div className={styles.cuando}>
            <strong>
              {formatFechaCorta(sesion.fecha)}
              {esHoy ? ' · hoy' : ''}
            </strong>
            <span>{formatRangoHora(sesion.horaInicio, sesion.horaFin)}</span>
          </div>
          <BadgeEstado tipo="sesion" estado={sesion.estado} className={styles.estado} />
          <p className={styles.texto}>{describir(sesion)}</p>
          <div className={styles.accion}>
            {sesion.estado === ESTADO_SESION.PROGRAMADA && acciones.cancelar ? (
              <Button
                variant="danger-outline"
                size="sm"
                disabled={ocupado}
                onClick={() => onCancelar(sesion)}
              >
                Cancelar sesión
              </Button>
            ) : null}
            {sesion.estado === ESTADO_SESION.PROGRAMADA && acciones.abrirLista ? (
              <Button
                variant="brand"
                size="sm"
                disabled={ocupado}
                onClick={() => onAbrirLista(sesion)}
              >
                Abrir pase de lista
              </Button>
            ) : null}
            {sesion.estado === ESTADO_SESION.LISTA_ABIERTA ? (
              <Button
                as={Link}
                to={ROUTES.tutor.paseDeLista(sesion.idSesion)}
                variant="brand"
                size="sm"
              >
                Ir al pase de lista
              </Button>
            ) : null}
            {sesion.estado === ESTADO_SESION.COMPLETADA ? (
              <Button
                as={Link}
                to={ROUTES.tutor.paseDeLista(sesion.idSesion)}
                variant="secondary"
                size="sm"
              >
                Ver lista
              </Button>
            ) : null}
          </div>
        </li>
      )
    })}
  </ul>
)
