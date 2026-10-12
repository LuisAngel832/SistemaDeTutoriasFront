import { INASISTENCIAS_PERMITIDAS } from '@/constants/tutoria'
import { clases } from '@/utils/clases'
import { pluralizar } from '@/utils/formatters'
import styles from './MedidorInasistencias.module.css'

// Inasistencias de un tutorado: un segmento por inasistencia permitida y uno punteado mas,
// el de la baja automatica (RN-11).
// `etiqueta` muestra la linea "Inasistencias · 1 de 2 permitidas".
export const MedidorInasistencias = ({
  inasistencias = 0,
  permitidas = INASISTENCIAS_PERMITIDAS,
  etiqueta = true,
  className,
}) => {
  const baja = inasistencias > permitidas
  const total = permitidas + 1
  const texto = baja
    ? pluralizar(inasistencias, 'inasistencia')
    : `${inasistencias} de ${permitidas} permitidas`

  return (
    <div className={clases(styles.medidor, className)}>
      {etiqueta ? (
        <div className={styles.encabezado}>
          <span className={styles.etiqueta}>Inasistencias</span>
          <span
            className={clases(
              styles.cifra,
              baja ? styles.textoBaja : inasistencias > 0 && styles.textoAviso,
            )}
          >
            {texto}
          </span>
        </div>
      ) : null}
      <div
        className={styles.segmentos}
        role="meter"
        aria-label={`Inasistencias: ${texto}`}
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={Math.min(inasistencias, total)}
      >
        {Array.from({ length: total }, (_, indice) => {
          const ocupado = indice < inasistencias
          const esLimite = indice === total - 1
          return (
            <span
              key={indice}
              className={clases(
                styles.segmento,
                esLimite && !ocupado && styles.limite,
                ocupado && (esLimite ? styles.baja : styles.ocupado),
              )}
            />
          )
        })}
      </div>
    </div>
  )
}
