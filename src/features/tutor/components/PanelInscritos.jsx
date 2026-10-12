import { useId } from 'react'
import { Avatar, Badge, Card } from '@/components/ui'
import { IconAlerta } from '@/components/ui/icons'
import { BarraCupo } from '@/features/tutorias/components/BarraCupo'
import { clases } from '@/utils/clases'
import { pluralizar } from '@/utils/formatters'
import styles from './PanelInscritos.module.css'

// Inscritos de una tutoria con sus inasistencias (pantalla 11). `enRiesgo` = 2 inasistencias.
export const PanelInscritos = ({ datos }) => {
  const idTitulo = useId()
  const cupo = datos?.cupo
  const inscritos = datos?.inscritos ?? []

  return (
    <Card as="section" padding="lg" aria-labelledby={idTitulo}>
      <div className={styles.encabezado}>
        <h2 className={styles.titulo} id={idTitulo}>
          Inscritos
        </h2>
        {cupo ? (
          <Badge tone="info">
            {cupo.ocupados} de {cupo.maximo}
          </Badge>
        ) : null}
      </div>
      {cupo ? (
        <BarraCupo cupo={cupo} etiqueta="Inscritos" variante="barra" className={styles.barra} />
      ) : null}

      {inscritos.length ? (
        <ul className={styles.lista}>
          {inscritos.map((inscrito) => (
            <li
              key={inscrito.matricula}
              className={clases(styles.inscrito, inscrito.enRiesgo && styles.riesgo)}
            >
              <Avatar nombre={inscrito.nombreCompleto} una size="sm" />
              <div className={styles.datos}>
                <strong>{inscrito.nombreCompleto}</strong>
                <span>
                  {inscrito.matricula} · {pluralizar(inscrito.inasistencias ?? 0, 'inasistencia')}
                </span>
                {inscrito.enRiesgo ? (
                  <span className={styles.aviso}>
                    <IconAlerta /> En riesgo de baja
                  </span>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className={styles.vacio}>Todavía no hay tutorados inscritos.</p>
      )}

      <p className={styles.nota}>
        Con la tercera inasistencia en una sesión completada, la baja es automática.
      </p>
    </Card>
  )
}
