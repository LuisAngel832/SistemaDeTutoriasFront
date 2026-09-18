import { useId } from 'react'
import { Alert, EmptyState, Skeleton } from '../../../components/ui'
import { nombreDeDia } from '../../../constants/horarios'
import { formatRangoHora } from '../../../utils/formatters'
import styles from './ListaHorarios.module.css'

export const ListaHorarios = ({ horarios, isLoading, error, eliminandoId, onEliminar }) => {
  const idTitulo = useId()

  return (
    <section className={styles.lista} aria-labelledby={idTitulo} aria-busy={isLoading}>
      <div className={styles.encabezado}>
        <h2 className={styles.titulo} id={idTitulo}>
          Mis horarios
        </h2>
        <span className={styles.conteo}>{horarios.length}</span>
      </div>

      {error ? <Alert tone="error">{error}</Alert> : null}

      {isLoading ? (
        <div className={styles.horarios}>
          <Skeleton height={58} />
          <Skeleton height={58} />
        </div>
      ) : horarios.length === 0 ? (
        <EmptyState compact description="Aún no tienes horarios. Crea uno arriba para empezar." />
      ) : (
        <ul className={styles.horarios}>
          {horarios.map((horario) => {
            const eliminando = eliminandoId === horario.idHorario
            return (
              <li key={horario.idHorario} className={styles.horario}>
                <span className={styles.datos}>
                  <span className={styles.dia}>{nombreDeDia(horario.dia)}</span>
                  <span className={styles.horas}>
                    {formatRangoHora(horario.horaInicio, horario.horaFin)}
                  </span>
                </span>
                <button
                  type="button"
                  className={styles.eliminar}
                  onClick={() => onEliminar(horario.idHorario)}
                  disabled={eliminando}
                  aria-label={`Eliminar horario del ${nombreDeDia(horario.dia)} de ${formatRangoHora(horario.horaInicio, horario.horaFin)}`}
                  title="Eliminar horario"
                >
                  <span aria-hidden="true">{eliminando ? '…' : '×'}</span>
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
