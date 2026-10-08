import { clases } from '@/utils/clases'
import { getInicial, getIniciales } from '@/utils/formatters'
import styles from './Avatar.module.css'

// Circulo con las iniciales de una persona. `una` muestra solo la primera letra (comentarios,
// listas); size: sm | md | lg.
export const Avatar = ({ nombre, una = false, size = 'md', className }) => (
  <span className={clases(styles.avatar, styles[size], className)} aria-hidden="true">
    {una ? getInicial(nombre) : getIniciales(nombre)}
  </span>
)
