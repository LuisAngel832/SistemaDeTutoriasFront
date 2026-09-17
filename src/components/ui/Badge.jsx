import { clases } from '../../utils/clases'
import styles from './Badge.module.css'

// tone: info | success | danger | warning | neutral
export const Badge = ({ tone = 'neutral', className, children }) => (
  <span className={clases(styles.badge, styles[tone], className)}>{children}</span>
)
