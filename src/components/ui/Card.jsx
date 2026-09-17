import { clases } from '../../utils/clases'
import styles from './Card.module.css'

// padding: md | lg. `interactive` agrega el efecto de elevacion al pasar el cursor.
export const Card = ({
  as: Componente = 'div',
  padding = 'md',
  interactive = false,
  className,
  children,
  ...props
}) => (
  <Componente
    className={clases(styles.card, styles[padding], interactive && styles.interactiva, className)}
    {...props}
  >
    {children}
  </Componente>
)
