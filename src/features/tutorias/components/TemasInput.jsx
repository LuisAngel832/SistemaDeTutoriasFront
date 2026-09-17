import { useId, useState } from 'react'
import { Chip } from '../../../components/ui'
import { MAX_CARACTERES_TEMA, MAX_TEMAS } from '../../../constants/tutoria'
import { clases } from '../../../utils/clases'
import { formatTema } from '../../../utils/formatters'
import styles from './TemasInput.module.css'

// Captura de temas de una tutoria (chips). Acepta temas como strings o como { idTema, tema }.
// compact: version reducida para editar temas en el detalle de una tutoria.
export const TemasInput = ({
  temas,
  onAdd,
  onRemove,
  canRemove = () => true,
  disabled = false,
  compact = false,
  inputId,
  label = 'Tema nuevo',
  emptyMessage,
  hint = 'Los tutorados veran estos temas en la sesion.',
  max = MAX_TEMAS,
  maxCaracteres = MAX_CARACTERES_TEMA,
}) => {
  const idGenerado = useId()
  const id = inputId ?? idGenerado
  const idAyuda = `${id}-ayuda`
  const [borrador, setBorrador] = useState('')

  const lleno = temas.length >= max
  const enLimite = borrador.length >= maxCaracteres
  const puedeAgregar = !disabled && !lleno && borrador.trim().length > 0

  const agregar = () => {
    if (!puedeAgregar) return
    onAdd(borrador.trim().slice(0, maxCaracteres))
    setBorrador('')
  }

  const alPresionarTecla = (evento) => {
    if (evento.key === 'Enter' || evento.key === ',') {
      evento.preventDefault()
      agregar()
    }
  }

  return (
    <div className={clases(styles.temas, compact && styles.compacto)}>
      <div className={styles.fila}>
        <input
          id={id}
          type="text"
          className={styles.campo}
          placeholder={lleno ? `Maximo ${max} temas` : 'Escribe un tema y presiona Enter'}
          value={borrador}
          onChange={(evento) => setBorrador(evento.target.value.slice(0, maxCaracteres))}
          onKeyDown={alPresionarTecla}
          disabled={disabled || lleno}
          maxLength={maxCaracteres}
          aria-label={inputId ? undefined : label}
          aria-describedby={idAyuda}
        />
        <button
          type="button"
          className={styles.agregar}
          onClick={agregar}
          disabled={!puedeAgregar}
          aria-label={compact ? 'Agregar tema' : undefined}
        >
          {compact ? <span aria-hidden="true">+</span> : 'Crear'}
        </button>
        {compact ? (
          <span className={clases(styles.contador, enLimite && styles.limite)} aria-hidden="true">
            {borrador.length}/{maxCaracteres}
          </span>
        ) : null}
      </div>

      {temas.length ? (
        <ul className={styles.lista} aria-label="Temas agregados">
          {temas.map((tema, indice) => {
            const texto = formatTema(tema)
            const removible = Boolean(onRemove) && canRemove(tema)
            return (
              <li key={tema.idTema ?? `${texto}-${indice}`}>
                <Chip
                  tone="primary"
                  onRemove={removible ? () => onRemove(tema) : undefined}
                  removeLabel={`Quitar tema ${texto}`}
                  disabled={disabled}
                >
                  {texto}
                </Chip>
              </li>
            )
          })}
        </ul>
      ) : emptyMessage ? (
        <p className={styles.vacio}>{emptyMessage}</p>
      ) : null}

      <div className={styles.meta} id={idAyuda}>
        {compact ? (
          <span className={styles.ayuda}>Maximo {maxCaracteres} caracteres por tema.</span>
        ) : (
          <>
            <span className={styles.ayuda}>{hint}</span>
            <span className={styles.contadores}>
              <span className={clases(styles.contador, enLimite && styles.limite)}>
                {borrador.length}/{maxCaracteres} caracteres
              </span>
              <span className={clases(styles.contador, lleno && styles.limite)}>
                {temas.length}/{max} temas
              </span>
            </span>
          </>
        )}
      </div>
    </div>
  )
}
