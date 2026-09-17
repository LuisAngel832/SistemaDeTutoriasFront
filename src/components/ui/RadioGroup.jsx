import { useId } from 'react'
import { clases } from '../../utils/clases'
import styles from './RadioGroup.module.css'

// Radios nativos con apariencia de tarjeta o chip: se navegan con flechas y Tab como
// cualquier grupo de radios.
// options: [{ value, label, description?, shortLabel? }]
// variant: card (titulo + descripcion) | chip (etiqueta corta + larga, en fila)
export const RadioGroup = ({
  name,
  legend,
  options,
  value,
  onChange,
  variant = 'card',
  disabled = false,
  className,
}) => {
  const idBase = useId()

  return (
    <fieldset className={clases(styles.grupo, className)}>
      <legend className={styles.leyenda}>{legend}</legend>
      <div className={clases(styles.opciones, styles[variant])}>
        {options.map((opcion, indice) => {
          const activa = opcion.value === value
          // El nombre del radio es solo la etiqueta; la descripcion se anuncia aparte.
          const idEtiqueta = `${idBase}-${indice}-etiqueta`
          const idDescripcion = opcion.description ? `${idBase}-${indice}-descripcion` : undefined

          return (
            <label
              key={opcion.value}
              className={clases(
                styles.opcion,
                activa && styles.activa,
                disabled && styles.deshabilitada,
              )}
            >
              <input
                type="radio"
                className={styles.input}
                name={name}
                value={opcion.value}
                checked={activa}
                disabled={disabled}
                onChange={() => onChange(opcion.value)}
                aria-labelledby={idEtiqueta}
                aria-describedby={idDescripcion}
              />
              {variant === 'chip' ? (
                <>
                  <span className={styles.corta} aria-hidden="true">
                    {opcion.shortLabel ?? opcion.label}
                  </span>
                  <span className={styles.larga} id={idEtiqueta}>
                    {opcion.label}
                  </span>
                </>
              ) : (
                <>
                  <span className={styles.titulo}>
                    <span className={styles.circulo} aria-hidden="true" />
                    <span id={idEtiqueta}>{opcion.label}</span>
                  </span>
                  {opcion.description ? (
                    <span className={styles.descripcion} id={idDescripcion}>
                      {opcion.description}
                    </span>
                  ) : null}
                </>
              )}
            </label>
          )
        })}
      </div>
    </fieldset>
  )
}
