import { clases } from '../../utils/clases'
import styles from './Skeleton.module.css'

// Bloque de carga decorativo: el contenedor debe indicar aria-busy mientras carga.
export const Skeleton = ({ height = 160, className }) => (
  <div className={clases(styles.skeleton, className)} style={{ height }} aria-hidden="true" />
)
