import { clases } from '@/utils/clases'
import styles from './Indicador.module.css'

// Tarjeta de un indicador: etiqueta en mayusculas, cifra grande y un detalle opcional
// ("86 % · 30 de 35 marcas"). tone: neutral | success | danger
export const Indicador = ({ etiqueta, valor, detalle, tone = 'neutral', className }) => (
  <div className={clases(styles.indicador, className)}>
    <dt className={styles.etiqueta}>{etiqueta}</dt>
    <dd className={styles.cuerpo}>
      <span className={clases(styles.valor, styles[tone])}>{valor}</span>
      {detalle ? <span className={styles.detalle}>{detalle}</span> : null}
    </dd>
  </div>
)

// Contenedor de indicadores en fila (lista de definiciones).
export const Indicadores = ({ className, children }) => (
  <dl className={clases(styles.indicadores, className)}>{children}</dl>
)
