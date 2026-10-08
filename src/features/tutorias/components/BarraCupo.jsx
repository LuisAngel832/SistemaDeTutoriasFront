import { clases } from '@/utils/clases'
import { porcentajeCupo, tonoCupo } from '@/utils/cupo'
import styles from './BarraCupo.module.css'

// Ocupacion de una tutoria: "Cupo · 4 de 7" con una barra azul, naranja cuando queda un lugar
// y roja cuando esta llena.
// variante: completa (etiqueta arriba) | mini (barra y "4/7" en linea, para tablas).
export const BarraCupo = ({ cupo, etiqueta = 'Cupo', variante = 'completa', texto, className }) => {
  const tono = tonoCupo(cupo)
  const ocupados = cupo?.ocupados ?? 0
  const maximo = cupo?.maximo ?? 0
  const descripcion = `${etiqueta}: ${ocupados} de ${maximo} lugares ocupados`

  const barra = (
    <div
      className={styles.pista}
      role="meter"
      aria-label={descripcion}
      aria-valuemin={0}
      aria-valuemax={maximo}
      aria-valuenow={ocupados}
    >
      <span
        className={clases(styles.relleno, styles[tono])}
        style={{ width: `${porcentajeCupo(cupo)}%` }}
      />
    </div>
  )

  if (variante === 'mini') {
    return (
      <div className={clases(styles.mini, className)}>
        {barra}
        <span className={clases(styles.cifraMini, styles[`texto-${tono}`])} aria-hidden="true">
          {ocupados}/{maximo}
        </span>
      </div>
    )
  }

  return (
    <div className={clases(styles.cupo, className)}>
      <div className={styles.encabezado} aria-hidden="true">
        <span className={styles.etiqueta}>{etiqueta}</span>
        <span className={clases(styles.cifra, styles[`texto-${tono}`])}>
          {texto ?? `${ocupados} de ${maximo}`}
        </span>
      </div>
      {barra}
    </div>
  )
}
