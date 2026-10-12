import { Children, cloneElement, isValidElement } from 'react'
import { clases } from '@/utils/clases'
import styles from './FormField.module.css'

// Etiqueta + control + ayuda o error. Conecta el control con aria-describedby y aria-invalid.
// El primer hijo (el control) debe tener el mismo `id` que `htmlFor`.
export const FormField = ({ label, htmlFor, hint, error, className, children }) => {
  const idAyuda = hint ? `${htmlFor}-ayuda` : null
  const idError = error ? `${htmlFor}-error` : null
  const describedBy = [idError, idAyuda].filter(Boolean).join(' ') || undefined

  // Solo el primer elemento es el control; el resto (avisos, enlaces) se muestra tal cual.
  const hijos = Children.toArray(children)
  const indiceControl = hijos.findIndex((hijo) => isValidElement(hijo))
  const control = hijos.map((hijo, indice) =>
    indice === indiceControl
      ? cloneElement(hijo, {
          'aria-describedby':
            [describedBy, hijo.props['aria-describedby']].filter(Boolean).join(' ') || undefined,
          invalid: hijo.props.invalid ?? Boolean(error),
        })
      : hijo,
  )

  return (
    <div className={clases(styles.campo, className)}>
      <label className={styles.etiqueta} htmlFor={htmlFor}>
        {label}
      </label>
      {control}
      {error ? (
        <p className={styles.error} id={idError}>
          {error}
        </p>
      ) : null}
      {hint ? (
        <p className={styles.ayuda} id={idAyuda}>
          {hint}
        </p>
      ) : null}
    </div>
  )
}
