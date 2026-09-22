import { useId } from 'react'
import { Badge, Card, EmptyState } from '@/components/ui'
import { getInicial, SIN_DATO } from '@/utils/formatters'
import styles from './InscritosList.module.css'

const asistencia = (inscrito, mostrarAsistencia) => {
  if (!mostrarAsistencia) return { tono: 'neutral', texto: 'Pendiente' }
  return inscrito.asistio
    ? { tono: 'success', texto: 'Asistió' }
    : { tono: 'danger', texto: 'No asistió' }
}

// Tutorados inscritos a una tutoria. La asistencia se muestra cuando la sesion ya ocurrio.
export const InscritosList = ({ inscritos, mostrarAsistencia }) => {
  const idTitulo = useId()

  return (
    <Card as="section" padding="lg" aria-labelledby={idTitulo}>
      <div className={styles.encabezado}>
        <h2 className={styles.titulo} id={idTitulo}>
          Inscritos
        </h2>
        <span className={styles.conteo}>{inscritos.length}</span>
      </div>

      {inscritos.length === 0 ? (
        <EmptyState compact description="Aún no hay inscripciones." />
      ) : (
        <ul className={styles.lista}>
          {inscritos.map((inscrito, indice) => {
            const estado = asistencia(inscrito, mostrarAsistencia)
            return (
              <li
                key={inscrito.idAsistencia ?? inscrito.matricula ?? indice}
                className={styles.inscrito}
              >
                <span className={styles.avatar} aria-hidden="true">
                  {getInicial(inscrito.nombre)}
                </span>
                <span className={styles.datos}>
                  <span className={styles.nombre}>{inscrito.nombre || 'Sin nombre'}</span>
                  <span className={styles.matricula}>
                    Matrícula {inscrito.matricula || SIN_DATO}
                  </span>
                </span>
                <Badge tone={estado.tono}>{estado.texto}</Badge>
              </li>
            )
          })}
        </ul>
      )}
    </Card>
  )
}
