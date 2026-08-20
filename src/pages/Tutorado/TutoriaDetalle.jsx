import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import AppLayout from '../../components/layout/AppLayout'
import Comentarios from '../../components/Comentarios'
import { useTutoriaDetalleTutorado } from '../../hooks/useTutoriaDetalleTutorado'
import './tutoriaDetalle.css'

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

const MIN_MINUTOS_CANCELACION = 15

const calcularMinutosRestantes = (fecha, horaInicio) => {
  if (!fecha || !horaInicio) return null
  try {
    const inicio = new Date(`${fecha}T${horaInicio}`)
    if (Number.isNaN(inicio.getTime())) return null
    return Math.floor((inicio.getTime() - Date.now()) / 60000)
  } catch {
    return null
  }
}

const formatTiempoRestante = (minutos) => {
  if (minutos == null) return ''
  if (minutos < 0) return 'la tutoria ya inicio'
  if (minutos < 60) return `comienza en ${minutos} min`
  const horas = Math.floor(minutos / 60)
  const resto = minutos % 60
  if (horas < 24) return `comienza en ${horas}h ${resto}m`
  const dias = Math.floor(horas / 24)
  return `comienza en ${dias} dia${dias === 1 ? '' : 's'}`
}

const TutoriaDetalle = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const {
    tutoria,
    inscripcion,
    isLoading,
    error,
    isSubmitting,
    inscribirse,
    cancelarInscripcion,
  } = useTutoriaDetalleTutorado(id)

  const [feedback, setFeedback] = useState(null)
  const [confirmCancel, setConfirmCancel] = useState(false)
  const [now, setNow] = useState(() => Date.now())

  // Tick cada 30s para re-evaluar cuando se acerque la hora
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 30000)
    return () => clearInterval(interval)
  }, [])

  const tutoradoInscrito = Boolean(inscripcion)

  const minutosRestantes = useMemo(
    () => calcularMinutosRestantes(tutoria?.fecha, tutoria?.horaInicio),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [tutoria?.fecha, tutoria?.horaInicio, now],
  )

  const yaInicio = minutosRestantes != null && minutosRestantes <= 0
  const tooLateParaCancelar =
    minutosRestantes != null && minutosRestantes <= MIN_MINUTOS_CANCELACION
  const tooLateParaInscribir = yaInicio

  const handleInscribirse = async () => {
    setFeedback(null)
    const message = await inscribirse()
    const success = !message.toLowerCase().includes('no fue posible') &&
      !message.toLowerCase().includes('error')
    setFeedback({ type: success ? 'success' : 'error', text: message })
  }

  const handleConfirmCancel = async () => {
    setFeedback(null)
    setConfirmCancel(false)
    const message = await cancelarInscripcion()
    const success = !message.toLowerCase().includes('no fue posible') &&
      !message.toLowerCase().includes('error')
    setFeedback({ type: success ? 'success' : 'error', text: message })
  }

  const estadoClass = ESTADO_CLASS[tutoria?.estado?.toUpperCase()] || 'otro'
  const noInscribiblePorEstado = tutoria?.estado?.toUpperCase() !== 'PROGRAMADA'
  const noInscribible = noInscribiblePorEstado || tooLateParaInscribir

  return (
    <AppLayout className="td-page">
      <main className="td-main">
        <button
          type="button"
          className="td-back"
          onClick={() => navigate(-1)}
          aria-label="Volver"
        >
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
            <Link to="/tutorado/home" className="td-error-back">
              Volver a explorar
            </Link>
          </div>
        ) : tutoria ? (
          <div className="td-grid">
            {/* HERO CARD: info de la tutoria */}
            <article className="td-hero">
              <div className="td-hero-header">
                <div className="td-hero-titles">
                  <h1 className="td-materia">{tutoria.materia || 'Materia sin nombre'}</h1>
                  {tutoria.nombreTutor ? (
                    <p className="td-tutor">
                      <span className="td-tutor-label">Imparte</span>{' '}
                      {tutoria.nombreTutor}
                    </p>
                  ) : null}
                </div>
                <span className={`td-estado ${estadoClass}`}>
                  {tutoria.estado || 'SIN ESTADO'}
                </span>
              </div>

              <div className="td-info-grid">
                <div className="td-info-item">
                  <span className="td-info-icon" aria-hidden="true">📅</span>
                  <div>
                    <span className="td-info-label">Fecha</span>
                    <span className="td-info-value">{formatFecha(tutoria.fecha)}</span>
                  </div>
                </div>

                <div className="td-info-item">
                  <span className="td-info-icon" aria-hidden="true">🕐</span>
                  <div>
                    <span className="td-info-label">Horario</span>
                    <span className="td-info-value">
                      {formatHora(tutoria.horaInicio)} – {formatHora(tutoria.horaFin)}
                    </span>
                  </div>
                </div>

                <div className="td-info-item">
                  <span className="td-info-icon" aria-hidden="true">🏛️</span>
                  <div>
                    <span className="td-info-label">Edificio</span>
                    <span className="td-info-value">{tutoria.edificio ?? '—'}</span>
                  </div>
                </div>

                <div className="td-info-item">
                  <span className="td-info-icon" aria-hidden="true">🚪</span>
                  <div>
                    <span className="td-info-label">Aula</span>
                    <span className="td-info-value">{tutoria.aula ?? '—'}</span>
                  </div>
                </div>
              </div>

              {tutoria.temas?.length ? (
                <div className="td-temas-section">
                  <h3 className="td-section-title">Temas a revisar</h3>
                  <div className="td-temas">
                    {tutoria.temas.map((tema, index) => (
                      <span key={tema.idTema ?? index} className="td-tema-chip">
                        {tema.tema || tema.nombre || String(tema)}
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
                  <div className={`td-feedback ${feedback.type}`}>
                    {feedback.text}
                  </div>
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

                    {yaInicio ? (
                      <p className="td-side-note">
                        La tutoria ya comenzo. Ya no es posible cancelar.
                      </p>
                    ) : tooLateParaCancelar ? (
                      <p className="td-side-note warn">
                        Solo puedes cancelar con mas de {MIN_MINUTOS_CANCELACION} minutos de anticipacion.
                      </p>
                    ) : confirmCancel ? (
                      <div className="td-confirm">
                        <p className="td-confirm-text">
                          ¿Seguro que deseas cancelar tu inscripcion?
                        </p>
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
    </AppLayout>
  )
}

export default TutoriaDetalle
