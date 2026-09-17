import { useEffect, useId, useRef } from 'react'
import { clases } from '../../utils/clases'
import styles from './Modal.module.css'

// Dialogo modal sobre <dialog> nativo: el navegador bloquea el resto de la pagina, mueve el
// foco adentro, lo devuelve al cerrar y cierra con Escape.
export const Modal = ({ open, onClose, title, description, actions, className, children }) => {
  const ref = useRef(null)
  const idTitulo = useId()
  const idDescripcion = useId()

  useEffect(() => {
    const dialogo = ref.current
    if (!dialogo) return
    if (open && !dialogo.open) dialogo.showModal()
    if (!open && dialogo.open) dialogo.close()
  }, [open])

  const cancelar = (evento) => {
    // Escape: se deja el control del estado a quien usa el modal.
    evento.preventDefault()
    onClose?.()
  }

  const clicEnFondo = (evento) => {
    if (evento.target === evento.currentTarget) onClose?.()
  }

  return (
    // El clic en el fondo es un atajo de mouse; con teclado se cierra con Escape o los botones.
    // eslint-disable-next-line jsx-a11y-x/click-events-have-key-events, jsx-a11y-x/no-noninteractive-element-interactions
    <dialog
      ref={ref}
      className={clases(styles.modal, className)}
      aria-labelledby={title ? idTitulo : undefined}
      aria-describedby={description ? idDescripcion : undefined}
      onCancel={cancelar}
      onClick={clicEnFondo}
    >
      <div className={styles.contenido}>
        {title ? (
          <h2 className={styles.titulo} id={idTitulo}>
            {title}
          </h2>
        ) : null}
        {description ? (
          <p className={styles.descripcion} id={idDescripcion}>
            {description}
          </p>
        ) : null}
        {children}
        {actions ? <div className={styles.acciones}>{actions}</div> : null}
      </div>
    </dialog>
  )
}
