import { useState } from 'react'
import { clases } from '../../utils/clases'
import styles from './Field.module.css'

// Controles de formulario con el estilo del sistema. Aceptan todas las props nativas;
// `invalid` marca el campo con error (aria-invalid).

export const Input = ({ invalid, className, ...props }) => (
  <input
    className={clases(styles.control, className)}
    aria-invalid={invalid || undefined}
    {...props}
  />
)

export const Select = ({ invalid, className, children, ...props }) => (
  <div className={styles.selectWrap}>
    <select
      className={clases(styles.control, styles.select, className)}
      aria-invalid={invalid || undefined}
      {...props}
    >
      {children}
    </select>
  </div>
)

export const Textarea = ({ invalid, className, ...props }) => (
  <textarea
    className={clases(styles.control, styles.textarea, className)}
    aria-invalid={invalid || undefined}
    {...props}
  />
)

export const PasswordInput = ({ invalid, className, ...props }) => {
  const [visible, setVisible] = useState(false)

  return (
    <div className={styles.conAccion}>
      <input
        type={visible ? 'text' : 'password'}
        className={clases(styles.control, className)}
        aria-invalid={invalid || undefined}
        {...props}
      />
      <button
        type="button"
        className={styles.accion}
        onClick={() => setVisible((actual) => !actual)}
        aria-pressed={visible}
        aria-controls={props.id}
      >
        {visible ? 'Ocultar' : 'Mostrar'}
      </button>
    </div>
  )
}
