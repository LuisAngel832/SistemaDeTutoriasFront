import { clases } from '@/utils/clases'
import styles from './EmptyState.module.css'

export const EmptyState = ({ title, description, action, compact = false, className }) => (
  <div className={clases(styles.vacio, compact && styles.compacto, className)}>
    {title ? <h2 className={styles.titulo}>{title}</h2> : null}
    {description ? <p className={styles.descripcion}>{description}</p> : null}
    {action ? <div className={styles.accion}>{action}</div> : null}
  </div>
)
