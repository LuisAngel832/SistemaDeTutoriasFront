import { useId } from 'react'
import { Link } from 'react-router-dom'
import { Button, Card } from '@/components/ui'
import { IconCampana, IconReloj } from '@/components/ui/icons'
import { ROUTES } from '@/constants/routes'
import { ESTADO_SESION } from '@/constants/tutoria'
import { BadgeEstado } from '@/features/tutorias/components/BadgeEstado'
import { clases } from '@/utils/clases'
import { formatLugar, formatRangoHora, pluralizar } from '@/utils/formatters'
import styles from './TarjetaSesionHoy.module.css'

// Una sesion de hoy del tutor (pantalla 09). Los botones se habilitan segun `sesion.acciones`.
export const TarjetaSesionHoy = ({ sesion, ocupado, onAbrirLista, onCancelar }) => {
  const idTitulo = useId()
  const { estado, acciones = {} } = sesion
  const abierta = estado === ESTADO_SESION.LISTA_ABIERTA
  const porcentaje = sesion.inscritos
    ? Math.round(((sesion.marcados ?? 0) / sesion.inscritos) * 100)
    : 0

  return (
    <Card
      as="article"
      className={clases(styles.tarjeta, abierta && styles.abierta)}
      aria-labelledby={idTitulo}
    >
      <div className={styles.encabezado}>
        <span className={styles.hora}>
          <IconReloj />
          {formatRangoHora(sesion.horaInicio, sesion.horaFin)}
        </span>
        <BadgeEstado tipo="sesion" estado={estado} />
      </div>
      <h3 className={styles.titulo} id={idTitulo}>
        {sesion.materia}
      </h3>
      <p className={styles.detalle}>
        {formatLugar(sesion.edificio, sesion.aula)} ·{' '}
        {pluralizar(sesion.inscritos ?? 0, 'tutorado')}
      </p>

      {abierta ? (
        <>
          <div className={styles.marcados}>
            <div className={styles.marcadosTexto}>
              <span>Marcados</span>
              <strong>
                {sesion.marcados ?? 0} de {sesion.inscritos ?? 0}
              </strong>
            </div>
            <div className={styles.pista} aria-hidden="true">
              <span style={{ width: `${porcentaje}%` }} />
            </div>
          </div>
          {sesion.terminada ? (
            <p className={styles.aviso}>
              La sesión terminó. Cierra la lista para que cuente como completada.
            </p>
          ) : null}
          <div className={styles.acciones}>
            <Button
              as={Link}
              to={ROUTES.tutor.paseDeLista(sesion.idSesion)}
              variant="brand"
              size="sm"
            >
              {sesion.terminada ? 'Revisar y cerrar lista' : 'Ir al pase de lista'}
            </Button>
          </div>
        </>
      ) : null}

      {estado === ESTADO_SESION.PROGRAMADA ? (
        <>
          {sesion.recordatorioA ? (
            <p className={styles.nota}>
              <IconCampana />
              Los tutorados recibirán el recordatorio a las {sesion.recordatorioA}.
            </p>
          ) : null}
          <div className={styles.acciones}>
            {acciones.cancelar ? (
              <Button
                variant="danger-outline"
                size="sm"
                disabled={ocupado}
                onClick={() => onCancelar(sesion)}
              >
                Cancelar sesión
              </Button>
            ) : null}
            <Button
              variant="secondary"
              size="sm"
              disabled={!acciones.abrirLista || ocupado}
              title={
                acciones.abrirLista
                  ? undefined
                  : `Podrás pasar lista a partir de las ${sesion.horaInicio}.`
              }
              onClick={() => onAbrirLista(sesion)}
            >
              Abrir pase de lista
            </Button>
          </div>
        </>
      ) : null}

      {estado === ESTADO_SESION.COMPLETADA ? (
        <>
          <p className={styles.nota}>
            {sesion.asistieron ?? 0} de {sesion.inscritos ?? 0} asistieron.
          </p>
          <div className={styles.acciones}>
            <Button
              as={Link}
              to={ROUTES.tutor.paseDeLista(sesion.idSesion)}
              variant="secondary"
              size="sm"
            >
              Ver lista
            </Button>
          </div>
        </>
      ) : null}

      {estado === ESTADO_SESION.CANCELADA ? (
        <p className={styles.nota}>Sesión cancelada: no cuenta para inasistencias.</p>
      ) : null}
    </Card>
  )
}
