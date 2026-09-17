import { clases } from '../../utils/clases'
import styles from './Chip.module.css'

// tone: neutral | primary. Con `onRemove` muestra un boton para quitarlo.
export const Chip = ({
  tone = 'neutral',
  onRemove,
  removeLabel = 'Quitar',
  disabled = false,
  className,
  children,
}) => (
  <span className={clases(styles.chip, styles[tone], onRemove && styles.removible, className)}>
    <span className={styles.texto}>{children}</span>
    {onRemove ? (
      <button
        type="button"
        className={styles.quitar}
        onClick={onRemove}
        disabled={disabled}
        aria-label={removeLabel}
      >
        <span aria-hidden="true">×</span>
      </button>
    ) : null}
  </span>
)
