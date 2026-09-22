import { clases } from '@/utils/clases'
import styles from './Alert.module.css'

// Los errores y avisos se anuncian de inmediato (role="alert"); las confirmaciones e
// informacion, sin interrumpir (role="status").
const ROL_POR_TONO = {
  error: 'alert',
  warning: 'alert',
  success: 'status',
  info: 'status',
}

// tone: error | warning | success | info. compact: para avisos dentro de formularios o tarjetas.
export const Alert = ({ tone = 'info', title, compact = false, className, children }) => (
  <div
    className={clases(styles.alerta, styles[tone], compact && styles.compacta, className)}
    role={ROL_POR_TONO[tone]}
  >
    {title ? <strong className={styles.titulo}>{title}</strong> : null}
    {children}
  </div>
)
