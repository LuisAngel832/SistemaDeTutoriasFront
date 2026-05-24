import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import Header from '../../../components/Tutor/Header'
import Comentarios from '../../../components/Comentarios'
import useHorarios from '../../../hooks/useHorarios'
import useTutoriaDetalleTutor from '../../../hooks/useTutoriaDetalleTutor'
import './tutoriaDetalleTutor.css'

const ESTADO_CLASS = {
  PROGRAMADA: 'programada',
  COMPLETADA: 'completada',
  CANCELADA: 'cancelada',
}

const formatFecha = (fecha) => {
  if (!fecha) return '—'
  try {
    return new Date(`${fecha}T00:00:00`).toLocaleDateString('es-MX', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    })
  } catch {
    return fecha
  }
}

const formatHora = (hora) => (hora ? hora.slice(0, 5) : '—')

const TemaQuickInput = ({ onAdd, disabled }) => {
  const [draft, setDraft] = useState('')

  const submit = () => {
    if (!draft.trim()) return
    onAdd(draft)
    setDraft('')
  }

  return (
    <div className="tdt-tema-add">
      <input
        type="text"
        className="tdt-tema-add-input"
        placeholder="Agregar un tema..."
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault()
            submit()
          }
        }}
        disabled={disabled}
        maxLength={80}
      />
      <button
        type="button"
        className="tdt-tema-add-btn"
        onClick={submit}
        disabled={disabled || !draft.trim()}
      >
        +
      </button>
    </div>
  )
}

// La tutoria ya ocurrio si ya paso la hora de inicio o esta marcada como completada/cancelada.
const yaTuvoLugar = (tutoria) => {
  if (!tutoria) return false
  const estado = tutoria.estado?.toUpperCase()
  if (estado === 'COMPLETADA' || estado === 'CANCELADA') return true
  if (!tutoria.fecha || !tutoria.horaInicio) return false
  try {
    const inicio = new Date(`${tutoria.fecha}T${tutoria.horaInicio}`)
    return !Number.isNaN(inicio.getTime()) && inicio.getTime() <= Date.now()
  } catch {
    return false
  }
}

const TutoriaDetalleTutor = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const {
    tutoria,
    inscritos,
    isLoading,
    error,
    isSubmitting,
    actualizar,
    cancelar,
    completar,
    agregarTema,
    quitarTema,
  } = useTutoriaDetalleTutor(id)

  const { horarios } = useHorarios()

  const [editMode, setEditMode] = useState(false)
  const [confirmCancel, setConfirmCancel] = useState(false)
  const [confirmComplete, setConfirmComplete] = useState(false)
  const [feedback, setFeedback] = useState(null)

  // Form de edicion
  const [idHorario, setIdHorario] = useState('')
  const [edificio, setEdificio] = useState('')
  const [aula, setAula] = useState('')
  const [fecha, setFecha] = useState('')

  useEffect(() => {
    if (tutoria && editMode) {
      setEdificio(String(tutoria.edificio ?? ''))
      setAula(String(tutoria.aula ?? ''))
      setFecha(tutoria.fecha ?? '')
    }
  }, [tutoria, editMode])

  const estadoUpper = tutoria?.estado?.toUpperCase()
  const estadoClass = ESTADO_CLASS[estadoUpper] || 'otro'
  const esCancelable = estadoUpper === 'PROGRAMADA'
  const mostrarAsistencia = yaTuvoLugar(tutoria)

  const handleGuardar = async () => {
    setFeedback(null)

    const payload = {
      idHorario: Number(idHorario),
      edificio: Number(edificio),
      aula: Number(aula),
      fecha,
    }

    if (
      !Number.isFinite(payload.idHorario) ||
      !Number.isFinite(payload.edificio) ||
      !Number.isFinite(payload.aula) ||
      !payload.fecha
    ) {
      setFeedback({ type: 'error', text: 'Completa todos los campos correctamente.' })
      return
    }

    const res = await actualizar(payload)
    setFeedback({ type: res.ok ? 'success' : 'error', text: res.message })
    if (res.ok) setEditMode(false)
  }

  const handleConfirmCancel = async () => {
    setFeedback(null)
    setConfirmCancel(false)
    const res = await cancelar()
    setFeedback({ type: res.ok ? 'success' : 'error', text: res.message })
  }

  const handleConfirmComplete = async () => {
    setFeedback(null)
    setConfirmComplete(false)
    const res = await completar()
    setFeedback({ type: res.ok ? 'success' : 'error', text: res.message })
  }

  const handleAgregarTema = async (texto) => {
    setFeedback(null)
    const res = await agregarTema(texto)
    if (!res.ok) {
      setFeedback({ type: 'error', text: res.message })
    }
  }

  const handleQuitarTema = async (idTema) => {
    setFeedback(null)
    const res = await quitarTema(idTema)
    if (!res.ok) {
      setFeedback({ type: 'error', text: res.message })
    }
  }

  const hoy = new Date().toISOString().split('T')[0]

  return (
    <div className="tdt-page">
      <Header />

      <main className="tdt-main">
        <button
          type="button"
          className="tdt-back"
          onClick={() => navigate('/tutor/home')}
        >
          ← Mis tutorias
        </button>

        {isLoading ? (
          <div className="tdt-skeleton-wrap">
            <div className="tdt-skeleton hero" />
            <div className="tdt-skeleton side" />
          </div>
        ) : error ? (
          <div className="tdt-error">
            {error}
            <Link to="/tutor/home" className="tdt-error-back">
              Volver a mis tutorias
            </Link>
          </div>
        ) : tutoria ? (
          <>
            {feedback ? (
              <div className={`tdt-feedback ${feedback.type}`}>{feedback.text}</div>
            ) : null}

            <div className="tdt-grid">
              {/* HERO + EDICION */}
              <article className="tdt-hero">
                <div className="tdt-hero-header">
                  <div className="tdt-hero-titles">
                    <h1 className="tdt-materia">
                      {tutoria.materia || 'Materia sin nombre'}
                    </h1>
                    {tutoria.nombreTutor ? (
                      <p className="tdt-tutor">
                        <span className="tdt-tutor-label">Imparte</span>{' '}
                        {tutoria.nombreTutor}
                      </p>
                    ) : null}
                  </div>
                  <span className={`tdt-estado ${estadoClass}`}>
                    {tutoria.estado || 'SIN ESTADO'}
                  </span>
                </div>

                {!editMode ? (
                  <>
                    <div className="tdt-info-grid">
                      <div className="tdt-info-item">
                        <span className="tdt-info-icon" aria-hidden="true">📅</span>
                        <div>
                          <span className="tdt-info-label">Fecha</span>
                          <span className="tdt-info-value">{formatFecha(tutoria.fecha)}</span>
                        </div>
                      </div>

                      <div className="tdt-info-item">
                        <span className="tdt-info-icon" aria-hidden="true">🕐</span>
                        <div>
                          <span className="tdt-info-label">Horario</span>
                          <span className="tdt-info-value">
                            {formatHora(tutoria.horaInicio)} – {formatHora(tutoria.horaFin)}
                          </span>
                        </div>
                      </div>

                      <div className="tdt-info-item">
                        <span className="tdt-info-icon" aria-hidden="true">🏛️</span>
                        <div>
                          <span className="tdt-info-label">Edificio</span>
                          <span className="tdt-info-value">{tutoria.edificio ?? '—'}</span>
                        </div>
                      </div>

                      <div className="tdt-info-item">
                        <span className="tdt-info-icon" aria-hidden="true">🚪</span>
                        <div>
                          <span className="tdt-info-label">Aula</span>
                          <span className="tdt-info-value">{tutoria.aula ?? '—'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="tdt-temas-section">
                      <h3 className="tdt-section-title">Temas a revisar</h3>

                      {esCancelable ? (
                        <>
                          <div className="tdt-temas tdt-temas-editables">
                            {tutoria.temas?.length ? (
                              tutoria.temas.map((tema, index) => (
                                <span
                                  key={tema.idTema ?? index}
                                  className="tdt-tema-chip editable"
                                >
                                  {tema.tema || tema.nombre || String(tema)}
                                  {tema.idTema ? (
                                    <button
                                      type="button"
                                      className="tdt-tema-x"
                                      onClick={() => handleQuitarTema(tema.idTema)}
                                      disabled={isSubmitting}
                                      aria-label={`Quitar tema ${tema.tema}`}
                                    >
                                      ×
                                    </button>
                                  ) : null}
                                </span>
                              ))
                            ) : (
                              <span className="tdt-temas-empty">
                                Aun no hay temas. Agrega abajo.
                              </span>
                            )}
                          </div>

                          <div className="tdt-tema-add-wrap">
                            <TemaQuickInput
                              onAdd={handleAgregarTema}
                              disabled={isSubmitting}
                            />
                          </div>
                        </>
                      ) : tutoria.temas?.length ? (
                        <div className="tdt-temas">
                          {tutoria.temas.map((tema, index) => (
                            <span key={tema.idTema ?? index} className="tdt-tema-chip">
                              {tema.tema || tema.nombre || String(tema)}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="tdt-temas-empty">No se registraron temas.</p>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="tdt-edit-form">
                    <h3 className="tdt-section-title">Editar tutoria</h3>

                    <div className="tdt-form-grid">
                      <div className="tdt-field">
                        <label className="tdt-label" htmlFor="edit-horario">
                          Horario
                        </label>
                        <select
                          id="edit-horario"
                          className="tdt-input"
                          value={idHorario}
                          onChange={(e) => setIdHorario(e.target.value)}
                        >
                          <option value="">Selecciona un horario</option>
                          {horarios.map((h) => (
                            <option key={h.idHorario} value={h.idHorario}>
                              {h.dia} · {h.horaInicio?.slice(0, 5)} - {h.horaFin?.slice(0, 5)}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="tdt-field">
                        <label className="tdt-label" htmlFor="edit-fecha">
                          Fecha
                        </label>
                        <input
                          id="edit-fecha"
                          type="date"
                          className="tdt-input"
                          value={fecha}
                          min={hoy}
                          onChange={(e) => setFecha(e.target.value)}
                        />
                      </div>

                      <div className="tdt-field">
                        <label className="tdt-label" htmlFor="edit-edificio">
                          Edificio
                        </label>
                        <select
                          id="edit-edificio"
                          className="tdt-input"
                          value={edificio}
                          onChange={(e) => setEdificio(e.target.value)}
                        >
                          <option value="">Selecciona</option>
                          <option value="1">Edificio 1</option>
                          <option value="2">Edificio 2</option>
                        </select>
                      </div>

                      <div className="tdt-field">
                        <label className="tdt-label" htmlFor="edit-aula">
                          Aula
                        </label>
                        <select
                          id="edit-aula"
                          className="tdt-input"
                          value={aula}
                          onChange={(e) => setAula(e.target.value)}
                        >
                          <option value="">Selecciona</option>
                          {Array.from({ length: 16 }, (_, i) => i + 1).map((n) => (
                            <option key={n} value={n}>
                              Aula {n}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="tdt-edit-actions">
                      <button
                        type="button"
                        className="tdt-btn-ghost"
                        onClick={() => setEditMode(false)}
                        disabled={isSubmitting}
                      >
                        Cancelar
                      </button>
                      <button
                        type="button"
                        className="tdt-btn-primary"
                        onClick={handleGuardar}
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? 'Guardando...' : 'Guardar cambios'}
                      </button>
                    </div>
                  </div>
                )}

                {!editMode && esCancelable ? (
                  <div className="tdt-hero-actions">
                    <button
                      type="button"
                      className="tdt-btn-ghost"
                      onClick={() => {
                        setIdHorario('')
                        setEditMode(true)
                      }}
                    >
                      Editar tutoria
                    </button>
                  </div>
                ) : null}
              </article>

              {/* SIDEBAR: acciones rapidas + inscritos */}
              <aside className="tdt-side">
                {esCancelable ? (
                  <div className="tdt-side-card">
                    <h3 className="tdt-side-title">Acciones</h3>

                    {confirmComplete ? (
                      <div className="tdt-confirm success">
                        <p className="tdt-confirm-text">
                          ¿Marcar esta tutoria como completada?
                        </p>
                        <div className="tdt-confirm-actions">
                          <button
                            type="button"
                            className="tdt-btn-ghost"
                            onClick={() => setConfirmComplete(false)}
                            disabled={isSubmitting}
                          >
                            Volver
                          </button>
                          <button
                            type="button"
                            className="tdt-btn-primary"
                            onClick={handleConfirmComplete}
                            disabled={isSubmitting}
                          >
                            {isSubmitting ? 'Marcando...' : 'Si, completar'}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        type="button"
                        className="tdt-btn-primary full"
                        onClick={() => setConfirmComplete(true)}
                        disabled={isSubmitting}
                      >
                        Marcar como completada
                      </button>
                    )}

                    {confirmCancel ? (
                      <div className="tdt-confirm">
                        <p className="tdt-confirm-text">
                          ¿Seguro que quieres cancelar esta tutoria? Los inscritos seran notificados.
                        </p>
                        <div className="tdt-confirm-actions">
                          <button
                            type="button"
                            className="tdt-btn-ghost"
                            onClick={() => setConfirmCancel(false)}
                            disabled={isSubmitting}
                          >
                            Volver
                          </button>
                          <button
                            type="button"
                            className="tdt-btn-danger"
                            onClick={handleConfirmCancel}
                            disabled={isSubmitting}
                          >
                            {isSubmitting ? 'Cancelando...' : 'Si, cancelar'}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        type="button"
                        className="tdt-btn-cancel full"
                        onClick={() => setConfirmCancel(true)}
                        disabled={isSubmitting}
                      >
                        Cancelar tutoria
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="tdt-side-card">
                    <h3 className="tdt-side-title">Estado</h3>
                    <p className="tdt-side-desc">
                      Esta tutoria esta {tutoria.estado?.toLowerCase() || 'finalizada'}.
                      Ya no se pueden hacer cambios.
                    </p>
                  </div>
                )}

                {/* Inscritos */}
                <div className="tdt-side-card">
                  <div className="tdt-inscritos-header">
                    <h3 className="tdt-side-title">Inscritos</h3>
                    <span className="tdt-count">{inscritos.length}</span>
                  </div>

                  {inscritos.length === 0 ? (
                    <p className="tdt-inscritos-empty">Aun no hay inscripciones.</p>
                  ) : (
                    <ul className="tdt-inscritos-lista">
                      {inscritos.map((p, i) => (
                        <li key={p.matricula ?? i} className="tdt-inscrito">
                          <div className="tdt-inscrito-avatar" aria-hidden="true">
                            {(p.nombre || '?').slice(0, 1).toUpperCase()}
                          </div>
                          <div className="tdt-inscrito-info">
                            <span className="tdt-inscrito-nombre">
                              {p.nombre || 'Sin nombre'}
                            </span>
                            <span className="tdt-inscrito-mat">{p.matricula || '—'}</span>
                          </div>
                          {mostrarAsistencia ? (
                            <span
                              className={`tdt-asistio ${p.asistio ? 'si' : 'no'}`}
                            >
                              {p.asistio ? 'Asistio' : 'No asistio'}
                            </span>
                          ) : (
                            <span className="tdt-asistio pending">Pendiente</span>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </aside>
            </div>

            <section className="tdt-comentarios-section">
              <h2 className="tdt-comentarios-title">
                Comentarios de los tutorados
              </h2>
              <p className="tdt-comentarios-sub">
                Sugerencias y observaciones previas a la sesion.
              </p>
              <Comentarios idTutoria={id} modo="lectura" />
            </section>
          </>
        ) : null}
      </main>
    </div>
  )
}

export default TutoriaDetalleTutor
