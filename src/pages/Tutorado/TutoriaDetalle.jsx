import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import Comentarios from '../../features/comentarios/Comentarios'
import { ROUTES } from '../../constants/routes'
import { MIN_MINUTOS_CANCELACION } from '../../constants/tutoria'
import { useAhora } from '../../hooks/useAhora'
import { useTutoriaDetalleTutorado } from '../../hooks/useTutoriaDetalleTutorado'
import { formatTiempoRestante, minutosHasta } from '../../utils/fechas'
import { formatFecha, formatRangoHora, formatTema, SIN_DATO } from '../../utils/formatters'
import { esProgramada, getEstadoClass } from '../../utils/tutoria'
import './tutoriaDetalle.css'

const TutoriaDetalle = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { tutoria, inscripcion, isLoading, error, isSubmitting, inscribirse, cancelarInscripcion } =
    useTutoriaDetalleTutorado(id)

  const [feedback, setFeedback] = useState(null)
  const [confirmCancel, setConfirmCancel] = useState(false)
  const now = useAhora()

  const tutoradoInscrito = Boolean(inscripcion)

  const minutosRestantes = minutosHasta(tutoria?.fecha, tutoria?.horaInicio, now)

  const yaComenzo = minutosRestantes != null && minutosRestantes <= 0
  const tooLateParaCancelar =
    minutosRestantes != null && minutosRestantes <= MIN_MINUTOS_CANCELACION
  const tooLateParaInscribir = yaComenzo

  const handleInscribirse = async () => {
    setFeedback(null)
    const res = await inscribirse()
    setFeedback({ type: res.ok ? 'success' : 'error', text: res.message })
  }

  const handleConfirmCancel = async () => {
    setFeedback(null)
    setConfirmCancel(false)
    const res = await cancelarInscripcion()
    setFeedback({ type: res.ok ? 'success' : 'error', text: res.message })
  }

  const estadoClass = getEstadoClass(tutoria?.estado)
  const noInscribiblePorEstado = !esProgramada(tutoria)
  const noInscribible = noInscribiblePorEstado || tooLateParaInscribir

  return (
    <main className="td-main">
      <button type="button" className="td-back" onClick={() => navigate(-1)} aria-label="Volver">
        ← Volver
      </button>

      {isLoading ? (
        <div className="td-skeleton-wrap">
          <div className="td-skeleton hero" />
          <div className="td-skeleton side" />
        </div>
      ) : error ? (
        <div className="td-error">
          {error}
          <Link to={ROUTES.tutorado.inicio} className="td-error-back">
            Volver a explorar
          </Link>
        </div>
      ) : tutoria ? (
        <div className="td-grid">
          {/* HERO CARD: info de la tutoria */}
          <article className="td-hero">
            <div className="td-hero-header">
              <div className="td-hero-titles">
                <h1 className="td-experiencia">
                  {tutoria.materia || 'Experiencia Educativa sin nombre'}
                </h1>
                {tutoria.nombreTutor ? (
                  <p className="td-tutor">
                    <span className="td-tutor-label">Imparte</span> {tutoria.nombreTutor}
                  </p>
                ) : null}
              </div>
              <span className={`td-estado ${estadoClass}`}>{tutoria.estado || 'SIN ESTADO'}</span>
            </div>

            <div className="td-info-grid">
              <div className="td-info-item">
                <span className="td-info-icon" aria-hidden="true">
                  📅
                </span>
                <div>
                  <span className="td-info-label">Fecha</span>
                  <span className="td-info-value">
                    {formatFecha(tutoria.fecha, { variant: 'larga' })}
                  </span>
                </div>
              </div>

              <div className="td-info-item">
                <span className="td-info-icon" aria-hidden="true">
                  🕐
                </span>
                <div>
                  <span className="td-info-label">Horario</span>
                  <span className="td-info-value">
                    {formatRangoHora(tutoria.horaInicio, tutoria.horaFin)}
                  </span>
                </div>
              </div>

              <div className="td-info-item">
                <span className="td-info-icon" aria-hidden="true">
                  🏛️
                </span>
                <div>
                  <span className="td-info-label">Edificio</span>
                  <span className="td-info-value">{tutoria.edificio ?? SIN_DATO}</span>
                </div>
              </div>

              <div className="td-info-item">
                <span className="td-info-icon" aria-hidden="true">
                  🚪
                </span>
                <div>
                  <span className="td-info-label">Aula</span>
                  <span className="td-info-value">{tutoria.aula ?? SIN_DATO}</span>
                </div>
              </div>
            </div>

            {tutoria.temas?.length ? (
              <div className="td-temas-section">
                <h3 className="td-section-title">Temas a revisar</h3>
                <div className="td-temas">
                  {tutoria.temas.map((tema, index) => (
                    <span key={tema.idTema ?? index} className="td-tema-chip">
                      {formatTema(tema)}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}

            <div className="td-temas-section">
              <h3 className="td-section-title">Comentarios y sugerencias</h3>
              {tutoradoInscrito ? (
                <Comentarios idTutoria={id} modo="tutorado" />
              ) : (
                <>
                  <p className="td-side-desc" style={{ marginBottom: '0.75rem' }}>
                    Inscribete para sugerir temas u observaciones al tutor.
                  </p>
                  <Comentarios idTutoria={id} modo="lectura" />
                </>
              )}
            </div>
          </article>

          {/* SIDEBAR: inscripcion */}
          <aside className="td-side">
            <div className="td-side-card">
              <h3 className="td-side-title">
                {tutoradoInscrito ? 'Tu inscripcion' : 'Inscribirse'}
              </h3>

              {feedback ? (
                <div className={`td-feedback ${feedback.type}`}>{feedback.text}</div>
              ) : null}

              {tutoradoInscrito ? (
                <>
                  <div className="td-status-box">
                    <span className="td-status-dot" aria-hidden="true" />
                    <div>
                      <strong>Estas inscrito</strong>
                      <span>
                        {minutosRestantes != null && minutosRestantes >= 0
                          ? `La tutoria ${formatTiempoRestante(minutosRestantes)}.`
                          : 'Te esperamos en la sesion.'}
                      </span>
                    </div>
                  </div>

                  {yaComenzo ? (
                    <p className="td-side-note">
                      La tutoria ya comenzo. Ya no es posible cancelar.
                    </p>
                  ) : tooLateParaCancelar ? (
                    <p className="td-side-note warn">
                      Solo puedes cancelar con mas de {MIN_MINUTOS_CANCELACION} minutos de
                      anticipacion.
                    </p>
                  ) : confirmCancel ? (
                    <div className="td-confirm">
                      <p className="td-confirm-text">¿Seguro que deseas cancelar tu inscripcion?</p>
                      <div className="td-confirm-actions">
                        <button
                          type="button"
                          className="td-btn-ghost"
                          onClick={() => setConfirmCancel(false)}
                          disabled={isSubmitting}
                        >
                          Mantener
                        </button>
                        <button
                          type="button"
                          className="td-btn-danger"
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
                      className="td-btn-cancel"
                      onClick={() => setConfirmCancel(true)}
                      disabled={isSubmitting}
                    >
                      Cancelar inscripcion
                    </button>
                  )}
                </>
              ) : (
                <>
                  <p className="td-side-desc">
                    {noInscribiblePorEstado
                      ? 'Esta tutoria ya no acepta inscripciones.'
                      : tooLateParaInscribir
                        ? 'La tutoria ya comenzo, no es posible inscribirse.'
                        : `Al inscribirte recibiras una confirmacion por correo y veras esta tutoria en tu lista${
                            minutosRestantes != null && minutosRestantes >= 0
                              ? ` (${formatTiempoRestante(minutosRestantes)})`
                              : ''
                          }.`}
                  </p>

                  <button
                    type="button"
                    className="td-btn-primary"
                    onClick={handleInscribirse}
                    disabled={isSubmitting || noInscribible}
                  >
                    {isSubmitting ? (
                      <>
                        <span className="td-spinner" aria-hidden="true" />
                        Inscribiendo...
                      </>
                    ) : (
                      'Inscribirme'
                    )}
                  </button>
                </>
              )}
            </div>
          </aside>
        </div>
      ) : null}
    </main>
  )
}

export default TutoriaDetalle
