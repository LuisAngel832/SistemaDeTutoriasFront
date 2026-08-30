import { useState } from 'react'
import useComentarios from '../hooks/useComentarios'
import './comentarios.css'

const Comentarios = ({ idTutoria, modo = 'lectura', maxLength = 280 }) => {
  const { comentarios, isLoading, error, crear, eliminar } = useComentarios(idTutoria)
  const [texto, setTexto] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [feedback, setFeedback] = useState(null)
  const [eliminandoId, setEliminandoId] = useState(null)

  const matricula = localStorage.getItem('matricula')
  const puedeEscribir = modo === 'tutorado'

  const handleEnviar = async (event) => {
    event.preventDefault()
    if (!texto.trim()) return
    setFeedback(null)
    setSubmitting(true)
    const res = await crear(texto)
    setSubmitting(false)
    if (res.ok) {
      setTexto('')
      setFeedback({ type: 'success', text: res.message })
    } else {
      setFeedback({ type: 'error', text: res.message })
    }
  }

  const handleEliminar = async (idComentario) => {
    setFeedback(null)
    setEliminandoId(idComentario)
    const res = await eliminar(idComentario)
    setEliminandoId(null)
    if (!res.ok) {
      setFeedback({ type: 'error', text: res.message })
    }
  }

  return (
    <div className="cmt-wrap">
      {puedeEscribir ? (
        <form className="cmt-form" onSubmit={handleEnviar}>
          <label htmlFor="cmt-texto" className="cmt-label">
            Tema u observacion que quieres compartir con el tutor
          </label>
          <textarea
            id="cmt-texto"
            className="cmt-textarea"
            placeholder="Sugiere un tema o deja una observacion para el tutor..."
            value={texto}
            onChange={(event) => setTexto(event.target.value)}
            maxLength={maxLength}
            rows={3}
            disabled={submitting}
          />
          <div className="cmt-form-bottom">
            <span className="cmt-count">
              {texto.length}/{maxLength}
            </span>
            <button
              type="submit"
              className="cmt-btn-primary"
              disabled={submitting || !texto.trim()}
            >
              {submitting ? 'Publicando...' : 'Publicar comentario'}
            </button>
          </div>
        </form>
      ) : null}

      {feedback ? (
        <div className={`cmt-feedback ${feedback.type}`}>{feedback.text}</div>
      ) : null}

      {error ? <div className="cmt-feedback error">{error}</div> : null}

      {isLoading ? (
        <p className="cmt-loading">Cargando comentarios...</p>
      ) : comentarios.length === 0 ? (
        <p className="cmt-empty">
          {puedeEscribir
            ? 'Aun no hay comentarios. Se el primero en sugerir un tema.'
            : 'Aun no hay comentarios de los tutorados.'}
        </p>
      ) : (
        <ul className="cmt-lista">
          {comentarios.map((c) => {
            const esMio = c.matricula && c.matricula === matricula
            const inicial = (c.nombre || c.matricula || '?')
              .slice(0, 1)
              .toUpperCase()

            return (
              <li key={c.idComentario} className="cmt-item">
                <div className="cmt-avatar" aria-hidden="true">
                  {inicial}
                </div>
                <div className="cmt-body">
                  <div className="cmt-head">
                    <span className="cmt-autor">
                      {c.nombre || c.matricula || 'Tutorado'}
                      {esMio ? <span className="cmt-yo">tu</span> : null}
                    </span>
                  </div>
                  <p className="cmt-texto">{c.comentario}</p>
                </div>

                {esMio && puedeEscribir ? (
                  <button
                    type="button"
                    className="cmt-del"
                    onClick={() => handleEliminar(c.idComentario)}
                    disabled={eliminandoId === c.idComentario}
                    aria-label="Eliminar mi comentario"
                  >
                    {eliminandoId === c.idComentario ? '…' : '×'}
                  </button>
                ) : null}
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

export default Comentarios
