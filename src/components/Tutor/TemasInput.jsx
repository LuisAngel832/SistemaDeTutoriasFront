import { useState } from 'react'
import './temasInput.css'

const TemasInput = ({ temas, onAdd, onRemove, disabled = false, max = 10 }) => {
  const [draft, setDraft] = useState('')

  const handleAgregar = () => {
    if (!draft.trim()) return
    if (temas.length >= max) return
    onAdd(draft)
    setDraft('')
  }

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault()
      handleAgregar()
    }
  }

  const lleno = temas.length >= max

  return (
    <div className="temas-input">
      <div className="temas-input-row">
        <input
          type="text"
          className="temas-input-field"
          placeholder={
            lleno
              ? `Maximo ${max} temas`
              : 'Escribe un tema y presiona Enter'
          }
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled || lleno}
          maxLength={80}
        />
        <button
          type="button"
          className="temas-input-add"
          onClick={handleAgregar}
          disabled={disabled || lleno || !draft.trim()}
        >
          Agregar
        </button>
      </div>

      {temas.length > 0 ? (
        <div className="temas-input-chips">
          {temas.map((tema, index) => (
            <span key={`${tema}-${index}`} className="temas-input-chip">
              {tema}
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
      ) : (
        <p className="temas-input-hint">
          Opcional. Los tutorados veran estos temas en la sesion.
        </p>
      )}
    </div>
  )
}

export default TemasInput
