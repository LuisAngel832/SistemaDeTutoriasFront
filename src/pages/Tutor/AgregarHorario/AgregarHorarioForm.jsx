import { useState } from 'react'
import useHorarios from '../../../hooks/useHorarios'

const DIAS = [
  { key: 'LUNES', short: 'LUN', label: 'Lunes' },
  { key: 'MARTES', short: 'MAR', label: 'Martes' },
  { key: 'MIERCOLES', short: 'MIE', label: 'Miercoles' },
  { key: 'JUEVES', short: 'JUE', label: 'Jueves' },
  { key: 'VIERNES', short: 'VIE', label: 'Viernes' },
  { key: 'SABADO', short: 'SAB', label: 'Sabado' },
  { key: 'DOMINGO', short: 'DOM', label: 'Domingo' },
]

const toSeconds = (time) => (time ? `${time}:00` : '')

const AgregarHorarioForm = () => {
  const { horarios, isLoading, error: errorLista, crearHorario, eliminarHorario } =
    useHorarios()

  const [dia, setDia] = useState('')
  const [horaInicio, setHoraInicio] = useState('')
  const [horaFin, setHoraFin] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [feedback, setFeedback] = useState(null)
  const [eliminandoId, setEliminandoId] = useState(null)

  const limpiar = () => {
    setDia('')
    setHoraInicio('')
    setHoraFin('')
  }

  const handleAgregar = async () => {
    setFeedback(null)

    if (!dia || !horaInicio || !horaFin) {
      setFeedback({ type: 'error', text: 'Completa todos los campos.' })
      return
    }

    if (horaFin <= horaInicio) {
      setFeedback({
        type: 'error',
        text: 'La hora final debe ser mayor que la hora de inicio.',
      })
      return
    }

    const payload = {
      dia: DIAS.find((d) => d.key === dia)?.label || dia,
      horaInicio: toSeconds(horaInicio),
      horaFin: toSeconds(horaFin),
    }

    setIsSubmitting(true)
    try {
      await crearHorario(payload)
      setFeedback({ type: 'success', text: 'Horario creado correctamente.' })
      limpiar()
    } catch (err) {
      setFeedback({ type: 'error', text: err.message })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEliminar = async (idHorario) => {
    if (!idHorario) return
    setFeedback(null)
    setEliminandoId(idHorario)
    try {
      await eliminarHorario(idHorario)
      setFeedback({ type: 'success', text: 'Horario eliminado.' })
    } catch (err) {
      setFeedback({ type: 'error', text: err.message })
    } finally {
      setEliminandoId(null)
    }
  }

  return (
    <section className="main-agregar-horario">
      <div className="content-horario">
        <div className="horario-header">
          <h2>
            <span className="horario-icon" aria-hidden="true">🕐</span>
            Crear Horario
          </h2>
          <p className="horario-subtitle">
            Define los bloques recurrentes en los que puedes dar tutorias.
          </p>
        </div>

        {feedback ? (
          <div className={`horario-feedback ${feedback.type}`}>{feedback.text}</div>
        ) : null}

        <div className="horario-form">
          <div className="form-field full">
            <label className="form-label" id="label-dia-semana">
              Dia de la semana en que estaras disponible
            </label>
            <div
              className="dia-chips"
              role="radiogroup"
              aria-labelledby="label-dia-semana"
            >
              {DIAS.map((d) => (
                <button
                  key={d.key}
                  type="button"
                  role="radio"
                  aria-checked={dia === d.key}
                  className={`dia-chip${dia === d.key ? ' active' : ''}`}
                  onClick={() => setDia(d.key)}
                >
                  <span className="dia-chip-short">{d.short}</span>
                  <span className="dia-chip-full">{d.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="form-field">
            <label htmlFor="hora-inicio" className="form-label">
              Hora en que inicia tu disponibilidad
            </label>
            <input
              id="hora-inicio"
              type="time"
              className="form-input"
              value={horaInicio}
              onChange={(event) => setHoraInicio(event.target.value)}
              required
            />
          </div>

          <div className="form-field">
            <label htmlFor="hora-fin" className="form-label">
              Hora en que termina tu disponibilidad
            </label>
            <input
              id="hora-fin"
              type="time"
              className="form-input"
              value={horaFin}
              onChange={(event) => setHoraFin(event.target.value)}
              required
            />
          </div>
        </div>

        <div className="horario-actions">
          <button
            type="button"
            className="btn-secundario"
            onClick={limpiar}
            disabled={isSubmitting}
          >
            Limpiar
          </button>
          <button
            type="button"
            className="btn-aceptar"
            onClick={handleAgregar}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <span className="btn-spinner" aria-hidden="true" />
                Guardando...
              </>
            ) : (
              'Crear Horario'
            )}
          </button>
        </div>

        <div className="horarios-lista-wrap">
          <div className="horarios-lista-header">
            <h3>Mis horarios</h3>
            <span className="horarios-count">{horarios.length}</span>
          </div>

          {errorLista ? <div className="horario-feedback error">{errorLista}</div> : null}

          {isLoading ? (
            <div className="horarios-lista">
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="horario-item skeleton" />
              ))}
            </div>
          ) : horarios.length === 0 ? (
            <div className="horarios-empty">
              Aun no tienes horarios. Crea uno arriba para empezar.
            </div>
          ) : (
            <ul className="horarios-lista">
              {horarios.map((h) => (
                <li key={h.idHorario} className="horario-item">
                  <div className="horario-item-info">
                    <span className="horario-item-dia">{h.dia}</span>
                    <span className="horario-item-hora">
                      {h.horaInicio?.slice(0, 5)} – {h.horaFin?.slice(0, 5)}
                    </span>
                  </div>
                  <button
                    type="button"
                    className="horario-item-del"
                    onClick={() => handleEliminar(h.idHorario)}
                    disabled={eliminandoId === h.idHorario}
                    aria-label={`Eliminar horario ${h.dia}`}
                    title="Eliminar horario"
                  >
                    {eliminandoId === h.idHorario ? '…' : '×'}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  )
}

export default AgregarHorarioForm
