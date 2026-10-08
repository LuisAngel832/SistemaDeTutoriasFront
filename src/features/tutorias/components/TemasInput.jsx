import { useId, useState } from 'react'
import { Chip } from '@/components/ui'
import { MAX_CARACTERES_TEMA, MAX_TEMAS } from '@/constants/tutoria'
import { clases } from '@/utils/clases'
import { formatTema } from '@/utils/formatters'
import styles from './TemasInput.module.css'

// Captura de los temas de un horario (chips). Acepta temas como strings o como { idTema, tema }.
export const TemasInput = ({
  temas,
  onAdd,
  onRemove,
  disabled = false,
  label = 'Tema nuevo',
  hint = 'Los tutorados verán estos temas en la sesión.',
  max = MAX_TEMAS,
  maxCaracteres = MAX_CARACTERES_TEMA,
}) => {
  const idAyuda = useId()
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
    <div className={styles.temas}>
      <div className={styles.fila}>
        <input
          type="text"
          className={styles.campo}
          placeholder={lleno ? `Máximo ${max} temas` : 'Escribe un tema y presiona Enter'}
          value={borrador}
          onChange={(evento) => setBorrador(evento.target.value.slice(0, maxCaracteres))}
          onKeyDown={alPresionarTecla}
          disabled={disabled || lleno}
          maxLength={maxCaracteres}
          aria-label={label}
          aria-describedby={idAyuda}
        />
        <button type="button" className={styles.agregar} onClick={agregar} disabled={!puedeAgregar}>
          Crear
        </button>
      </div>

      {temas.length ? (
        <ul className={styles.lista} aria-label="Temas agregados">
          {temas.map((tema, indice) => {
            const texto = formatTema(tema)
            return (
              <li key={tema.idTema ?? `${texto}-${indice}`}>
                <Chip
                  tone="primary"
                  onRemove={onRemove ? () => onRemove(tema) : undefined}
                  removeLabel={`Quitar tema ${texto}`}
                  disabled={disabled}
                >
                  {texto}
                </Chip>
              </li>
            )
          })}
        </ul>
      ) : null}

      <div className={styles.meta} id={idAyuda}>
        <span className={styles.ayuda}>{hint}</span>
        <span className={styles.contadores}>
          <span className={clases(styles.contador, enLimite && styles.limite)}>
            {borrador.length}/{maxCaracteres} caracteres
          </span>
          <span className={clases(styles.contador, lleno && styles.limite)}>
            {temas.length}/{max} temas
          </span>
        </span>
      </div>
    </div>
  )
}
