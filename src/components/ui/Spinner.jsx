import { clases } from '@/utils/clases'
import styles from './Spinner.module.css'

// Decorativo: quien lo usa debe comunicar el estado de carga con texto o aria-busy.
export const Spinner = ({ size = 'md', tone = 'primary', className }) => (
  <span
    className={clases(styles.spinner, styles[size], styles[tone], className)}
    aria-hidden="true"
  />
)
