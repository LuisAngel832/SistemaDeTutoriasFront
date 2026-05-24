import { Link } from 'react-router-dom'
import Header from '../../components/Tutor/Header'
import useMisTutorias from '../../hooks/useMisTutorias'
import './home.css'

const ESTADO_CLASS = {
  PROGRAMADA: 'programada',
  COMPLETADA: 'completada',
  CANCELADA: 'cancelada',
}

const formatFecha = (fecha) => {
  if (!fecha) return '—'
  try {
    return new Date(`${fecha}T00:00:00`).toLocaleDateString('es-MX', {
      weekday: 'short',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  } catch {
    return fecha
  }
}

const formatHora = (hora) => (hora ? hora.slice(0, 5) : '—')

const TutoriaCard = ({ tutoria }) => {
  const estadoClass = ESTADO_CLASS[tutoria.estado?.toUpperCase()] || 'otro'

  return (
    <article className="tutoria-card">
      <div className="tutoria-card-top">
        <div>
          <h3 className="tutoria-materia">{tutoria.materia || 'Materia sin nombre'}</h3>
          {tutoria.nombreTutor ? (
            <p className="tutoria-tutor">{tutoria.nombreTutor}</p>
          ) : null}
        </div>
        <span className={`tutoria-estado ${estadoClass}`}>
          {tutoria.estado || 'SIN ESTADO'}
        </span>
      </div>

      <div className="tutoria-info">
        <span className="tutoria-info-label">Fecha:</span>
        <span>{formatFecha(tutoria.fecha)}</span>

        <span className="tutoria-info-label">Horario:</span>
        <span>
          {formatHora(tutoria.horaInicio)} – {formatHora(tutoria.horaFin)}
        </span>

        <span className="tutoria-info-label">Lugar:</span>
        <span>
          Edificio {tutoria.edificio ?? '—'} · Aula {tutoria.aula ?? '—'}
        </span>
      </div>

      {tutoria.temas?.length ? (
        <div className="tutoria-temas">
          {tutoria.temas.map((tema, index) => (
            <span key={tema.idTema ?? index} className="tutoria-tema-chip">
              {tema.tema || tema.nombre || String(tema)}
            </span>
          ))}
        </div>
      ) : null}
    </article>
  )
}

const TutorHome = () => {
  const { tutorias, isLoading, error } = useMisTutorias()

  return (
    <div className="tutor-home-page">
      <Header />

      <main className="tutor-home-main">
        <div className="tutor-home-header">
          <div>
            <h1>Mis Tutorias</h1>
            <p className="tutor-home-subtitle">
              Tutorias que has creado y su estado actual.
            </p>
          </div>
          <Link to="/tutor/crear" className="btn-primary-link">
            + Crear Tutoria
          </Link>
        </div>

        {error ? <div className="tutorias-error">{error}</div> : null}

        {isLoading ? (
          <div className="tutorias-grid">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="tutoria-skeleton" />
            ))}
          </div>
        ) : tutorias.length === 0 && !error ? (
          <div className="tutorias-empty">
            <h3>Aun no tienes tutorias</h3>
            <p>Crea tu primera tutoria para que tus tutorados puedan inscribirse.</p>
            <Link to="/tutor/crear" className="btn-primary-link">
              + Crear mi primera tutoria
            </Link>
          </div>
        ) : (
          <div className="tutorias-grid">
            {tutorias.map((tutoria) => (
              <TutoriaCard key={tutoria.id} tutoria={tutoria} />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

export default TutorHome
