import { useState } from 'react'
import './temasInput.css'

// Limite por tema: evita textos tan largos que desborden la tarjeta del formulario.
const MAX_CARACTERES = 60

const TemasInput = ({
  temas,
  onAdd,
  onRemove,
  disabled = false,
  max = 10,
  maxCaracteres = MAX_CARACTERES,
  inputId = 'tema-nuevo',
}) => {
  const [draft, setDraft] = useState('')

  const handleCrear = () => {
    if (!draft.trim()) return
    if (temas.length >= max) return
    onAdd(draft.slice(0, maxCaracteres))
    setDraft('')
  }

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault()
      handleCrear()
    }
  }

  const lleno = temas.length >= max
  const enLimite = draft.length >= maxCaracteres

  return (
    <div className="temas-input">
      <div className="temas-input-row">
        <input
          id={inputId}
          type="text"
          className="temas-input-field"
          placeholder={
            lleno
              ? `Maximo ${max} temas`
              : 'Escribe un tema y presiona Enter'
          }
          value={draft}
          onChange={(event) =>
            setDraft(event.target.value.slice(0, maxCaracteres))
          }
          onKeyDown={handleKeyDown}
          disabled={disabled || lleno}
          maxLength={maxCaracteres}
          aria-describedby={`${inputId}-ayuda`}
        />
        <button
          type="button"
          className="temas-input-add"
          onClick={handleCrear}
          disabled={disabled || lleno || !draft.trim()}
          aria-label="Crear tema"
        >
          Crear
        </button>
      </div>

      {temas.length > 0 ? (
        <div className="temas-input-chips">
          {temas.map((tema, index) => (
            <span key={`${tema}-${index}`} className="temas-input-chip">
              <span className="temas-input-chip-text">{tema}</span>
              <button
                type="button"
                className="temas-input-chip-x"
                onClick={() => onRemove(tema)}
                disabled={disabled}
                aria-label={`Quitar tema ${tema}`}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      ) : null}

      <div className="temas-input-meta" id={`${inputId}-ayuda`}>
        <span className="temas-input-hint">
          Los tutorados veran estos temas en la sesion.
        </span>
        <span className="temas-input-counters">
          <span className={`temas-input-count${enLimite ? ' limite' : ''}`}>
            {draft.length}/{maxCaracteres} caracteres
          </span>
          <span className={`temas-input-count${lleno ? ' limite' : ''}`}>
            {temas.length}/{max} temas
          </span>
        </span>
      </div>
    </div>
  )
}

export default TemasInput
