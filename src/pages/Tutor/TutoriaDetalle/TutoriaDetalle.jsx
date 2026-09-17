import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import AppLayout from '../../../components/layout/AppLayout'
import Comentarios from '../../../components/Comentarios'
import useHorarios from '../../../hooks/useHorarios'
import useTutoriaDetalleTutor from '../../../hooks/useTutoriaDetalleTutor'
import { AULAS, EDIFICIOS } from '../../../constants/espacios'
import { MAX_CARACTERES_TEMA, MIN_MINUTOS_CANCELACION } from '../../../constants/tutoria'
import { useAhora } from '../../../hooks/useAhora'
import { hoyLocalISO, minutosHasta } from '../../../utils/fechas'
import {
  formatFecha,
  formatHorario,
  formatRangoHora,
  formatTema,
  getInicial,
  SIN_DATO,
} from '../../../utils/formatters'
import {
  buscarHorarioDeTutoria,
  esProgramada,
  getEstadoClass,
  yaTuvoLugar,
} from '../../../utils/tutoria'
import './tutoriaDetalleTutor.css'

const TemaQuickInput = ({ onAdd, disabled }) => {
  const [draft, setDraft] = useState('')

  const submit = () => {
    if (!draft.trim()) return
    onAdd(draft.slice(0, MAX_CARACTERES_TEMA))
    setDraft('')
  }

  return (
    <div className="tdt-tema-add">
      <input
        type="text"
        className="tdt-tema-add-input"
        placeholder="Escribe un tema nuevo..."
        aria-label="Tema nuevo para esta tutoria"
        value={draft}
        onChange={(e) => setDraft(e.target.value.slice(0, MAX_CARACTERES_TEMA))}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault()
            submit()
          }
        }}
        disabled={disabled}
        maxLength={MAX_CARACTERES_TEMA}
      />
      <button
        type="button"
        className="tdt-tema-add-btn"
        onClick={submit}
        disabled={disabled || !draft.trim()}
        aria-label="Crear tema"
        title="Crear tema"
      >
        +
      </button>
      <span className="tdt-tema-add-count">
        {draft.length}/{MAX_CARACTERES_TEMA}
      </span>
    </div>
  )
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

  const ahora = useAhora()
  const estadoClass = getEstadoClass(tutoria?.estado)
  const esCancelable = esProgramada(tutoria)
  const mostrarAsistencia = yaTuvoLugar(tutoria, ahora)

  // Reglas del backend: solo se completa una tutoria que ya inicio y solo se cancela
  // con mas de MIN_MINUTOS_CANCELACION minutos de anticipacion.
  const minutosParaInicio = minutosHasta(tutoria?.fecha, tutoria?.horaInicio, ahora)
  const puedeCompletar = minutosParaInicio != null && minutosParaInicio <= 0
  const puedeCancelar = minutosParaInicio == null || minutosParaInicio > MIN_MINUTOS_CANCELACION

  const abrirEdicion = () => {
    const horarioActual = buscarHorarioDeTutoria(horarios, tutoria)
    setIdHorario(horarioActual ? String(horarioActual.idHorario) : '')
    setEdificio(String(tutoria.edificio ?? ''))
    setAula(String(tutoria.aula ?? ''))
    setFecha(tutoria.fecha ?? '')
    setFeedback(null)
    setEditMode(true)
  }

  const handleGuardar = async () => {
    setFeedback(null)

    // Se valida antes de convertir: Number('') es 0 y pasaria Number.isFinite.
    if (!idHorario || !edificio || !aula || !fecha) {
      setFeedback({ type: 'error', text: 'Completa todos los campos correctamente.' })
      return
    }

    const payload = {
      idHorario: Number(idHorario),
      edificio: Number(edificio),
      aula: Number(aula),
      fecha,
    }

    if (
      !Number.isFinite(payload.idHorario) ||
      !Number.isFinite(payload.edificio) ||
      !Number.isFinite(payload.aula)
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

  const hoy = hoyLocalISO()

  return (
    <AppLayout className="tdt-page">
      <main className="tdt-main">
        <button type="button" className="tdt-back" onClick={() => navigate('/tutor/home')}>
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
                    <h1 className="tdt-experiencia">
                      {tutoria.materia || 'Experiencia Educativa sin nombre'}
                    </h1>
                    {tutoria.nombreTutor ? (
                      <p className="tdt-tutor">
                        <span className="tdt-tutor-label">Imparte</span> {tutoria.nombreTutor}
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
                        <span className="tdt-info-icon" aria-hidden="true">
                          📅
                        </span>
                        <div>
                          <span className="tdt-info-label">Fecha</span>
                          <span className="tdt-info-value">
                            {formatFecha(tutoria.fecha, { variant: 'larga' })}
                          </span>
                        </div>
                      </div>

                      <div className="tdt-info-item">
                        <span className="tdt-info-icon" aria-hidden="true">
                          🕐
                        </span>
                        <div>
                          <span className="tdt-info-label">Horario</span>
                          <span className="tdt-info-value">
                            {formatRangoHora(tutoria.horaInicio, tutoria.horaFin)}
                          </span>
                        </div>
                      </div>

                      <div className="tdt-info-item">
                        <span className="tdt-info-icon" aria-hidden="true">
                          🏛️
                        </span>
                        <div>
                          <span className="tdt-info-label">Edificio</span>
                          <span className="tdt-info-value">{tutoria.edificio ?? SIN_DATO}</span>
                        </div>
                      </div>

                      <div className="tdt-info-item">
                        <span className="tdt-info-icon" aria-hidden="true">
                          🚪
                        </span>
                        <div>
                          <span className="tdt-info-label">Aula</span>
                          <span className="tdt-info-value">{tutoria.aula ?? SIN_DATO}</span>
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
                                <span key={tema.idTema ?? index} className="tdt-tema-chip editable">
                                  <span className="tdt-tema-chip-text">{formatTema(tema)}</span>
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
                                Aun no hay temas. Crea uno abajo.
                              </span>
                            )}
                          </div>

                          <div className="tdt-tema-add-wrap">
                            <TemaQuickInput onAdd={handleAgregarTema} disabled={isSubmitting} />
                          </div>
                        </>
                      ) : tutoria.temas?.length ? (
                        <div className="tdt-temas">
                          {tutoria.temas.map((tema, index) => (
                            <span key={tema.idTema ?? index} className="tdt-tema-chip">
                              <span className="tdt-tema-chip-text">{formatTema(tema)}</span>
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
                          Horario en el que daras la tutoria
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
                              {formatHorario(h)}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="tdt-field">
                        <label className="tdt-label" htmlFor="edit-fecha">
                          Fecha en que se dara la tutoria
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
                          Edificio donde se dara la tutoria
                        </label>
                        <select
                          id="edit-edificio"
                          className="tdt-input"
                          value={edificio}
                          onChange={(e) => setEdificio(e.target.value)}
                        >
                          <option value="">Selecciona</option>
                          {EDIFICIOS.map((n) => (
                            <option key={n} value={n}>
                              Edificio {n}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="tdt-field">
                        <label className="tdt-label" htmlFor="edit-aula">
                          Aula donde se dara la tutoria
                        </label>
                        <select
                          id="edit-aula"
                          className="tdt-input"
                          value={aula}
                          onChange={(e) => setAula(e.target.value)}
                        >
                          <option value="">Selecciona</option>
                          {AULAS.map((n) => (
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
                    <button type="button" className="tdt-btn-ghost" onClick={abrirEdicion}>
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
                        <p className="tdt-confirm-text">¿Marcar esta tutoria como completada?</p>
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
                      <>
                        <button
                          type="button"
                          className="tdt-btn-primary full"
                          onClick={() => setConfirmComplete(true)}
                          disabled={isSubmitting || !puedeCompletar}
                        >
                          Marcar como completada
                        </button>
                        {!puedeCompletar ? (
                          <p className="tdt-action-hint">
                            Podras marcarla como completada cuando inicie la sesion.
                          </p>
                        ) : null}
                      </>
                    )}

                    {confirmCancel ? (
                      <div className="tdt-confirm">
                        <p className="tdt-confirm-text">
                          ¿Seguro que quieres cancelar esta tutoria? Los inscritos seran
                          notificados.
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
                      <>
                        <button
                          type="button"
                          className="tdt-btn-cancel full"
                          onClick={() => setConfirmCancel(true)}
                          disabled={isSubmitting || !puedeCancelar}
                        >
                          Cancelar tutoria
                        </button>
                        {!puedeCancelar ? (
                          <p className="tdt-action-hint">
                            Solo puedes cancelar con mas de {MIN_MINUTOS_CANCELACION} minutos de
                            anticipacion.
                          </p>
                        ) : null}
                      </>
                    )}
                  </div>
                ) : (
                  <div className="tdt-side-card">
                    <h3 className="tdt-side-title">Estado</h3>
                    <p className="tdt-side-desc">
                      Esta tutoria esta {tutoria.estado?.toLowerCase() || 'finalizada'}. Ya no se
                      pueden hacer cambios.
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
                            {getInicial(p.nombre)}
                          </div>
                          <div className="tdt-inscrito-info">
                            <span className="tdt-inscrito-nombre">{p.nombre || 'Sin nombre'}</span>
                            <span className="tdt-inscrito-mat">{p.matricula || SIN_DATO}</span>
                          </div>
                          {mostrarAsistencia ? (
                            <span className={`tdt-asistio ${p.asistio ? 'si' : 'no'}`}>
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
              <h2 className="tdt-comentarios-title">Comentarios de los tutorados</h2>
              <p className="tdt-comentarios-sub">
                Sugerencias y observaciones previas a la sesion.
              </p>
              <Comentarios idTutoria={id} modo="lectura" />
            </section>
          </>
        ) : null}
      </main>
    </AppLayout>
  )
}

export default TutoriaDetalleTutor
